/***********************/
/***********************/

// call to reg vService, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do reg vService.
const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");
const axios= require("axios").default;

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

module.exports=(method,params,id,address)=>{
    const start=tools.stamp();
    console.log(`[ dock ] called : ${JSON.stringify(params)}, stamp ${start}`); 

    return new Promise((resolve, reject) => {
        const uri=params.node;
        const info={from:""};
        const token="AES string, including hub name";
        const cfgKnock={
            method: 'post',
            url: uri+'/hub',
            data:self.formatJSON("knock",{token:token,stamp:tools.stamp()},id),
        }

        axios(cfgKnock).then((resKonck)=>{
            console.log(`Result of "knock" : ${JSON.stringify(resKonck.data)}`);
            console.log(`Header of "knock" : ${JSON.stringify(resKonck.headers)}`);

            return resolve(resKonck);

        }).catch((err)=>{
            return reject({error:err});
        });
    });
};