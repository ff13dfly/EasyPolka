/***********************/
/***********************/

// call to reg vService, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do reg vService.
const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");
const axios= require("axios").default;
const encry=require('../../lib/encry');
const {output}=require("../../lib/output");

const self={
    getKeyIV:(secret,salt)=>{
        const md5=encry.md5(secret+salt);
        const key=md5.substring(0,16),iv=md5.substring(16,32);
        return {key:key,iv:iv};
    },
    getMD5:()=>{
        return encry.md5(tools.char(13)+tools.stamp());
    },
    checkAuthority:(token,ks)=>{
        const stamp=tools.stamp();

        const ekey=DB.key_get(ks.encry);
        const s_key=ekey.key,s_iv=ekey.iv;
        encry.setKey(s_key);
        encry.setIV(s_iv);

        const de_token=encry.decrypt(token);
        if(!de_token) return {error:"Illigle authority token."};


        const auth=JSON.parse(de_token);
        output(`Authority:${JSON.stringify(auth)}`);
        const json=DB.key_get(ks.encoded);
        if(json===null){
            return {error:"No authority file."};
        }

        const exp=json.exp;
        output(`Authority on Hub:${JSON.stringify(exp)}`);
        
        if(auth.password!==exp.password){
            return {error:"Illigle authority of pass"};
        }
        if(auth.file!==exp.file){
            return {error:"Illigle authority of file"};
        }

        if(stamp>auth.password){
            return {error:"Expired authority"};
        }
        return true;
    }, 
}

module.exports=(method,params,id,config)=>{
    if(method!=="dock") return {error:"illegle request"};
    
    // const start=tools.stamp();
    // console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`); 

    return new Promise((resolve, reject) => {
        
        //0.check authority
        const ks=config.keys;
        const check=self.checkAuthority(params.token,ks);
        if(check!==true){
            return resolve({error:check.error});
        }

        //1.`knock` the vService to get temp salt
        const uri=params.node;
        const reqKnock={
            method: 'post',
            url: uri+'/hub',
            data:tools.formatJSONRPC("knock",{stamp:tools.stamp()},id),
        }
        axios(reqKnock).then((resKonck)=>{
            if(resKonck.data.error) return resolve({error:resKonck.data.error});
            //2. `reg` with basic information
            const salt=resKonck.data.result.salt,secret=params.secret;
            const obj=self.getKeyIV(secret,salt);
            encry.setKey(obj.key);
            encry.setIV(obj.iv);

            const ks=config.keys;
            const host=DB.key_get(ks.host),sURI=host.service;
            const runner=host.runner;

            const v_token=self.getMD5();
            const data={
                address:runner,
                AES:v_token,            //This token is used to encry the fresh token from vService
                URI:sURI,
            };
            const code=encry.encrypt(JSON.stringify(data));
            
            const reqReg={
                method: 'post',
                url: uri+'/hub',
                data:tools.formatJSONRPC("reg",{
                    salt:salt,
                    encry:code,
                },id),
            }
            axios(reqReg).then((resReg)=>{
                if(resReg.data.error) return resolve({error:resReg.data.error});

                //3. store the status of the vService
                const rData=resReg.data;
                const info=rData.result;
                const stamp=tools.stamp();
                const vs={
                    name:info.name,
                    exposed:info.exposed,
                    test:info.test,
                    token:info.token,
                    AES:v_token,
                    start:stamp,
                    last:stamp,
                    exp:stamp+config.expire.vservice,
                }
                DB.hash_set(ks.nodes,uri,vs);
                DB.key_set(info.token,uri);

                //4. set the monitor of vService
                const mon={
                    flow:0,             //data length
                    req:0,              //request from Hub count
                    failed:0,           //request failed count
                    shuttle:0,          //between vService
                    active:0,           //ping-pong count
                    start:stamp,        //monitor start stamp
                    last:stamp,         //last update stamp
                }
                DB.key_set(uri,mon);

                //delete vs.token;
                //delete vs.AES;
                const res={
                    data:vs,
                    stamp:stamp,
                }
                return resolve(res);
            }).catch((err)=>{
                console.log(config.theme.error,err);
                return resolve({error:'Failed to call vService.'});
            });
        }).catch((err)=>{
            console.log(config.theme.error,err);
            return resolve({error:'Failed to reg vService.'});
        });
    });
};