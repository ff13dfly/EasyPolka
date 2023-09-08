//########## USAGE ##########
//node writer.js libs_front.json
//node writer.js libs_node.json

console.clear();
const version = "1.0.0";
const theme = {
    error: '\x1b[36m%s\x1b[0m',
    success: '\x1b[36m%s\x1b[0m',
    dark: '\x1b[33m%s\x1b[0m',
};
const output = (ctx, type, skip) => {
    const stamp = () => { return new Date().toLocaleString(); };
    if (!type || !theme[type]) {
        if (skip) return console.log(ctx);
        console.log(`[${stamp()}] ` + ctx);
    } else {
        if (skip) return console.log(theme[type], ctx);
        console.log(theme[type], `[${stamp()}] ` + ctx);
    }
};

output(`-------------------------------- Anchor Network Writer ( v${version} ) --------------------------------`, "", true);
output("\n-- Deploy the React project on Anchor Network.", "", true);
output("-- Node.js needed, run this convertor by node, then the deployment will be done.", "", true);
output("-- Config file needed, use the file name as the second parameter.", "", true);
output("-- Shell : ", "", true);
output("-- node writer.js config.json", "success", true);
output("-- Config file details : https://github.com/ff13dfly/EasyPolka/****** ", "", true);
output("\n---------------------------------------- Proccess start ---------------------------------------------\n", "", true);

//will remove
const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    folder:     "../frontend",
    server:     "ws://127.0.0.1:9944",
    //server:     "wss://dev.metanchor.net",
};

const args = process.argv.slice(2);
if (!args[0]) return output("No config file to convert React project.", 'error');
const cfgFile = args[0];
output(`Get the config file path, ready to start.`, 'dark');

const anchorJS = require('./node/anchor.node.js');
const fs=require('fs');

return false;

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
    "anchorjs":"anchor.min.js",
    "polkadot":"polkadot.min.js",
    "easy":"easy.min.js",
}

let websocket=null;
const self={
    auto: (ck) => {
        if(websocket!==null) return ck && ck();
        const server=config.server;
        console.log(`Ready to link to server ${server}.`);
        const { ApiPromise, WsProvider } = require('@polkadot/api');
        const { Keyring } = require('@polkadot/api');
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
        const seed='Dave';
        const { Keyring } = require('@polkadot/api');
        const ks = new Keyring({ type: 'sr25519' });
        const pair= ks.addFromUri(`//${seed}`);

        const list=[];
        for(let k in codes){
            const code=codes[k];
            list.push({name:k,raw:code,protocol:{"type": "lib","fmt": "js","ver":"1.0.0"}});
        }

        self.multi(list,()=>{
            console.log(`\n-------------------------------------\nDone, libs write to Anchor Network`);
        },pair);
    });
});
