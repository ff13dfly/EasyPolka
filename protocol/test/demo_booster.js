//node demo_booster.js anchor://node_me/

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/api');
const { anchorJS } = require('../lib/anchor.js');
const { easyRun } = require('../dist/easy.js');

const args = process.argv.slice(2);

const config = {
    color: '\x1b[36m%s\x1b[0m',
    endpoint: "ws://127.0.0.1:9944"
};

let websocket=null;
const self={
    auto: (ck) => {
        if(websocket!==null) return ck && ck();
        ApiPromise.create({ provider: new WsProvider(config.endpoint) }).then((api) => {
            console.log('Linker to substrate node created...');
            websocket = api;

            anchorJS.set(api);
            anchorJS.setKeyring(Keyring);
            return ck && ck();
        });
    },
}


if(!args[0]) return console.log(config.color, `Error: no input Anchor Link.`);

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

self.auto(()=>{
    easyRun(args[0],startAPI,(result) => {
        //console.log(result);
        const API={
            anchorJS:anchorJS,
            easy:easyRun
        }

        const input={
            target:args[0],
        }
    
        const pa='API',pb='input',pc='errs';
        const str=`;(function(${pa},${pb},${pc}){${result.code}})(${pa},${pb},${pc})`;
        const cApp = new Function(pa, pb, pc,str);
    
        cApp(API,input,result.error);
    });
});