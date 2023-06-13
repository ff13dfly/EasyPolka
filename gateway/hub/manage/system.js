/***********************/
/***********************/

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    if(method!=="system") return {error:"illegle request"};

    // const start=tools.stamp();
    // console.log(`[ system ] called : ${JSON.stringify(params)}, stamp ${start}`);

    return new Promise((resolve, reject) => {
        const ks=config.keys;
        
        //1.The runner status, if there is the json file.
        const runner=DB.key_get(ks.encoded);

        //2.vService status (A.alive time; B.request times; C.the flow; )
        const mon=DB.key_get(ks.monitor);

        //3.excutor status
        //const exe=DB.key_get(ks.excutor);

        const status={
            uploaded:!runner?false:true,
            expire:!runner?false:runner.exp,
            monitor:mon,
        }
        
        const result={
            data:{
                raw:DB.dump(),
                status:status,
            },
            stamp:tools.stamp(),
        }
        
        return resolve(result);
    }); 
};