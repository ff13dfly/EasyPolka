/***********************/
/***********************/

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
    
    return JSON.stringify(res);
};