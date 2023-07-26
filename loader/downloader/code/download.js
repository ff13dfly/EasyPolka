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
    auto: (server,ck) => {
        if (websocket !== null) return ck && ck();
        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            websocket = api;
            anchorJS.set(api);
            return ck && ck();
        });
    },
    html: (id, txt) => {
        const ele = document.getElementById(id);
        const info = document.createTextNode(txt);
        ele.appendChild(info);
    },
    value:(id)=>{
        const ele = document.getElementById(id);
        return ele.value;
    },
    stamp: () => {
        return new Date().toLocaleString();
    },
    getServer: () => {
        return config.server;
    },
}



const evs={
    onClick:(id)=>{
        const val=self.value(id);
        const server = self.getServer();
        self.auto(server,() => {
            self.html("output","Linked to websocket");
        });
    }
}