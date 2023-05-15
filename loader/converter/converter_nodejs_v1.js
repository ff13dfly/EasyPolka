//!important, This is the convertor of node.js application.

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/api');


const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    server:"ws://127.0.0.1:9944",
    libs:["node_koa"],
};

const xConfig={
    "libs":{                //libs required by anchor
        "koa":"../../package/node/koa.node",      // 11667.23  6228 4800 3117 5632 319 刘平义
    }
};

// file reader
const fs=require('fs');
const file={
    read:(target,ck,toJSON,toBase64)=>{
        fs.stat(target,(err,stats)=>{
            if (err) return ck && ck({error:err});
            if(!stats.isFile()) return ck && ck(false);
            fs.readFile(target,(err,data)=>{
                if (err) return ck && ck({error:err});
                if(toBase64) return ck && ck(data.toString("base64"));
                if(!toJSON) return ck && ck(data.toString());
                try {
                    const str=data.toString();
                    const json=JSON.parse(str);
                    return ck && ck(json);
                } catch (error) {
                    return ck && ck({error:'Invalid JSON file.'});
                }
            });
        });
    },
};

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
    source:(list,ck,map)=>{
        if(!map) map={};
        if(list.length===0) return ck && ck(map);
        const row=list.pop();
        file.read(row.file+'.js',(code)=>{
            map[row.name]=code;
            return self.source(list,ck,map);
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
}

const target="./koa/gateway.js"
file.read(target,(code)=>{
    const libs=xConfig.libs,list=[];
    for(var k in libs) list.push({name:k,file:libs[k]});

    self.source(list,(map)=>{
        for(var k in libs){
            const lib=libs[k];
            const reg=new RegExp(`require("../${lib}")`,"g");
            console.log(reg);
            code=code.replace(reg,"");
        }
        //const reg=new RegExp(`${k}`,"g");
        //code_js=code_js.replace(reg,cache.resource[k]);
        console.log(code);
        //console.log(map);
    });
    
    
});
