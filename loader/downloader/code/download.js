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
}
const result = self.decoder(location.hash);
const linker = `anchor://${result.anchor}/`;
const server = result.server;

self.version(config.version, "ver");
self.step(`Info: Anchor Network server ${server}`, () => {
    self.step(`Info: ready to load ${result.anchor}`, () => {
        self.auto(() => {
           
        });
    });
});