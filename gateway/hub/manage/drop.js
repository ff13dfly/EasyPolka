/***********************/
/***********************/

// Drop hub server

// Security
// 1. not related to account. That will cause ddos to target account.
const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

module.exports=(method,params,id,address)=>{
    console.log(`From drop API, params : ${JSON.stringify(params)}`);
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