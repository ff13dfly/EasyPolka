/***********************/
/***********************/

// call to reg vService, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do reg vService.
const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");
const axios= require("axios").default;
const encry=require('../lib/encry');

const self={
    formatJSON:(method,params,id)=>{
        console.log(params);
        return {
            "jsonrpc":"2.0",
            "method":method,
            "params":params,
            "id":id,
        }
    },
    getKeyIV:(secret,salt)=>{
        const md5=encry.md5(secret+salt);
        const key=md5.substring(0,16),iv=md5.substring(16,32);
        return {key:key,iv:iv};
    },
    getMD5:()=>{
        return encry.md5(tools.char(13)+tools.stamp());
    },
}

module.exports=(method,params,id,config)=>{
    const start=tools.stamp();
    console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`); 

    return new Promise((resolve, reject) => {
        const uri=params.node;

        //1.`knock` the vService to get temp salt
        const reqKnock={
            method: 'post',
            url: uri+'/hub',
            data:self.formatJSON("knock",{stamp:tools.stamp()},id),
        }
        axios(reqKnock).then((resKonck)=>{
            console.log(`Result of "knock" : ${JSON.stringify(resKonck.data)}`);
            console.log(`Header of "knock" : ${JSON.stringify(resKonck.headers)}`);

            //2. `reg` with basic information
            const salt=resKonck.data.result.salt,secret=params.secret;
            const obj=self.getKeyIV(secret,salt);
            encry.setKey(obj.key);
            encry.setIV(obj.iv);

            const ks=config.keys;
            const runner=DB.key_get(ks.runner);
            console.log(ks);
            const sURI=DB.key_get(ks.hub);
            const v_token=self.getMD5();
            const data={
                hub:runner,
                AES:v_token,
                URI:sURI,
            };
            const code=encry.encrypt(JSON.stringify(data));
            
            const reqReg={
                method: 'post',
                url: uri+'/hub',
                data:self.formatJSON("reg",{
                    salt:salt,
                    encry:code,
                },id),
            }
            console.log(JSON.stringify(reqReg));
            axios(reqReg).then((resReg)=>{
                //console.log(resReg)

                return resolve(resReg);
            }).catch((err)=>{
                console.log(err);
                return reject({error:err});
            });
        }).catch((err)=>{
            console.log(err);
            return reject({error:err});
        });
    });
};