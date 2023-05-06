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
    decoder:(hash)=>{
        const result={
            anchor:'plinth',                    //default launcher
            server:'ws://127.0.0.1:9944',       //default server
        }

        const arr=hash.split('@');
        result.server=arr.pop();
        result.anchor=arr[0].substring(1);
        return result;
    },
}
const result=self.decoder(location.hash);
console.log(result);
const linker=`anchor://${result.anchor}/`;
const server=result.server;

//load target anchor as application 
console.log(config.success,`Ready to decode Anchor Link : ${linker} .`);
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
        //console.log(res);
        const js=res.libs.js;
        const css=res.libs.css;
        eval(js);

        const head = document.getElementsByTagName('head')[0];
		const style = document.createElement('style');
		const cmap = document.createTextNode(css);
		style.appendChild(cmap);
		head.appendChild(style);
        
    });
});