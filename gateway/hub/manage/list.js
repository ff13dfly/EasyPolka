/***********************/
/***********************/

// call to destory the service, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do destory vService.
const self={
    stamp:()=>{
        return new Date().getTime();
    },
}

module.exports=(method,params,id,address)=>{
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