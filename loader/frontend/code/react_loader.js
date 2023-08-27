//!important, This is the loader of launcher such as `Plinth`.
//!important, Need to build, the index.html not support hight version JS

//########## USEAGE ##########
//Can load from local file.
//file:///Users/fuzhongqiang/Desktop/loader.html#ppp@ws://127.0.0.1:9944

//########## BUILD ##########
// https://esbuild.github.io/api/
// ../node_modules/.bin/esbuild react_loader.js --bundle --minify --outfile=loader.min.js

const config = {
    error: '\x1b[36m%s\x1b[0m',
    success: '\x1b[36m%s\x1b[0m',
    anchor: 'plinth',
    server: 'ws://127.0.0.1:9944',
    version: '1.0.2',
    step: 300,
};

//get the global
const Polkadot = LP, ApiPromise = Polkadot.ApiPromise, WsProvider = Polkadot.WsProvider;
const anchorJS = LA;
const easyRun = LE.easyRun;

//websocket link to server
let websocket = null;
const self = {
    auto: (ck) => {
        if (websocket !== null) return ck && ck();
        self.step(`Ready to link to server ${server}.`, () => {
            ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
                self.step(`Linker to node [${server}] created.`, () => {
                    websocket = api;
                    anchorJS.set(api);
                    return ck && ck();
                });
            });
        });
    },
    decoder: (hash) => {
        const result = {
            anchor: config.anchor,
            server: config.server,
            block:0,
        }
        const last=hash.charAt(hash.length-1);
        if (!hash || last!=="#") return result;
        const arr = hash.split('@');
        if (arr.length === 1) {
            result.anchor = arr[0].substring(1);
            result.anchor=result.anchor.substring(0,result.anchor.length-1);
        } else {
            result.server = arr.pop();
            result.server=result.server.substring(0,result.server.length-1);
            const str = arr.join("@");
            result.anchor = str.substring(1);
            //result.anchor=result.anchor.substring(0,result.anchor.length-1);
        }

        //TODO, bad way to target sepcial block, mixed with JSON key way.
        // const tmp = hash.split('|');
        // if (tmp.length === 2) {
        //     const block=parseInt(tmp[1]);
        //     if(!isNaN(block) && block>0)result.block=block;
        //     result.anchor=tmp[0].substring(1);
        // }
        result.anchor=decodeURIComponent(result.anchor);
        
        return result;
    },
    html: (txt, id) => {
        const ele = document.getElementById(id);
        const info = document.createTextNode(txt)
        ele.innerHTML = '';
        ele.appendChild(info);
    },
    version: (ver, cls) => {
        const eles = document.getElementsByClassName(cls);
        for (let i = 0; i < eles.length; i++) {
            const ele = eles[i];
            const info = document.createTextNode(ver);
            ele.innerHTML = '';
            ele.appendChild(info);
        }
    },
    hide: (id) => {
        if (Array.isArray(id)) {
            for (let i = 0; i < id.length; i++) {
                const ch = document.getElementById(id[i]);
                ch.style.display = "none";
            }
        } else {
            const ele = document.getElementById(id);
            ele.style.display = "none";
        }
    },
    step: (txt, ck, at) => {
        //if(config.step===0) return ck && ck();
        const id = "step";
        const ele = document.getElementById(id);
        const info = document.createTextNode(`[${self.stamp()}] ${txt}`);
        const br = document.createElement("br");
        ele.appendChild(info);
        ele.appendChild(br);
        setTimeout(ck, !at ? config.step : at);
    },
    stamp: () => {
        return new Date().toLocaleString();
    },
    groupResource:(list)=>{
        const raw={},group={},divide={}
        for(let i=0;i<list.length;i++){
            const row=list[i];
            if(row.raw!==null){
                try {
                    const json=JSON.parse(row.raw);
                    for(var k in json){
                        raw[k]=json[k];
                        const arr=k.split("_");
                        if(arr.length===2){
                            if(!group[arr[0]]) group[arr[0]]=[];
                            group[arr[0]].push(parseInt(arr[1]));
                            divide[arr[0]]=row.name;
                        }else{
                            group[k]=row.name;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        const map={}
        for(let k in group){
            if(!Array.isArray(group[k])){
                map[`${group[k]}|${k}`]=raw[k];
            }else{
                let str='';
                for(let i=0;i<group[k].length;i++){
                    str+=raw[`${k}_${i}`]
                }
                map[`${divide[k]}|${k}`]=str;
            }
        }
        return map;
    },
}

console.log(location);

const result = self.decoder(location.hash);
let linker = `anchor://${result.anchor}/`;
if(result.block!==0) linker+=result.block;
const server = result.server;
console.log(linker);

self.version(config.version, "ver");
self.step(`Anchor Network server ${server}`, () => {
    const ready_text=result.block!==0?
        `Ready to load ${result.anchor} on ${result.block}`:
        `Ready to load the latest ${result.anchor}`;
    self.step(ready_text, () => {
        self.auto(() => {
            const startAPI = {
                common: {
                    "latest": anchorJS.latest,
                    "target": anchorJS.target,
                    "history": anchorJS.history,
                    "owner": anchorJS.owner,
                    "subcribe": anchorJS.subcribe,
                    "multi":anchorJS.multi,
                    "block": anchorJS.block,
                },
                agent:{
                    "process":(txt)=>{
                        self.step(txt);
                    },
                },
            };
            self.step(`Anchor decoded, ready to load.`, () => {
                easyRun(linker, startAPI, (res) => {
                    if (res.error && res.error.length !== 0) {
                        let txt = '';
                        for (let i = 0; i < res.error.length; i++) {
                            const row = res.error[i];
                            txt += `${row.level ? (row.level + ":") : ""}${row.error}`;
                        }
                        self.step(txt);
                        delete res.error;
                        self.step(`Result: ${JSON.stringify(res)}`);
                        return false;
                    }

                    self.step(`Ready to show details`, () => {
                        const block = res.location[1], name = res.location[0];
                        const key = `${name}_${block}`;
                        const anchor = res.data[key];
                        self.html(`${name} on ${block.toLocaleString()}, signed by ${anchor.signer}`, "more");

                        if(res.call!==undefined || anchor.protocol.type ==='app'){
                            
                        }else{
                            return self.step(`Not application Anchor, the data as follow: `, () => {
                                self.step(`${JSON.stringify(anchor)}`);
                            });
                        }
                        

                        self.step(`Load successful,ready to run.`, () => {
                            const js = (res.libs && res.libs.js) ? res.libs.js : "";
                            let code=res.code ? res.code : "";
                            //console.log(code);
                            if(res.resource && res.raw){
                                self.step(`Combining the resouce files to application.`);
                                const kv=self.groupResource(res.raw);
                                for(var k in kv){
                                    code = code.replaceAll(`anchor://${k}`, kv[k]);
                                }
                            }

                            try {
                                const capp = new Function("API", "input", "errs", js + code);
                                const input = {
                                    container: "root",
                                    from: null,
                                    params: {},
                                    node: result.server,
                                }
                                const APIs = {
                                    anchorJS: anchorJS,
                                }

                                let count = 3;
                                self.step(`Application loaded, run in ${count}s.`);
                                const ttt = setInterval(() => {
                                    count--;
                                    self.step(`Application loaded, run in ${count}s.`);
                                    if (count < 0) {
                                        clearInterval(ttt);
                                        if (res.libs && res.libs.css) {
                                            const css = res.libs.css;
                                            const head = document.getElementsByTagName('head')[0];
                                            const style = document.createElement('style');
                                            const cmap = document.createTextNode(css);
                                            style.appendChild(cmap);
                                            head.appendChild(style);
                                        }
                                        self.hide(["step", "info"]);
                                        capp(APIs, input, []);
                                    }
                                }, 1000);
                            } catch (error) {
                                self.step(`Failed to load cApp.`);
                                self.step(`Error: ${error}`);
                            }
                        });
                    });
                });
            });
        });
    });
});