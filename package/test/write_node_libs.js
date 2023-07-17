const { ApiPromise, WsProvider } = require('../node/polkadot.node.js');
const { Keyring } = require('../node/polkadot.node.js');
const anchorJS = require('../node/anchor.node.js');

const fs=require('fs');

//basic config for Loader
const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    folder:     "../node",
    server:     "ws://127.0.0.1:9944",
    //server:     "wss://dev.metanchor.net",
};
// file reader
const file={
    read:(target,ck)=>{
        fs.stat(target,(err,stats)=>{
            if (err) return ck && ck({error:err});
            if(!stats.isFile()) return ck && ck(false);
            fs.readFile(target,(err,data)=>{
                if (err) return ck && ck({error:err});
                return ck && ck(data.toString());
            });
        });
    },
    multi:(list,ck,map)=>{
        if(!map) map={};
        if(list.length===0) return ck && ck(map);
        const row=list.pop();
        file.read(`${config.folder}/${row.file}`,(code)=>{
            map[row.key]=code;
            return file.multi(list,ck,map);
        });
    },
};

const libs={
    "anchorjs":"anchor.node.js",
    "polkadot":"polkadot.node.js",
    "easy":"easy.node.js",
    "koa":"koa.node.js",
    //"koa_router":"koa-router.node.js",
}

let websocket=null;
const self={
    auto: (ck) => {
        if(websocket!==null) return ck && ck();
        const server=config.server;
        console.log(`Ready to link to server ${server}.`);

        
        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            console.log(config.success,`Linker to node [${server}] created.`);

            websocket = api;
            
            anchorJS.set(api);
            anchorJS.setKeyring(Keyring);
            return ck && ck();
        });
    },
    multi:(list,ck,pair)=>{
        if(list.length===0) return ck && ck();
        const row=list.shift();
        console.log(`\nWriting lib anchor : ${row.name}`);
        const strProto=typeof(row.protocol)=='string'?row.protocol:JSON.stringify(row.protocol);
        const raw=typeof(row.raw)=='string'?row.raw:JSON.stringify(row.raw);
        anchorJS.write(pair,row.name,raw,strProto,(res)=>{
            console.log(`Processing : ${row.name}, protocol ( ${strProto.length} bytes ) :${strProto}`);
            console.log(res);
            if(res.step==="Finalized"){
                self.multi(list,ck,pair);
            }
        });
    },
    load:(map,ck)=>{
        const list=[];
        for(var k in map){
            const row=map[k];
            list.push({file:row,key:k});
        }
        file.multi(list,ck);
    },
};

self.load(libs,(codes)=>{
    self.auto(()=>{
        const seed='Alice';
        const ks = new Keyring({ type: 'sr25519' });
        const pair= ks.addFromUri(`//${seed}`);

        const list=[];
        for(let k in codes){
            const code=codes[k];
            list.push({name:'node_'+k,raw:code,protocol:{"type": "lib","fmt": "js","ver":"1.0.0"}});
        }

        self.multi(list,()=>{
            console.log(`\n-------------------------------------\nDone, libs write to Anchor Network`);
        },pair);
    });
});
