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
    return new Promise((resolve, reject) => {
        const uri=params.uri;

        //1.sent salt to target uri
        const salt="abcdefg";
        const cfgKnock={
            method: 'post',
            url: uri+'/hub',
            data: {
                "jsonrpc":"2.0",
                "method":"knock",
                "params":{
                    "salt":salt,
                },
                "id":"hub_ss58_address",
            }
        }
        axios(cfgKnock).then((resKonck)=>{
            const cfgReg={
                method: 'post',
                url: uri+'/hub',
                data: {
                    "jsonrpc":"2.0",
                    "method":"reg",
                    "params":{
                        "name":"gateway name",
                        "token":"new secret",
                    },
                    "id":"hub_ss58_address",
                },
                //headers: {'token': token}
            }
            axios(cfgReg).then((resReg)=>{
                const data={
                    success:true,
                    stamp:self.stamp(),
                };
                const result={
                    data:data,
                    head:null,
                }
                return resolve(result);
            }).catch((err)=>{
                //return {error:err};
                return reject({error:err});
            });

        }).catch((err)=>{
            return reject({error:err});
        });
    });
};