/***********************/
/***********************/

// call to reg vService, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do reg vService.

const self={
    stamp:()=>{
        return new Date().getTime();
    },
}
const axios= require("axios").default;

module.exports=(method,params,id,address)=>{
    console.log({method,params,id,address});

    const uri=params.uri;

    //1.sent salt to target uri
    const salt="abcdefg";
    const cfgKnock={
        method: 'post',
        url: uri,
        data: {
            "jsonrpc":"2.0",
            "method":"knock",
            "params":{
                "salt":salt,
            },
            "id":"hub_ss58_address",
        },
        //headers: {'token': token}
    }
    axios(cfgKnock).then((result)=>{
        console.log(result.data);
        const cfgReg={
            method: 'post',
            url: uri,
            data: {
                "jsonrpc":"2.0",
                "method":"knock",
                "params":{
                    "salt":salt,
                },
                "id":"hub_ss58_address",
            },
            //headers: {'token': token}
        }
        axios(cfgReg).then((final)=>{
            return JSON.stringify(final);
        }).catch((err)=>{
            return {error:err};
        });

    }).catch((err)=>{
        return {error:err};
    });
};