/***********************/
/***********************/

// Drop hub server

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    if(method!=="drop") return {error:"illegle request"};

    const start=tools.stamp();
    console.log(`[ drop ] called : ${JSON.stringify(params)}, stamp ${start}`);

    const ks=config.keys;
    DB.key_del(ks.encoded);
    const stamp=tools.stamp;

    const res={
        data:{
            success:true,
        },
        stamp:stamp,
    }
    
    return res;
};