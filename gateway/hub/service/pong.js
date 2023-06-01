/***********************/
/***********************/

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    const start=tools.stamp();
    console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`);

    const res={
        hello:"pong",
        stamp:start,
    }
    
    return res;
};