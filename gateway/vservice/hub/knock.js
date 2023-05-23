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
    //console.log(params);
    console.log(server);

    const result={
        data:{
            token:"temp_token",
        },
        head:{},
        stamp:self.stamp(),
    }
    
    return result;
};