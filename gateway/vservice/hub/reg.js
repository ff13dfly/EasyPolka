/***********************/
/***********************/

const JWT=require("jsonwebtoken");
const DB=require("../../lib/mndb");

const self={
    stamp:()=>{
        return new Date().getTime();
    },
}

module.exports=(req,server)=>{
    console.log(server);

    const result={
        data:{
            success:true,
        },
        head:{},
        stamp:self.stamp(),
    }
    
    return result;
};