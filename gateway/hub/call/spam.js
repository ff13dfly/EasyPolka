/***********************/
/***********************/

// call to get the salt of target account

// Security
// 1. not related to account. That will cause ddos to target account.

const self={
    stamp:()=>{
        return new Date().getTime();
    },
}


module.exports=(method,params,id,address)=>{
    const res={
        success:true,
        stamp:self.stamp(),
    }
    
    return res;
};