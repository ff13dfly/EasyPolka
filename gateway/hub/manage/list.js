/***********************/
/***********************/

// call to destory the service, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do destory vService.

const tools=require("../../lib/tools");
const DB=require("../../lib/mndb");

module.exports=(method,params,id,config)=>{
    return new Promise((resolve, reject) => {
        const ks=config.keys;
        const raw=DB.hash_all(ks.nodes);
        
        const router={}
        for(let URI in raw){
            const row=raw[URI];
            if(!router[row.name]) router[row.name]={funs:null,nodes:[]}
            if(router[row.name].funs===null)router[row.name].funs=row.exposed;
            router[row.name].nodes.push(URI);
        }

        const list=[];
        for(let name in router){
            const row=router[name];
            row.name=name;
            list.push(row);
        }
        
        const result={
            data:list,
            head:null,
            stamp:tools.stamp(),
        }
        
        return resolve(result);
    }); 
};