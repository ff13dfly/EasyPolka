const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");

//1.remove invalid vService
//2.regroup code

module.exports=(method,params,id,config)=>{
    return new Promise((resolve, reject) => {
        const calc_time=tools.rand(0,10);
        setTimeout(()=>{
            const stamp=tools.stamp();
            const res={
                data:{
                    response:stamp,
                    request:params.stamp,
                    index:params.index,
                    cost:stamp-params.stamp,
                    calc:calc_time,
                },
                success:true,
            }
    
            return resolve(res);
        },calc_time);
    });
};