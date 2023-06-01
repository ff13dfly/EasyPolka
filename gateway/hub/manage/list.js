/***********************/
/***********************/

// call to destory the service, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do destory vService.

const tools=require("../../lib/tools");
const DB=require("../../lib/mndb");

module.exports=(method,params,id,config)=>{
    const ks=config.keys;
    const list=DB.hash_all(ks.nodes);

    console.log(list);

    return new Promise((resolve, reject) => {
        const map={
            "vHistory":{
                "vh-101":{},
                "vh-1024":{},
            },
            "vMarket":{
                "vh-101":{},
                "vh-1024":{},
            },
        }

        const result={
            data:map,
            head:null,
            stamp:tools.stamp(),
        }
        
        return resolve(result);
    }); 
};