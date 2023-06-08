/***********************/
/***********************/

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
    },
}

module.exports=(method,params,id,config,env)=>{
    console.log(`From auto exposed API, params : ${JSON.stringify(params)}`);

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
        if(list.length===0) return resolve({error:"no vService active."});

        //2.select proper vService to call
        const active=list.length===1?list[0]:list[tools.rand(0,list.length-1)];
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

        const reqAuto={
            method: 'post',
            url: active.uri,
            data:self.formatJSON(act,to,id),
        }

        //3. monitor data update
        const mon=DB.key_get(active.uri);
        mon.req+=1;
        mon.last=tools.stamp();

        axios(reqAuto).then((resAuto)=>{
            const rData=resAuto.data;
            if(rData.error) return resolve({error:rData.error});

            const info=rData.result;

            const res={
                data:info,
                stamp:tools.stamp(),
            }

            //4. monitor length data update

            return resolve(res);
        }).catch((err)=>{
            console.log(config.theme.error,err);
            return reject({error:err});
        });
    });
};