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
        }
        if (!hash) return result;
        const arr = hash.split('@');
        if (arr.length === 1) {
            result.anchor = arr[0].substring(1);
            return result;
        } else {
            result.server = arr.pop();
            const str = arr.join("@");
            result.anchor = str.substring(1);
            return result;
        }
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
        const info = document.createTextNode(txt);
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
            self.step(`Info: anchor decoded, ready to load.`, () => {
                easyRun(linker, startAPI, (res) => {
                    if (res.error && res.error.length !== 0) {
                        let txt = '';
                        for (let i = 0; i < res.error.length; i++) {
                            const row = res.error[i];
                            txt += `${row.level ? (row.level + ":") : ""}${row.error}`;
                        }

                        //self.html(txt,"info");
                        self.step(txt);
                        delete res.error;
                        self.html(`${JSON.stringify(res)}`, "root");
                        return false;
                    }
                    
                    self.step(`Info: Ready to show details`, () => {
                        const block = res.location[1], name = res.location[0];
                        const key = `${name}_${block}`;
                        const anchor = res.data[key];
                        self.html(`${name} on ${block.toLocaleString()}, signed by ${anchor.signer}`, "more");

                        self.step(`Load successful,ready to run.`, () => {
                            if (res.libs && res.libs.js) {
                                const js = res.libs.js;
                                try {
                                    const capp = new Function("API", "input", "errs", js + (res.code ? res.code : ""));
                                    const input = {
                                        container: "root",
                                        from: null,
                                        params: {},
                                        node: result.server,
                                    }
                                    const APIs = {
                                        anchorJS: anchorJS,
                                    }
                                    self.step(`Application loaded, run in 3s.`, () => {
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
                                    }, 3000);
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        });
                    });
                });
            });
        });
    });
});