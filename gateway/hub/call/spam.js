/***********************/
/***********************/

// call to get the salt of target account

// Security
// 1. not related to account. That will cause ddos to target account.
const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    //TODO, record the request to avoid DDOS
    //1.log the request to avoid DDOS
    const spam=tools.char(8);
    const stamp=tools.stamp();
    DB.key_set(spam,{stamp:stamp,more:{}});
    const res={
        spam:spam,
        stamp:stamp,
    }
    return res;
};