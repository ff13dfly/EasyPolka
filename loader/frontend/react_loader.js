//!important, This is the loader of launcher such as `Plinth`.
//!important, Need to build, the index.html not support hight version JS

// https://esbuild.github.io/api/
// ../node_modules/.bin/esbuild react_loader.js --bundle --minify --outfile=loader.min.js

//########## USEAGE ##########
//Can load from local file.
//file:///Users/fuzhongqiang/Desktop/loader.html#ppp@ws://127.0.0.1:9944


const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    anchor:     'plinth',
    server:     'ws://127.0.0.1:9944',
};

//get the global
const Polkadot=LP,ApiPromise=Polkadot.ApiPromise,WsProvider=Polkadot.WsProvider;
const anchorJS=LA;
const easyRun=LE.easyRun;

//websocket link to server
let websocket=null;
const self={
    auto: (ck) => {
        if(websocket!==null) return ck && ck();
        self.html(`Ready to link to server ${server}.`,"more");
        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            self.html(`Linker to node [${server}] created.`,"more");
            websocket = api;
            anchorJS.set(api);
            //anchorJS.setKeyring(Keyring);
            return ck && ck();
        });
    },
    decoder:(hash)=>{
        const result={
            anchor:config.anchor, 
            server:config.server,
        }
        if(!hash) return result;
        const arr=hash.split('@');
        if(arr.length===1){
            result.anchor=arr[0].substring(1);
            return result;
        }else{
            result.server=arr.pop();
            const str=arr.join("@");
            result.anchor=str.substring(1);
            return result;
        }
    },
    html:(txt,id)=>{
        const ele=document.getElementById(id);
        const info=document.createTextNode(txt)
        ele.innerHTML='';
        ele.appendChild(info);
    },
    hide:(id)=>{
        const ele=document.getElementById(id);
        ele.style.display = "none";
    },  
}
const result=self.decoder(location.hash);
const linker=`anchor://${result.anchor}/`;
const server=result.server;

self.html(result.anchor,"target");

//console.log(config.success,`Ready to decode Anchor Link : ${linker} .`);
self.auto(()=>{
    const startAPI = {
        common: {
            "latest": anchorJS.latest,
            "target": anchorJS.target,
            "history": anchorJS.history,
            "owner": anchorJS.owner,
            "subcribe": anchorJS.subcribe,
            "block": anchorJS.block,
        }
    };
    
    easyRun(linker,startAPI,(res) => {
        console.log(res);
        if(res.error && res.error.length!==0){
            let txt='';
            for(let i=0;i<res.error.length;i++){
                const row=res.error[i];
                txt+=`${row.level?(row.level+":"):""}${row.error}`;
            }
            
            self.html(txt,"info");
            delete res.error;
            self.html(`${JSON.stringify(res)}`,"root");
            return false;
        }
        
        if(res.libs && res.libs.js){
            const js=res.libs.js;
            try {
                const capp=new Function("API","input","errs",js+(res.code?res.code:""));
                const input={
                    container:"root",
                    from:null,
                    params:{},
                    node:result.server,
                }
                const APIs={
                    anchorJS:anchorJS,
                }
                capp(APIs,input,[]);
            } catch (error) {
                console.log(error);
            }
            
        }

        if(res.libs && res.libs.css){
            const css=res.libs.css;
            const head = document.getElementsByTagName('head')[0];
		    const style = document.createElement('style');
		    const cmap = document.createTextNode(css);
		    style.appendChild(cmap);
		    head.appendChild(style);
        }

        //3.app code
        

        
        //4.information output
        const block=res.location[1],name=res.location[0];
        const key=`${name}_${block}`;
        const anchor=res.data[key];
        self.html(`${name} on ${block.toLocaleString()}, signed by ${anchor.signer}`,"more");
        self.hide("info");
    });
});