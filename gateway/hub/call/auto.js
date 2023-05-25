/***********************/
/***********************/

// only exposed method to allow call vService.

// Security
// 1. check the name of service. Check all parameters by definition.
// 2. forbiden all password and write operation on Hub itself.
const DB=require("../../lib/mndb.js");

const self={
    stamp:()=>{
        return new Date().getTime();
    },
}

module.exports=(method,params,id,address)=>{
    console.log(`Here: ${method}, params : ${JSON.stringify(params)}`);
    const res={
        data:"hello world",
        success:true,
        stamp:self.stamp(),
    }
    
    return res;
};