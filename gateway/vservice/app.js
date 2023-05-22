const anchorJS= require('../../package/node/anchor.node.js');
const { ApiPromise,WsProvider } = require('../../package/node/polkadot.node.js');
const {easyRun} = require('../../package/node/easy.node.js');
const server="ws://127.0.0.1:9944";


const koa=require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter=require("koa-router");
//const { JSONRPCServer } = require("json-rpc-2.0");

const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
};

const app=new koa(),router=new koaRouter();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));
app.use(router.routes());

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
    easyPromise:(linker,n)=>{
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
        return new Promise((resolve, reject) => {
            easyRun(linker,startAPI,(res) => {
                //console.log(res.error)
                if(res.error.length!==0) return reject({error:res.error,count:n});
                resolve({location:res.location,count:n});
            });
         });
    },
}

self.auto(()=>{
    let count=0;
    router.post("/",async (ctx)=>{
        count++;
        const linker=`anchor://${ctx.request.body.params.name}`;
        console.log(`[${count}]${linker}`);
        try {
            let result=await self.easyPromise(linker,count);
            ctx.body=JSON.stringify(result);
        } catch (error) {
            //console.log("here?");
            ctx.body=JSON.stringify(error);
        }
    });

    // function easyPromise(linker,n){
    //     const startAPI = {
    //         common: {
    //             "latest": anchorJS.latest,
    //             "target": anchorJS.target,
    //             "history": anchorJS.history,
    //             "owner": anchorJS.owner,
    //             "subcribe": anchorJS.subcribe,
    //             "block": anchorJS.block,
    //         }
    //     };
    //     return new Promise((resolve, reject) => {
    //         easyRun(linker,startAPI,(res) => {
    //             //console.log(res.error)
    //             if(res.error.length!==0) return reject({error:res.error,count:n});
    //             resolve({location:res.location,count:n});
    //         });
    //      });
    // }

    const port=4501;
    app.listen(port,()=>{
        console.log(`vService running at port ${port}`);
        console.log(`http://localhost:${port}`);
    
        console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
    });
    
});
