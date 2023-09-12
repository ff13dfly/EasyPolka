/***********************/
/***********************/

// call to destory the service, need to confirm the authority.
// when run `Hub`, will storage the encry JSON file of root, need password to do destory vService.

const tools=require("../../lib/tools");
const DB=require("../../lib/mndb");
const {output}=require("../../lib/output");

const self={
    autoDrop:(ks)=>{
        const json=DB.key_get(ks.encoded);
        if(json===null) return true;

        const exp=json.exp;
        const stamp=tools.stamp();
        output(`Checking, now ${stamp}, exp ${exp.file}`);

        if(stamp>exp.file){
            DB.key_del(ks.encoded);
        }
    },
}

module.exports=(method,params,id,config)=>{
    if(method!=="list") return {error:"illegle request"};

    // const start=tools.stamp();
    // console.log(`[ list ] called : ${JSON.stringify(params)}, stamp ${start}`);
    self.autoDrop(config.keys);        //drop JSON file if it is expired.

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