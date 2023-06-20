const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    return new Promise((resolve, reject) => {
        
        setTimeout(()=>{
            const stamp=tools.stamp();
            const res={
                data:{
                    response:stamp,
                    request:params.stamp,
                    cost:stamp-params.stamp,
                },
                success:true,
            }
    
            return resolve(res);
        },tools.rand(0,10));
    });
};