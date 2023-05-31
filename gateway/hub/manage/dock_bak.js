/***********************/
/***********************/

// call to reg vService, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do reg vService.
const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");

const self={
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
    const start=tools.stamp();
    console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`); 
    const check=DB.key_get(params.uri);
    //if(check!==null) return  {error:"vService registered."};
    
    console.log(check);

    return new Promise((resolve, reject) => {
        const uri=params.uri;
        const salt=tools.char(10);
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
            const sent_encry = jsonwebtoken.sign({from:"hub",stamp:tools.stamp()}, edata.token, {expiresIn: '3h'}); 
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
                    stamp:tools.stamp(),
                    token:token,
                };
                const result={
                    data:data,
                    head:null,
                }
                const end=tools.stamp();
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