/***********************/
/***********************/

// call to destory the service, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do destory vService.

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    console.log(`From apart API, params : ${JSON.stringify(params)}`);
    
    return new Promise((resolve, reject) => {
        const result={
            data:{hello:"apart function"},
            head:null,
            stamp:tools.stamp(),
        }
        return resolve(result);
    }); 
};