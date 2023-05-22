//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=vservice.min.js --platform=node

const anchorJS= require('../../package/node/anchor.node.js');
const { ApiPromise,WsProvider } = require('../../package/node/polkadot.node.js');
const {easyRun} = require('../../package/node/easy.node.js');
const server="ws://127.0.0.1:9944";

const koa=require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter=require("koa-router");
//const { JSONRPCServer } = require("json-rpc-2.0");

const me={
    "pub":{
        "koa":koa,
        "koa-router":koaRouter,
        "koa-bodyparser":bodyParser,
        "json-rpc-2.0":JSONRPCServer,
        "jwt":require("jsonwebtoken"),
    },
    "anchor":{
        "anchorjs":"",
        "polkadot":"",
    },
    "lib":{
        "mndb":require("../lib/mndb.js"),
    },
    "hub":{        //public request method name checked here
        "knock":require("./hub/knock.js"),
        "reg":require("./hub/reg.js"),
    },
    "mod":{      //manage request method name checked here
        "view":require("./mod/view.js"),
    },
};

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
                if(res.error.length!==0) return reject({error:res.error,count:n});
                resolve({location:res.location,count:n});
            });
        });
    },
}

self.auto(()=>{
    router.post("/",async (ctx)=>{
        const header=ctx.request.header;
        const req=ctx.request.body;
        if(!req.method || !me.mod[req.method]){
            return ctx.body=JSON.stringify({error:"unkown call"});
        }
        ctx.body=me.mod[req.method](req.method,req.params,req.id,req.id);
    });

    router.post("/hub",async (ctx)=>{
        const header=ctx.request.header;
        const req=ctx.request.body;
        if(!req.method || !me.hub[req.method]){
            return ctx.body=JSON.stringify({error:"unkown call"});
        }
        ctx.body=me.hub[req.method](req.method,req.params,req.id,req.id);
    });

    const port=4501;
    app.listen(port,()=>{
        console.log(`vService running at port ${port}`);
        console.log(`http://localhost:${port}`);
    
        console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
    });
});
