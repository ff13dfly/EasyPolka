/***********************/
/***********************/

// call to destory the service, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do destory vService.

module.exports=(method,params,id,address)=>{
    
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
    
    return JSON.stringify(map);
};