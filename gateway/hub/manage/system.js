/***********************/
/***********************/

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    console.log(`From system API, params : ${JSON.stringify(params)}`);
    return new Promise((resolve, reject) => {
        const data=DB.dump();

        //1.The runner status, if there is the json file.
        //2.vService status (A.alive time; B.request times; C.the flow; )

        const result={
            data:data,
            stamp:tools.stamp(),
        }
        
        return resolve(result);
    }); 
};