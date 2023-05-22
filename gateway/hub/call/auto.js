/***********************/
/***********************/

// only exposed method to allow call vService.

// Security
// 1. check the name of service. Check all parameters by definition.
// 2. forbiden all password and write operation on Hub itself.

module.exports=(method,params,id,address)=>{
    console.log({method,params,id,address});
};