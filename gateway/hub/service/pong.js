const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry = require('../../lib/encry');

module.exports=(method,params,id,config)=>{
    if(method!=="pong") return {error:"illegle request"};
    const start=tools.stamp();
    console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`);
    const uri=DB.key_get(params.token);
    const svc=DB.hash_get(config.keys.nodes,uri);
    if(!svc || svc===null){
        return {error:"No active vService."};
    }

    //1.decode to get the new token
    const md5=svc.AES;
    const key=md5.substring(0,16),iv=md5.substring(16,32);
    encry.setKey(key);
    encry.setIV(iv);
    const token=encry.decrypt(params.fresh);

    DB.key_del(svc.token);      //remove the token-to-vService key

    //2.encode the new AES 
    const stamp=tools.stamp();
    const nMD5=encry.md5(tools.char(3)+stamp);
    svc.AES=nMD5;
    svc.token=token;
    svc.last=stamp;
    svc.exp=stamp+config.expire.vservice;
    const code=encry.encrypt(nMD5);
    
    DB.key_set(token,uri);

    //3.update monitor data
    //3.1.vService details
    const mon=DB.key_get(uri);
    mon.active+=1;
    mon.last=stamp;

    //3.2.Hub details
    const mon_hub=DB.key_get(config.keys.monitor);
    mon_hub.active+=1;

    const res={
        data:{
            AES:code,
        },
        stamp:start,
    }
    
    return res;
};