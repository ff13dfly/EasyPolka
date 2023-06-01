/***********************/
/***********************/

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry=require('../lib/encry');

module.exports=(method,params,id,config)=>{
    //console.log(`From upload API, params : ${JSON.stringify(params)}`);
    const ks=config.keys;
    const ekey=DB.key_get(ks.encry);
    const s_key=ekey.key,s_iv=ekey.iv;
    encry.setKey(s_key);
    encry.setIV(s_iv);
    const de_file=encry.decrypt(params.file);

    try {
        const json=JSON.parse(de_file);
        DB.key_set(ks.encoded,json);
    } catch (error) {
        
    }

    const spam=tools.char(13);
    const stamp=tools.stamp();
    DB.key_set(spam,{stamp:stamp,more:{}});
    const res={
        hello:"uploading",
        spam:spam,
        stamp:stamp,
    }
    
    return res;
};