/***********************/
/***********************/

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");

const self={
    autoDrop:(ks)=>{
        const json=DB.key_get(ks.encoded);
        if(json===null) return true;

        const exp=json.exp;
        const stamp=tools.stamp();
        console.log(`Checking, now ${stamp}, exp ${exp.file}`);

        if(stamp>exp.file){
            DB.key_del(ks.encoded);
        }
    },
}

module.exports=(method,params,id,config)=>{
    if(method!=="system") return {error:"illegle request"};

    // const start=tools.stamp();
    // console.log(`[ system ] called : ${JSON.stringify(params)}, stamp ${start}`);
    self.autoDrop(config.keys);        //drop JSON file if it is expired.
    
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