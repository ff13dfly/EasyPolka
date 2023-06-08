/***********************/
/***********************/

// Drop hub server

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

module.exports=(method,params,id,address)=>{
    if(method!=="drop") return {error:"illegle request"};

    const start=tools.stamp();
    console.log(`[ drop ] called : ${JSON.stringify(params)}, stamp ${start}`);

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