//!important, This is the convertor of node.js application.

//########## USAGE ##########
//node converter_nodejs_v1.js node_config.json

//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild koa/gateway.js --minify --outfile=koa/gateway.min.js --platform=node

const theme = {
    error: '\x1b[31m%s\x1b[0m',
    success: '\x1b[36m%s\x1b[0m',
    primary: '\x1b[33m%s\x1b[0m',
    dark: '\x1b[90m%s\x1b[0m',
};
const end=()=>{
    console.log(theme.dark,`************************* NodeJS Convertor End *************************\n`);
};

console.log(theme.dark,`\n********** NodeJS convertor for Anchor Network, version 1.0.0 **********`);
const args = process.argv.slice(2);
if(!args[0]){
    console.log(theme.error,`No config file to convert project.\n`);
    return end();
}

const fs=require('fs');
const anchorJS= require('../../package/node/anchor.node');
const { ApiPromise, WsProvider } = require('../../package/node/polkadot.node');
const { Keyring } = require('../../package/node/polkadot.node');

const cfile=args[0];
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
    auto: (config,ck) => {
        if(!config.autowrite) return ck && ck();
        if(websocket!==null) return ck && ck();
        const server=config.server;

        console.log(`Ready to link to server ${server}.`);
        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            console.log(theme.success,`Linker to node [${server}] created.`);
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
    getPrepair:(libs,name,symbol)=>{
        let str=`var ${name}={`;
        for(var anchor in libs){
            const row=libs[anchor];
            str+=`"${anchor}":${symbol[0]}${row.anchor}${symbol[1]},`;
        }
        str+='};';
        return str;
    },
    getTarget:(obj)=>{
        if(obj.single) return obj.single;
        if(obj.folder && obj.folder) return obj.folder+obj.folder;
        return false;
    },
}

// convertor logical
return file.read(cfile,(config)=>{
    if(config.error){
        console.log(theme.error,config.error);
        return end();
    } 
    self.auto(config,()=>{
        const target=self.getTarget(config.target);
        file.read(target,(code)=>{
            if(code.error){
                console.log(theme.error,code.error);
                return end();
            } 
            


        });
    });
    
},true)

return false;

const target="./koa/gateway.min.js"
file.read(target,(code)=>{
    //console.log(code);

    const libs=xConfig.libs;

    const Gname=config.name;
    const pre=self.getPrepair(libs,Gname,config.symbol);
    let final=pre+code;

    const alist=[];
    for(var k in libs){
        const lib=libs[k];
        const replace=`${config.name}["${k}"]`;
        final=final.replace(`require("${lib.file}")`,replace);
        alist.push(lib.anchor);
    }
    console.log(final);
    console.log(alist);

    const list=[];
    const protocol={
        "type": "app",
        "fmt": "js",
        "lib":alist,
        "ver":"1.0.1",
        "tpl":"nodejs"
    }
    list.push({name:xConfig.name,raw:final,protocol:protocol});

    self.auto(()=>{
        const seed='Dave';
        const ks = new Keyring({ type: 'sr25519' });
        const pair= ks.addFromUri(`//${seed}`);

        self.multi(list,()=>{
            console.log(`Done, the target Anchor is "${xConfig.name}"`);
        },pair);
    });
});
