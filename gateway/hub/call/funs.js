/***********************/
/***********************/

// Service list which can be accessed.

const self={
    stamp:()=>{
        return new Date().getTime();
    },
}

module.exports=(method,params,id,config)=>{
    
    console.log(`From system API, params : ${JSON.stringify(params)}`);
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
            stamp:self.stamp(),
        }
        return resolve(result);
    }); 
};