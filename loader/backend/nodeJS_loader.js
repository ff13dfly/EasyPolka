//!important, This is a node.js loader demo, to load `node on-chain application`.
//!important, The breif rule is treating it as cache service and can be stopped anytime.
//!important, Load unkown `node on-chain application` will face security problem.

//node demo_loader.js anchor://node_me/ ws://127.0.0.1:9944

//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild nodeJS_loader.js --bundle --minify --outfile=nodeJS.loader.min.js --platform=node
//node nodeJS.loader.min.js anchor://node_me/ ws://127.0.0.1:9944

//basic config for Loader
const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
};

//arguments
const args = process.argv.slice(2);
if(!args[0]) return console.log(config.error, `Error: no input Anchor Link.`);
const linker=args[0];
const server=!args[1]?"ws://127.0.0.1:9944":args[1];

//library needed
const { anchorJS } = require('./lib/anchor.js');

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
}

//load target anchor as application 
console.log(config.success,`Ready to decode Anchor Link : ${linker} .`);
self.auto(()=>{
    const { easyRun } = require('./lib/easy.js');
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
    
    easyRun(linker,startAPI,(result) => {
        //!important, these functions limit the application
        //setup the APIs for application.
        const API={
            anchorJS:anchorJS,      //Anchor network library
            easy:easyRun,           //Easy Protocol
            polka:()=>{},           //Polkadot library
            ether:()=>{},           //Etherum library
            //more:()=>{},          //More library
        }

        //setup input of application
        const input={
            target:linker,
        }
        
        //app struct. Need to limit `eval` and `new Function`.
        const pa='API',pb='input',pc='errs';
        const str=`;(function(${pa},${pb},${pc}){${result.code}})(${pa},${pb},${pc})`;
        try {
            const cApp = new Function(pa, pb, pc,str);
            console.log(config.success,`Application ready.`);
            return cApp(API,input,result.error);
        } catch (error) {
            console.log(config.error, `Error: failed to load application from ${linker}.`);
        }
    });
});