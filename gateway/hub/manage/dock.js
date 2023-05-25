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
    formatJSON:(method,params,id)=>{
        return {
            "jsonrpc":"2.0",
            "method":method,
            "params":params,
            "id":id,
        }
    }
}
const axios= require("axios").default;
const jsonwebtoken = require('jsonwebtoken');
// const {JSONRPCServer} = require("json-rpc-2.0");
// const jServer = new JSONRPCServer();

module.exports=(method,params,id,address)=>{
    const start=self.stamp();
    console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`); 
    const check=DB.key_get(params.uri);
    //if(check!==null) return  {error:"vService registered."};
    
    console.log(check);

    return new Promise((resolve, reject) => {
        const uri=params.uri;
        const salt=self.char(10);
        DB.key_set(uri,salt);
        //map[salt]=uri;
        console.log(`${uri} temp salt : ${salt}`)

        //1.sent salt to target uri
        const cfgKnock={
            method: 'post',
            url: uri+'/hub',
            data:self.formatJSON("knock",{salt:salt,stamp:self.stamp()},id),
        }

        axios(cfgKnock).then((resKonck)=>{
            console.log(`Result of "knock" : ${JSON.stringify(resKonck.data)}`);
            console.log(`Header of "knock" : ${JSON.stringify(resKonck.headers)}`);
            const encry=resKonck.headers.encry;
            const edata=jsonwebtoken.verify(encry,salt);

            //TODO, here to check the response encry data.
            console.log(edata);
            const record=DB.key_get(edata.uri);
            console.log(record);

            const token=resKonck.data.result.token;
            const sent_encry = jsonwebtoken.sign({from:"hub",stamp:self.stamp()}, edata.token, {expiresIn: '3h'}); 
            const cfgReg={
                method: 'post',
                url: uri+'/hub',
                data:self.formatJSON("reg",{"name":"gateway name"},id),
                headers: {'encry': sent_encry}
            }
            axios(cfgReg).then((resReg)=>{
                console.log(`Result of "reg" : ${JSON.stringify(resReg.data)}`);
                const data={
                    success:true,
                    stamp:self.stamp(),
                    token:token,
                };
                const result={
                    data:data,
                    head:null,
                }
                const end=self.stamp();
                console.log(`[ dock ] response : ${JSON.stringify(result)} , stamp : ${end}, cost : ${end-start}\n`);
                return resolve(result);
            }).catch((err)=>{

                console.log(`[ dock ] response : ${JSON.stringify({error:err})}\n`);
                return reject({error:err});
            });

        }).catch((err)=>{
            return reject({error:err});
        });
    });
};