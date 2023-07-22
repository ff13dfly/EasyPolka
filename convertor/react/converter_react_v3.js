//!important, This is the transformer of React project. 
//!important, By dealing with the built package, React project can be deployed to Anchor Network.
//!important, The resource will also be deployed on chain.

//########## USAGE ##########
//node converter_react_v2.js package/config_homepage.json 

const theme = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    dark:       '\x1b[33m%s\x1b[0m',
};

const output=(ctx,type)=>{
    const stamp=()=>{return new Date();};
    if(!type || !theme[type]){
        console.log(`[${stamp()}] `+ctx);
    }else{
        console.log(theme[type],`[${stamp()}] `+ctx);
    }
};

//arguments
const args = process.argv.slice(2);
if(!args[0]) return output("No config file to convert React project.",'error');
const cfgFile=args[0];
output(`Get the config file path, ready to start.`,'dark');


const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/api');
const anchorJS= require('../../package/node/anchor.node');
const fs=require('fs');
output(`Support libraries checked.`,'dark');

const cache={
    "css":[],
    "js":[],
    "resource":{},
}
let websocket=null;

// file functions
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

//convertor functions
const self={
    getSuffix:(str)=>{
        const arr=str.split(".");
        return arr.pop();
    },
    load:(list,folder,ck)=>{
        if(list.length===0) return ck && ck();
        const row=list.pop();
        file.read(`${folder}/${row}`,(str)=>{
            const suffix=self.getSuffix(row);
            cache[suffix].push(str);
            return self.load(list,folder,ck);
        },false);
    },
    resource:(folder,ignor,ck)=>{
        const todo=[],more=[];
        const igsFiles=ignor.files;
        const igsDirs=ignor.folder;
        output(`Ready to load resouce from '${folder}'`);

        //1.get all resource of public folder
        let root=0,static=0;
        if( fs.existsSync(folder) ) {
            const files = fs.readdirSync(folder);
            for(let i=0;i<files.length;i++){
                const fa=files[i];
                const isDir=fs.statSync(`${folder}/${fa}`).isDirectory();
                if(isDir && !igsDirs[fa] && fa!='static'){
                    more.push(fa);
                }
                if(!igsFiles[fa] && !isDir){
                    const tmp=fa.split('.');
                    const suffix=tmp.pop();
                    todo.push({file:`${folder}/${fa}`,suffix:suffix,replace:fa});
                }
            }
            root=todo.length;
            output(`Resource in root folder loaded, total ${root} files.`);
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
                    for(let j=0;j<ts.length;j++){
                        const row=ts[j];
                        const tmp=row.split('.');
                        const suffix=tmp.pop();
                        todo.push({file:`${sub}/${dir}/${row}`,suffix:suffix,replace:`static/${dir}/${row}`});
                    }
                }
            }
            static=todo.length-root;
            output(`Resource in 'static' loaded, total ${static} files.`);
        }

        //3.check other folder
        if(more.length!==0){
            output(`Find resouce folders ${JSON.stringify(more)}`,'success');
            const sysFiles=ignor.system;
            for(let i=0;i<more.length;i++){
                const mdir=`${folder}/${more[i]}`;
                const mfa = fs.readdirSync(mdir);
                let count=0;
                for(let j=0;j<mfa.length;j++){
                    const row=mfa[j];
                    if(sysFiles[row]) continue;
                    const tmp=row.split('.');
                    const suffix=tmp.pop();
                    count++;
                    //console.log({file:`${mdir}/${row}`,suffix:suffix,replace:`${more[i]}/${row}`});
                    //console.log(`${more[i]}/${row}`);
                    todo.push({
                        file:`${mdir}/${row}`,
                        suffix:suffix,
                        replace:`${more[i]}/${row}`,
                        hash:self.char(12,'RS'),
                    });
                }
                output(`Resource in '${more[i]}' loaded, total ${count} files.`);
            }
        }
        output(`Cache resource, total ${todo.length} files.`);
        return self.getTodo(todo,ck);
    },
    getTodo:(list,ck,backup)=>{
        if(backup===undefined) backup=[];
        if(list.length===0) return ck && ck(backup);
       
        const row=list.pop();
       
        file.read(row.file,(res)=>{
            switch (row.suffix) {
                case 'css':
                    cache.css.push(res);
                    row.len=res.length;
                    break;
    
                case 'js':
                    cache.js.push(res);
                    row.len=res.length;
                    break;
    
                default:
                    const type=self.getType(row.suffix);
                    const bs64=`data:${type};base64,${res}`;
                    cache.resource[row.replace]=bs64;
                    row.len=bs64.length;
                    break;
            }
            backup.push(row);
            return self.getTodo(list,ck,backup);
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
    auto: (server,ck) => {
        if(websocket!==null) return ck && ck()
        output(`Ready to link to server ${server}.`,'dark');
        
        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            output(`Linker to node [${server}] created.`,'dark');

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
    calcResource:(todo)=>{
        let len=0;
        for(let i=0;i<todo.length;i++){
            const row=todo[i];
            len+=row.len;
        }
        return len;
    },
    sortList:(todo)=>{
        const list=[];
        const map={};
        for(let i=0;i<todo.length;i++){
            const row=todo[i];
            list.push(row.len);
            map[row.len]=i;
        } 
        list.sort((x,y)=>y-x);

        const nlist=[]
        for(let i=0;i<list.length;i++){
            const key=list[i];
            nlist.push(todo[map[key]]);
        }
        return nlist;
    },

    //"blockmax":3670016,           //3.5MB
    groupResouce:(todo,max)=>{
        //TODO, if single file length < max, should divide to small files, order by hash
        // RSiQtOfXmDaKvS will be [ RSiQtOfXmDaKvS_0, RSiQtOfXmDaKvS_1 ]
        // loader will combine the file

        //if sort, the result is better
        const nlist=self.sortList(todo);    //get the list order by length
        const lenStruct=6                   //`"":"",`, key-value structure length
        const base=2;                       //`{}`, JSON format length

        const group=[{ids:[],len:base}];
        console.log(nlist[0]);

        for(let i=0;i<nlist.length;i++){
            const atom=nlist[i],alen=atom.len+lenStruct+atom.hash.length;
            let arranged=false;

            for(let j=0;j<group.length;j++){
                if(group[j].len+alen<max){
                    group[j].ids.push(i);
                    group[j].len+=alen;
                    arranged=true;
                    break;
                }
            }

            if(!arranged){
                group.push({ids:[],len:base});
                group[group.length-1].ids.push(i);
                group[group.length-1].len+=alen;
            }
        }

        const rlist=[];
        for(let i=0;i<group.length;i++){

        }
        console.log(group);
    },
    rand:(m,n)=>{return Math.round(Math.random() * (m-n) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
    },
};


//1.read xconfig.json to get setting
file.read(cfgFile,(xcfg)=>{
    if(xcfg.error) return output(`Error: failed to load config file "${cfgFile}".`,'error');
    output(`Read the config file successful.`,'success');
    //2.read React asset file
    const target=`${xcfg.directory}/${xcfg.asset}`;
    output(`Read to get asset file '${target}'`);
    file.read(target,(react)=>{
        if(react.error) return output(`Can not load "${asset}".`,'error');;
        output(`Read asset file '${target}' successful.`,'success');

        //3.get target css and js file
        const entry=react.entrypoints;
        output(`Read asset entrypoints : ${JSON.stringify(entry)}`);

        self.load(entry,xcfg.directory,()=>{
            output(`Asset is cached successful.`,'success');

            //4.check the public folder to get resouce and convert to Base64
            // result will be storaged on `cache`
            self.resource(xcfg.directory,xcfg.ignor,(todo)=>{
                //console.log(todo);
                output(`Resource loaded, css ${cache.css[0].length} bytes, js ${cache.js[0].length} bytes.`,'success');
                const rlen=self.calcResource(todo);
                output(`Resource loaded, more ${todo.length} files, ${rlen} bytes.`,'success');

                const group=self.groupResouce(todo,xcfg.blockmax);

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
                if(xcfg.globalVars){
                    const g_list=xcfg.globalVars;
                    for(let i=0;i<g_list.length;i++){
                        const row=g_list[i];
                        const reg=new RegExp(`window.${row}`,"g");
                        code_js=code_js.replace(reg,row);
                    }
                }

                list.push({name:xcfg.name,raw:code_js,protocol:protocol});

                self.auto(xcfg.server,()=>{
                    //console.log(cache);
                    // const seed='Dave';
                    // const ks = new Keyring({ type: 'sr25519' });
                    // const pair= ks.addFromUri(`//${seed}`);

                    // self.multi(list,()=>{
                    //     console.log(`Done, the target Anchor is "${xcfg.name}"`);
                    // },pair);
                });
            });
        });
    },true);
},true);
