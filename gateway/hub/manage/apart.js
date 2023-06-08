/***********************/
/***********************/

// call to destory the service, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do destory vService.

const DB=require("../../lib/mndb");
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
}

module.exports=(method,params,id,config)=>{
    console.log(`From apart API, params : ${JSON.stringify(params)}`);
    
    return new Promise((resolve, reject) => {
        
        const stamp=tools.stamp();

        //1.decode token to confirm
        const ks=config.keys;
        const ekey=DB.key_get(ks.encry);
        const s_key=ekey.key,s_iv=ekey.iv;
        encry.setKey(s_key);
        encry.setIV(s_iv);
        const de_token=encry.decrypt(params.token);
        if(!de_token) return reject({error:"Illigle authority"});

        const auth=JSON.parse(de_token);
        console.log(`Authority:${JSON.stringify(auth)}`);
        if(!auth.exp){
            return reject({error:"Illigle authority"});
        }

        if(stamp>auth.exp){
            //1.1.remove the json file and reset the `key` and `iv`
            return reject({error:"Expired authority"});
        }

        //2.clear the storage and notification vService
        const uri=params.node;

        
        
        const nodes=DB.hash_all(ks.nodes);
        const info=nodes[uri];
        //3.1.prepare the vService call data
        const token=info.token;

        //2.2.remove token map
        // DB.key_set(info.token,uri);
        DB.key_del(info.token);

        //2.3.remove monitor data
        // DB.key_set(uri,mon);
        DB.key_del(uri);

        //2.1.remove nodes information
        // DB.hash_set(ks.nodes,uri,vs);
        delete nodes[uri];
        

        //3.tell vService the apart
        const reqUnlink={
            method: 'post',
            url: uri+'/hub',
            data:self.formatJSON("unlink",{stamp:tools.stamp(),token:token},id),
        }
        axios(reqUnlink).then((resUnlink)=>{
            //console.log(resUnlink);
            const res=resUnlink.data;
            console.log(res);
            if(res.error) return reject({error:res.error});

            const result={
                data:{success:true,raw:res.result},
                stamp:tools.stamp(),
            }
            return resolve(result);

        }).catch((err)=>{
            console.log(config.theme.error,err);
            return reject({error:err});
        });

        
    }); 
};