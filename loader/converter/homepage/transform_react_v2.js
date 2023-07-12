//!important, This is the transformer of React object.
//!important, By dealing with the built package, React project can be deployed to Anchor Network

//node transform_react_v2.js xconfig.json package password_for_account
//node transform_react_v2.js xconfig.json package
//node transform_react_v2.js xconfig.json


//package command, `esbuild` needed.
//yarn add esbuild
//../../node_modules/.bin/esbuild transform_react.js --bundle --minify --outfile=reactTransform.js --platform=node

//!important, React Setting Needed.
const anchorJS= require('../../../package/node/anchor.node');
const fs=require('fs');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/api');

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
            "robots.txt":true,
            ".DS_Store":true,
            "anchor.min.js":true,
            "easy.min.js":true,
            "polkadot.min.js":true,
            ".DS_Store":true,
        },
        foler:{
            "js":true,
            "css":true,
        },
    },
    globalVars:["Polkadot","AnchorJS","Easy"],
    server:"ws://127.0.0.1:9944",
    //server:"wss://dev.metanchor.net",
};

//arguments
const args = process.argv.slice(2);
const cfgFile=!args[0]?config.setting:args[0];
const folder=!args[1]?config.folder:args[1];

// file reader
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
        const todo=[];
        const igsFiles=config.ignor.files;
        const igsDirs=config.ignor.foler;

        //1.get all resource of public folder
        if( fs.existsSync(folder) ) {
            const files = fs.readdirSync(folder);
            for(let i=0;i<files.length;i++){
                const fa=files[i];
                if(!igsFiles[fa] && !fs.statSync(`${folder}/${fa}`).isDirectory()){
                    const tmp=fa.split('.');
                    const suffix=tmp.pop();
                    todo.push({file:`${folder}/${fa}`,suffix:suffix,replace:fa});
                }
            }
        }

        //2.get all resource of `static`
        const sub=`${folder}/static`;
        if( fs.existsSync(sub) ) {
            const dirs = fs.readdirSync(sub);
            for(let i=0;i<dirs.length;i++){
                const dir=dirs[i];
                if(!igsDirs[dir]){
                    const target=`${sub}/${dir}`;
                    const ts = fs.readdirSync(target);
                    for(let i=0;i<ts.length;i++){
                        const row=ts[i];
                        const tmp=row.split('.');
                        const suffix=tmp.pop();
                        todo.push({file:`${sub}/${dir}/${row}`,suffix:suffix,replace:`static/${dir}/${row}`});
                    }
                }
            }
        }
        return self.getTodo(todo,ck);
    },
    getTodo:(list,ck)=>{
        //console.log(list);
        if(list.length===0) return ck && ck();
        const row=list.pop();
        console.log(row);

        file.read(row.file,(res)=>{
            //console.log(res);
            switch (row.suffix) {
                case 'css':
                    cache.css.push(res);
                    break;
    
                case 'js':
                    cache.js.push(res);
                    break;
    
                default:
                    const type=self.getType(row.suffix);
                    const bs64=`data:${type};base64,${res}`;
                    cache.resource[row.replace]=bs64;
                    break;
            }
            return self.getTodo(list,ck);
        },false,(row.suffix!=='js'&&row.suffix!=='css')?true:false);
    },
    getType:(suffix)=>{
        const check=suffix.toLocaleLowerCase();
        const img={
            'jpg':'image/jpg',
            'jpeg':'image/jpeg',
            'gif':'image/gif',
            'png':'image/png',
            'svg':'image/svg+xml'
        };
        if(img[check]) return img[check];
        return 'application';
    },
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
};


//1.read xconfig.json to get setting
file.read(cfgFile,(xcfg)=>{
    if(xcfg.error) return console.log(xcfg.error, `Error: failed to load config file "${cfgFile}".`);

    //2.read React asset file
    const asset="asset-manifest.json";
    const target=`${folder}/${asset}`;
    file.read(target,(react)=>{
        if(react.error) return console.log(`Can not load "${asset}".`);
        
        //3.get target css and js file
        const entry=react.entrypoints;
        self.load(entry,()=>{

            //4.check the public folder to get resouce and convert to Base64
            // result will be storaged on `cache`
            self.resource(folder,()=>{
                console.log(`Resource is transformed.`);
                //return false;
                //5.write React project to Anchor Network
                const list=[];
                const related=xcfg.related;
                const ver=xcfg.version;

                //5.1.write css lib
                const protocol_css={"type": "lib","fmt": "css","ver":ver}
                let code_css=cache.css.join(" ");
                code_css=code_css.replace("sourceMappingURL=","")
                list.push({name:related.css,raw:code_css,protocol:protocol_css});

                //5.2.write app anchor
                const ls=[];
                if(xcfg.libs){
                    for(let i=0;i<xcfg.libs.length;i++){
                        ls.push(xcfg.libs[i]);
                    }
                }
                ls.push(related.css);
                const protocol={
                    "type": "app",
                    "fmt": "js",
                    "lib":ls,
                    "ver":ver,
                    "tpl":"react"
                }

                //5.3.clean and merge the code
                //a.remove sourceMapping support
                let code_js=cache.js.join(";");
                code_js=code_js.replace("sourceMappingURL=","")
                for(var k in cache.resource){
                    const reg=new RegExp(`${k}`,"g");
                    code_js=code_js.replace(reg,cache.resource[k]);
                }

                //b.replace the global 
                const g_list=config.globalVars;
                for(let i=0;i<g_list.length;i++){
                    const row=g_list[i];
                   // console.log(`window.${row}`);
                    const reg=new RegExp(`window.${row}`,"g");
                    code_js=code_js.replace(reg,row);
                }
                
                list.push({name:xcfg.name,raw:code_js,protocol:protocol});

                self.auto(()=>{
                    const seed='Dave';
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
