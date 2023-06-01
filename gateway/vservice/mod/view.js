/***********************/
/***********************/
const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");

module.exports=(method,params,id,address)=>{
    const res={
        data:{
            "good":"this is from vService.",
        },
        success:true,
        stamp:tools.stamp(),
    }
    
    return res;
};