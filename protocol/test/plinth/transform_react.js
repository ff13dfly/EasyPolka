//!important, This is the transformer of React object.
//!important, By dealing with the built package, React project can be deployed to Anchor Network

//node transform_react.js demo_anchor ws://127.0.0.1:9944 build
//node transform_react.js demo_anchor ws://127.0.0.1:9944 
//node transform_react.js demo_anchor

//node transform_react.js xconfig.json package password_for_account
//node transform_react.js xconfig.json package
//node transform_react.js xconfig.json


//package command, `esbuild` needed.
//yarn add esbuild
//../../node_modules/.bin/esbuild transform_react.js --bundle --minify --outfile=reactTransform.js --platform=node

//!important, React Setting Needed.
const { anchorJS } = require('../../lib/anchor.js');

const fs=require('fs');

//basic config for Loader
const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    setting:    'xconfig.json',
    folder:     'package',                //default project folder
    ignor:{     //ignore default files, add addtional files to resource
        files:{
            "asset-manifest.json":true,
            "favicon.ico":true,
            "index.html":true,
            "manifest.json":true,
            "logo192.png":true,
            "logo512.png":true,
        },
        foler:{
            "js":true,
            "css":true,
        },
    },
    server:"ws://127.0.0.1:9944",
};

//arguments
const args = process.argv.slice(2);
const cfgFile=!args[0]?config.setting:args[0];
const folder=!args[1]?config.folder:args[1];

//const folder=!args[2]?config.target:args[2];
//const server=!args[1]?"ws://127.0.0.1:9944":args[1];

// file reader
const file={
    read:(target,ck,toJSON)=>{
        fs.stat(target,(err,stats)=>{
            if (err) return ck && ck({error:err});
            if(!stats.isFile()) return ck && ck(false);
            fs.readFile(target,(err,data)=>{
                if (err) return ck && ck({error:err});
                const str=data.toString();
                if(!toJSON) return ck && ck(str);
                try {
                    const json=JSON.parse(str);
                    return ck && ck(json);
                } catch (error) {
                    return ck && ck({error:'Invalid JSON file.'});
                }
            });
        });
    },
    remove:(path,sub)=>{
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(fa,index){
                var curPath = path + "/" + fa;
                if(fs.statSync(curPath).isDirectory()) {
                    file.remove(curPath,true);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            if(sub) fs.rmdirSync(path);
        }
    },
    
};

const cache={
    "css":[],
    "js":[],
    "resource":{},
}

let websocket=null;
const self={
    getSuffix:(str)=>{
        const arr=str.split(".");
        return arr.pop();
    },
    load:(list,ck)=>{
        if(list.length===0) return ck && ck();
        const row=list.pop();
        
        file.read(`${folder}/${row}`,(str)=>{
            //console.log(str);
            const suffix=self.getSuffix(row);
            cache[suffix].push(str);
            return self.load(list,ck);
        },false);
    },
    resource:(folder,ck)=>{
        //TODO, here to load all resource, convert to base64 then replace.

        return ck && ck();
    },
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
};



file.read(cfgFile,(xcfg)=>{
    if(xcfg.error) return console.log(xcfg.error, `Error: failed to load config file "${cfgFile}".`);

    const asset="asset-manifest.json";
    const target=`${folder}/${asset}`;
    file.read(target,(react)=>{
        if(react.error) return console.log(`Can not load "${asset}".`);
        
        const entry=react.entrypoints;
        self.load(entry,()=>{
            self.resource(folder,()=>{
                console.log(`Resource is transformed.`);

                

                const list=[];
                const related=xcfg.related;
                const ver=xcfg.version;

                //1.write css lib
                //TODO, replace the resource here.
                const protocol_css={"type": "lib","fmt": "css","ver":ver}
                list.push({name:related.css,raw:cache.css.join(" "),protocol:protocol_css});

                //2.write js lib
                const protocol_js={"type": "lib","fmt": "js","ver":ver}
                list.push({name:related.js,raw:cache.js.join(";"),protocol:protocol_js});

                //3.write app anchor
                const protocol={
                    "type": "app",
                    "fmt": "js",
                    "lib":[related.css,related.js],
                    "ver":ver,
                    "tpl":"react"
                }
                const code=``;
                list.push({name:xcfg.name,raw:code,protocol:protocol});
                self.auto(()=>{
                    const seed='Dave';
                    const { Keyring } = require('@polkadot/api');
                    const ks = new Keyring({ type: 'sr25519' });
                    const pair= ks.addFromUri(`//${seed}`);

                    self.multi(list,()=>{
                        console.log(`Done, the target Anchor is "${xcfg.name}"`);
                    },pair);
                });
            });
        });
    },true);
},true);
