
// security
// 1. no refer anchor, single Anchor data to run
// 2. only trust anchor data, even the encry JSON file.
// 3. when start, need to vertify the runner password.

//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=hub.min.js --platform=node
const koa=require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter=require("koa-router");
const { JSONRPCServer } = require("json-rpc-2.0");
//combine all files needed to test package
const me={
    "pub":{
        "koa":koa,
        "koa-router":koaRouter,
        "koa-bodyparser":bodyParser,
        "json-rpc-2.0":JSONRPCServer,
        "jwt":require("jsonwebtoken"),
        "axios":require("axios").default,
    },
    "lib":{
        "mndb":require("../lib/mndb.js"),
    },
    "call":{
        "auto":require("./call/auto.js"),
        "spam":require("./call/spam.js"),
    },
    "manage":{
        "apart":require("./manage/apart.js"),
        "dock":require("./manage/dock.js"),
    },
    "service":{
        "knock":require("./service/knock.js"),
        "reg":require("./service/reg.js"),
        "shuttle":require("./service/shuttle.js"),
    },
};

//console.log(me);

const self={
    stamp:()=>{
        return new Date().getTime();
    },
}

// application start
const app=new koa();
const router=new koaRouter();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));

const server = new JSONRPCServer();

// here to router the different functions
server.addMethod("echo", (params) => {
    return params.text+' ,this is modified by functions';
});
server.addMethod("log", ({ message }) => console.log(message));

app.use(router.routes());

// API exposed to public
router.post("/", async (ctx) => {
    console.log(`[${self.stamp()}]Req:${JSON.stringify(ctx.request.body)}`)
    const JR2 = await server.receive(ctx.request.body);
    console.log(`[${self.stamp()}]Res:${JSON.stringify(JR2)}\n`)
    ctx.body=JSON.stringify(JR2);
});

// Manage APIs
router.post("/manage", async (ctx) => {

});

// vService APIs
router.post("/service", async (ctx) => {

});

const port=8001;
app.listen(port,()=>{
    console.log(`JSON RPC 2.0 server running at port ${port}`);
    console.log(`http://localhost:${port}`);

    console.log(`Testing command lines:`);
    console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
});

