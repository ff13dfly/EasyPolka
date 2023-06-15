/***********************/
/***********************/

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry=require('../../lib/encry');

module.exports=(method,params,id,config)=>{
    if(method!=="upload") return {error:"illegle request"};

    // const start=tools.stamp();
    // console.log(`[ upload ] called : ${JSON.stringify(params)}, stamp ${start}`);

    const ks=config.keys;
    const ekey=DB.key_get(ks.encry);
    const s_key=ekey.key,s_iv=ekey.iv;
    encry.setKey(s_key);
    encry.setIV(s_iv);
    const de_file=encry.decrypt(params.file);

    try {
        const json=JSON.parse(de_file);
        const stamp=tools.stamp();
        json.exp={
            file:stamp+config.expire.encry,
        }
        json.start=stamp;
        DB.key_set(ks.encoded,json);

    } catch (error) {
        return {error:error};
    }
    const stamp=tools.stamp();
    const res={
        data:{
            success:true,
        },
        success:true,
        stamp:stamp,
    }
    
    return res;
};