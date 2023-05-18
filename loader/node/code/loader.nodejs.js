//!important, This is a node.js loader demo, to load `node on-chain application`.
//!important, The breif rule is treating it as cache service and can be stopped anytime.
//!important, Load unkown `node on-chain application` will face security problem.

//########## USEAGE ##########
//node nodeJS_loader.js anchor://node_hello/ ws://127.0.0.1:9944
//node nodeJS.min.js anchor://node_me/ ws://127.0.0.1:9944

//########## BUILD ##########
//../node_modules/.bin/esbuild loader.nodejs.js --minify --outfile=runner.min.js --platform=node



//basic config for Loader
const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    symbol:     ["%{{%","%}}%"],
    check:      false,                  //save check.js to run by node and test
};
console.log(config.success, `\n********************** Anchor Network Loader proccess start ***********************`);

const fs=require('fs');

//arguments
const args = process.argv.slice(2);
if(!args[0]) return console.log(config.error, `Error: no input Anchor Link.`);
const linker=args[0];
const server=!args[1]?"ws://127.0.0.1:9944":args[1];

//library needed
const anchorJS= require('../../../package/node/anchor.node.js');
const { ApiPromise,WsProvider } = require('../../../package/node/polkadot.node.js');
const {easyRun} = require('../../../package/node/easy.node.js');

//websocket link to server
let websocket=null;
const self={
    auto: (ck) => {
        if(websocket!==null) return ck && ck();
        console.log(`Ready to link to server ${server}.`);
        
        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            console.log(config.success,`Linker to node [${server}] created.`);

            websocket = api;
            anchorJS.set(api);
            return ck && ck();
        });
    },
}

//load target anchor as application 
console.log(config.success,`Ready to decode Anchor Link : ${linker} .`);
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

    easyRun(linker,startAPI,(result) => {
        let code=result.code;
        if(result.libs && result.libs.order && result.libs.order.length!==0){
            const funs={};
            for(let i=0;i<result.libs.order.length;i++){
                const row=result.libs.order[i];
                const key=`${row[0]}_${row[1]}`;
                if(result.data[key]){
                    const anchor=result.data[key];
                    const reg=new RegExp(`${config.symbol[0]}${anchor.name}${config.symbol[1]}`,"g");
                    code=code.replace(reg,`(function(){${anchor.raw};return module.exports;})()`);
                }
            }
        }

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

        const file={
            read:(target,ck,)=>{
                fs.stat(target,(err,stats)=>{
                    if (err) return ck && ck({error:err});
                    if(!stats.isFile()) return ck && ck(false);
                    fs.readFile(target,(err,data)=>{
                        if (err) return ck && ck({error:err});
                        return ck && ck(data.toString());
                    });
                });
            },
            save:(name,data,ck)=>{
                fs.writeFile(name, data,'utf8',function (err) {
                    if (err) return ck && ck({error:err});
                    return ck && ck(true);
                });
            },
        };
        if(config.check) file.save("check.js",code);
        try {
            console.log(config.success, `********************* Anchor Network Loader proccess finished *********************\n`);
            eval(code);
            
        } catch (error) {
            console.log(config.error, `Error: failed to load application from ${linker}.`);
            console.log(config.success, `********************* Anchor Network Loader proccess finished *********************\n`);
        }

    });
});