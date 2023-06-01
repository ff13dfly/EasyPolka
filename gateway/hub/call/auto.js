/***********************/
/***********************/

// only exposed method to allow call vService.

// Security
// 1. check the name of service. Check all parameters by definition.
// 2. forbiden all password and write operation on Hub itself.

const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");
const axios= require("axios").default;

const self={
    formatJSON:(method,params,id)=>{
        console.log(params);
        return {
            "jsonrpc":"2.0",
            "method":method,
            "params":params,
            "id":id,
        }
    },
}

module.exports=(method,params,id,config)=>{
    console.log(`Here: ${method}, params : ${JSON.stringify(params)}`);

    return new Promise((resolve, reject) => {
        //1.prepare the vService list
        const list=[];
        const nodes=DB.hash_all(config.keys.nodes);
        for(var uri in nodes){
            const row=nodes[uri];
            if(row.name===params.svc){
                list.push({uri:uri,token:row.token})
            }
        }
        console.log(list);
        if(list.length===0) return resolve({error:"no vService active."});

        const active=list.length===1?list[0]:list[0];

        const act=params.act;
        const to={};
        for(var k in params){
            if( k==="svc"
                || k==="act"
                || k==="spam"
                || k==="token"
                || k==="callback"
                || k==="_"
            ) continue;
            to[k]=params[k];
        }
        to.token=active.token;

        //if(!uri) return reject({error:"no vService active."});

        const reqAuto={
            method: 'post',
            url: active.uri,
            data:self.formatJSON(act,to,id),
        }
        axios(reqAuto).then((resAuto)=>{
            const rData=resAuto.data;
            const info=rData.result;
            const res={
                data:info,
                stamp:tools.stamp(),
            }
            return resolve(res);
        }).catch((err)=>{
            console.log(config.theme.error,err);
            return reject({error:err});
        });
    });
};