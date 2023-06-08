/***********************/
/***********************/

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry=require('../../lib/encry');

module.exports=(method,params,id,config)=>{
    if(method!=="handshake") return {error:"illegle request"};

    // const start=tools.stamp();
    // console.log(`[ handshake ] called : ${JSON.stringify(params)}, stamp ${start}`);

    const ks=config.keys;
    const host=DB.key_get(ks.host);
    const runner=host.runner;

    //1.decode by runner address
    const md5=encry.md5(runner);
    const key=md5.substring(0,16),iv=md5.substring(16,32);
    encry.setKey(key);
    encry.setIV(iv);
    const de_result=encry.decrypt(params.code);
    if(!de_result){
        return {error:"No authority to access."}
    }

    //2.get the client `key` and `iv` to encode server `key` and `iv`
    const arr=de_result.split(".");
    encry.setKey(arr[0]);
    encry.setIV(arr[1]);

    const s_key=tools.char(16),s_iv=tools.char(16);
    DB.key_set(ks.encry,{key:s_key,iv:s_iv});

    const security=encry.encrypt(`${s_key}.${s_iv}`);
    const stamp=tools.stamp();
    const result={
        data:{
            token:security,
            encry:de_result,
        },
        stamp:stamp,
    }
    
    return result;
};