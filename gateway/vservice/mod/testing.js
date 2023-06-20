const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");

module.exports=(method,params,id,config)=>{
    return new Promise((resolve, reject) => {
        const res={
            data:{
                "good":"this is from vService.",
            },
            success:true,
            stamp:tools.stamp(),
        }

        setTimeout(()=>{
            return resolve(res);
        },tools.rand(0,200));
    });
};