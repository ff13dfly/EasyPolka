const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry = require('../lib/encry');

module.exports=(method,params,id,config)=>{
    if(method!=="pong") return {error:"illegle request"};
    const start=tools.stamp();
    console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`);
    const uri=DB.key_get(params.token);
    const svc=DB.hash_get(config.keys.nodes,uri);
    //console.log(svc);

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

    const res={
        data:{
            AES:code,
        },
        stamp:start,
    }
    
    return res;
};