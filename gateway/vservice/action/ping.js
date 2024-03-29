const DB = require("../../lib/mndb");
const tools = require("../../lib/tools");
const axios= require("axios").default;
const encry = require('../../lib/encry');
const { output } = require("../../lib/output");

const self = {
    ping:(list,ck,ts)=>{
        if(!ts) ts={};
        if(list.length===0) return ck && ck(ts);
        const row=list.pop();
        const fresh=tools.char(16);
        //ts[row.address]=fresh;
        //console.log(row);

        //1. encry the new salt to sent to Hub (as spam, hub will call with this)
        const md5=row.AES;
        const key=md5.substring(0,16),iv=md5.substring(16,32);
        encry.setKey(key);
        encry.setIV(iv);
        const code=encry.encrypt(fresh);
        //console.log({key,iv,code,md5,fresh})

        const data={
            fresh:code,
            token:row.active,
        };
        //console.log(data);
        const reqPing={
            method: 'post',
            url: row.URI,
            data:self.formatJSON("pong",data,`autofresh_${tools.stamp()}`),
        }
        axios(reqPing).then((res)=>{
            const json=res.data;
            const AES=encry.decrypt(json.result.AES);

            //fresh token-Hub map
            DB.key_del(row.active);
            DB.key_set(fresh,row.URI);

            ts[row.URI]={
                active:fresh,
                AES:AES,
            }
            
            return self.ping(list,ck,ts);
        }).catch((err)=>{
            output(err,"error",true);
            return self.ping(list,ck,ts);
        });
    },
    formatJSON:(method,params,id)=>{
        //console.log(params);
        return {
            "jsonrpc":"2.0",
            "method":method,
            "params":params,
            "id":id,
        }
    },
}

let active=null;                 //two tast: 1. SN ; 2. Fresh AES token
module.exports = (config) => {
    if(active===null) active=setInterval(()=>{
        output(`---------------------------- auto fresh ----------------------------`,"success",true);
        const hubs=DB.hash_all(config.keys.hubs);
        //console.log(hubs);
        if(hubs===null){
            output(`No active Hub linked yet.`,"error",true);
            return true;
        }

        const list=[];
        for(let k in hubs){
            list.push(hubs[k]);
        }
        self.ping(list,(ts)=>{

            for(var k in ts){
                const row=ts[k];
                hubs[k]["AES"]=row.AES;
                hubs[k]["active"]=row.active;
            }
            output(`All hubs active.`,"success",true);
        });
        output(`---------------------------- auto fresh ----------------------------\n`,"success",true);
    //},3000);
    },config.timer.ping);
};