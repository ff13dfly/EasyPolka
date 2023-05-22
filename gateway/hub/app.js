
// security
// 1. no refer anchor, single Anchor data to run
// 2. only trust anchor data, even the encry JSON file.
// 3. when start, need to vertify the runner password. When adding vservice, need to confirm the account

//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=hub.min.js --platform=node

const koa=require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter=require("koa-router");
const {JSONRPCServer} = require("json-rpc-2.0");

//combine all files needed to test package. Can be removed when final release.
const me={
    "pub":{
        "koa":koa,
        "koa-router":koaRouter,
        "koa-bodyparser":bodyParser,
        "json-rpc-2.0":JSONRPCServer,
        "jwt":require("jsonwebtoken"),
        "axios":require("axios").default,
    },
    "anchor":{
        "anchorjs":"",
        "polkadot":"",
    },
    "lib":{
        "mndb":require("../lib/mndb.js"),
    },
    "service":{      //service functions here
        //"knock":require("./service/knock.js"),
        //"reg":require("./service/reg.js"),
        "shuttle":require("./service/shuttle.js"),
    },
    
    "call":{        //public request method name checked here
        "auto":require("./call/auto.js"),
        "spam":require("./call/spam.js"),
    },
    "manage":{      //manage request method name checked here
        "apart":require("./manage/apart.js"),
        "dock":require("./manage/dock.js"),
        "list":require("./manage/list.js"),
    },
};

// application start
const app=new koa(),router=new koaRouter();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));
app.use(router.routes());

// application implement
const self={
    stamp:()=>{
        return new Date().getTime();
    },
}

// Router of Hub, API calls
router.post("/", async (ctx) => {

    const header=ctx.request.header;
    const req=ctx.request.body;
    if(!req.method || !me.call[req.method]){
        return ctx.body=JSON.stringify({error:"unkown call"});
    }

    //1.check the header
    const server = new JSONRPCServer();
    for(let k in me.call){
        server.addMethod(k,()=>{
            return me.call[k](req.method,req.params,req.id,req.id);
        });
    }

    try {
        const result = await server.receive(ctx.request.body);
        ctx.body=JSON.stringify(result);
    } catch (error) {
        ctx.body=JSON.stringify({error:error});
    }
});

// Manage APIs
router.post("/manage", async (ctx) => {
    const header=ctx.request.header;
    const req=ctx.request.body;
    if(!req.method || !me.manage[req.method]){
        return ctx.body=JSON.stringify({error:"unkown call"});
    }
    ctx.body=me.manage[req.method](req.method,req.params,req.id,req.id);
});

// vService APIs
router.post("/service", async (ctx) => {
    const header=ctx.request.header;
    const req=ctx.request.body;
    
    const config={
        method: 'post',
        url: "http://localhost:4501",
        data: req,
    }

    try {
        const axios_result=await me.pub.axios(config);
        console.log("get data : "+JSON.stringify(axios_result.data))
        ctx.body=JSON.stringify(axios_result.data);
    } catch (error) {
        console.log(error);
        ctx.body=JSON.stringify({error:"500"});
    }
});

// start hub application
const port=8001;
app.listen(port,()=>{
    console.log(`JSON RPC 2.0 server running at port ${port}`);
    console.log(`http://localhost:${port}`);

    console.log(`Testing command lines:`);
    console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
});