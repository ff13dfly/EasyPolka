
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

//combine all files needed to test package. Can be removed when final release.
const me={
    "anchor":{
        
    },
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
    "service":{      //service functions here
        "knock":require("./service/knock.js"),
        "reg":require("./service/reg.js"),
        "shuttle":require("./service/shuttle.js"),
    },

    "call":{        //public request method name checked here
        "auto":require("./call/auto.js"),
        "spam":require("./call/spam.js"),
    },
    "manage":{      //manage request method name checked here
        "apart":require("./manage/apart.js"),
        "dock":require("./manage/dock.js"),
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


const config={

};

// application implement
const self={
    input:()=>{

    },
    stamp:()=>{
        return new Date().getTime();
    },
    valid:(header,post)=>{

    },
}

// Router of Hub
router.post("/", async (ctx) => {
    //1.check the header
    console.log(ctx.request.body);
    const server = new JSONRPCServer();
    server.addMethod("echo", (params) => {
        return params.text+' ,this is modified by functions';
    });
    server.addMethod("log", ({ message }) => console.log(message));

    //2.reponse to different mods.
    console.log(`[${self.stamp()}]Req:${JSON.stringify(ctx.request.body)}`)
    const JR2 = await server.receive(ctx.request.body);
    console.log(`[${self.stamp()}]Res:${JSON.stringify(JR2)}\n`)
    ctx.body=JSON.stringify(JR2);
});

// Manage APIs
router.post("/manage", async (ctx) => {
    const header=ctx.request.header;
    const req=ctx.request.body;
    console.log({req,header});
    ctx.body=JSON.stringify({hello:"manage"});
});

// vService APIs
// let count=0;
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
        //ctx.body=JSON.stringify({error:"500"});
    }
});

const port=8001;
app.listen(port,()=>{
    console.log(`JSON RPC 2.0 server running at port ${port}`);
    console.log(`http://localhost:${port}`);

    console.log(`Testing command lines:`);
    console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
});

