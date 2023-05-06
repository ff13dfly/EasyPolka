//!important, This is the loader of launcher such as `Plinth`.
//!important, Need to build, the index.html not support hight version JS

//../node_modules/.bin/esbuild react_loader.js --bundle --minify --outfile=loader.min.js

//Can load from local file.
//file:///Users/fuzhongqiang/Desktop/loader.html#ppp@ws://127.0.0.1:9944

//library needed
const { anchorJS } = require('../lib/anchor.js');

const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
};

//websocket link to server
let websocket=null;
const self={
    auto: (ck) => {
        if(websocket!==null) return ck && ck();
        self.html(`Ready to link to server ${server}.`,"more");
        const { ApiPromise, WsProvider } = require('@polkadot/api');
        const { Keyring } = require('@polkadot/api');
        

        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            self.html(`Linker to node [${server}] created.`,"more");
            websocket = api;
            
            anchorJS.set(api);
            anchorJS.setKeyring(Keyring);
            return ck && ck();
        });
    },
    decoder:(hash)=>{
        const result={
            anchor:'plinth',                    //default launcher
            server:'ws://127.0.0.1:9944',       //default server
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
    const { easyRun } = require('../lib/easy.js');
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
        //1.need to check the result;
        const js=res.libs.js;
        const css=res.libs.css;
        eval(js);

        const head = document.getElementsByTagName('head')[0];
		const style = document.createElement('style');
		const cmap = document.createTextNode(css);
		style.appendChild(cmap);
		head.appendChild(style);

        //2.information output
        const block=res.location[1],name=res.location[0];
        const key=`${name}_${block}`;
        const anchor=res.data[key];

        self.html(`${name} on ${block.toLocaleString()}, signed by ${anchor.signer}`,"more");
        self.hide("info");
    });
});