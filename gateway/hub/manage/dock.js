/***********************/
/***********************/

// call to reg vService, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do reg vService.
const DB=require("../../lib/mndb.js");

const self={
    stamp:()=>{
        return new Date().getTime();
    },
    rand:(m,n)=>{return Math.floor(Math.random() * (m-n+1) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
    },
}
const axios= require("axios").default;

module.exports=(method,params,id,address)=>{
    console.log(`[ dock ] called : ${JSON.stringify(params)}`); 

    return new Promise((resolve, reject) => {
        const uri=params.uri;
        const salt=self.char(10);
        DB.key_set(uri,salt);
        console.log(`${uri} temp salt : ${salt}`)

        //1.sent salt to target uri
        const cfgKnock={
            method: 'post',
            url: uri+'/hub',
            data: {
                "jsonrpc":"2.0",
                "method":"knock",
                "params":{
                    "salt":salt,
                },
                "id":id,
            }
        }
        axios(cfgKnock).then((resKonck)=>{
            //console.log(resKonck);
            console.log(`Result of "knock" : ${JSON.stringify(resKonck.data)}`);
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
                    "id":id,
                },
                //headers: {'token': token}
            }
            axios(cfgReg).then((resReg)=>{
                //console.log(resReg);
                console.log(`Result of "reg" : ${JSON.stringify(resReg.data)}`);
                const data={
                    success:true,
                    stamp:self.stamp(),
                    salt:salt,
                };
                const result={
                    data:data,
                    head:null,
                }
                console.log(`[ dock ] response : ${JSON.stringify(result)}\n`);
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