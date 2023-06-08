//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=vservice.min.js --platform=node

//########## RUNNING ##########
//node app.js ss58_address port cfg_anchor
//node app.js 5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9 4502

//scp vservice.min.js root@167.179.119.110:/root/
//curl "http://167.179.119.110:4501/ping" -v

//vService can not be mananged after running
//vService hold a secret code to verify

const tools=require("../lib/tools");
const config = {
    theme:{
        error:      '\x1b[31m%s\x1b[0m',
        success:    '\x1b[36m%s\x1b[0m',
        primary:    '\x1b[33m%s\x1b[0m',
        dark:       '\x1b[90m%s\x1b[0m',
    },
    keys:{
        hubs:tools.char(13),    //DB key: save hub data
        locker:tools.char(22),  //DB key: response locker, when response the Hub data request, hold 500ms to retry
    },
    port:       4501,
    interlval:  120000,         //2 minutes
    fresh:      130000,          //9 minutes ( 540000 ) to fresh token and AES salt
    polka:      'ws://127.0.0.1:9944',
};

console.log(config.theme.dark,`\nAnchor Gateway vService demo ( v1.0 ) running...`);

const args = process.argv.slice(2);
if(!args[0]) return console.log(config.theme.error,`Error: no runner address.`);
const address=args[0];
if(address.length!==48) return  console.log(config.theme.error,`Error: runner address illegal.`);
const port=!args[1]?config.port:args[1];
const cfgAnchor=!args[2]?"":args[2];
console.log(config.theme.success,`Ready to load gateway Hub by ${address}, the config Anchor is ${!cfgAnchor?"not set":cfgAnchor}`);

const anchorJS= require('../../package/node/anchor.node.js');
const { ApiPromise,WsProvider } = require('../../package/node/polkadot.node.js');
const {easyRun} = require('../../package/node/easy.node.js');
const koa=require("koa"),bodyParser = require("koa-bodyparser"),koaRouter=require("koa-router");
const { JSONRPCServer } = require("json-rpc-2.0");

const me={
    "action":{
        "tick":require("./action/tick.js"),     //fresh link secret
        "ping":require("./action/ping.js"),     //ping Hub to confirm link and fresh token
    },
    "hub":{        //public request method name checked here
        "knock":require("./hub/knock.js"),      //response the handshake from Hub
        "reg":require("./hub/reg.js"),          //response the reg request from Hub
        "unlink":require("./hub/unlink.js"),    //response the apart request from Hub
    },
    "mod":{
        "view":require("./mod/view.js"),
    },
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
        console.log(`Ready to link to server ${config.polka}.`);
        
        ApiPromise.create({ provider: new WsProvider(config.polka) }).then((api) => {
            console.log(config.theme.success,`Linker to node [${config.polka}] created.`);

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
    exportJSON:(data,id)=>{
        if(data.error){
            return {
                jsonrpc: '2.0',
                id:id,
                error: data.error,
            }
        };
        return {
            jsonrpc: '2.0',
            id:id,
            result: data
        }
    },
}

self.auto(()=>{
    // Test function, not sure to keep this.
    router.get("/ping",async (ctx)=>{
        ctx.body=JSON.stringify({hello:"world",stamp:tools.stamp()});
    });

    // call from Hub of exposed method
    router.post("/",async (ctx)=>{
        const header=ctx.request.header;
        const req=ctx.request.body;
        const start=tools.stamp();
        console.log(config.theme.success,`--------------------------- request start ---------------------------`);
        console.log(`[ call ] stamp: ${start}, JSON RPC : ${JSON.stringify(req)}`);
        if(!req.method || !me.mod[req.method]){
            return ctx.body=self.exportJSON({error:"unkown call"},req.id);
        }
        if(!req.params || !req.params.token){
            return ctx.body=self.exportJSON({error:"no authority"},req.id);
        }

        //FIXME, check all hubs to confirm the token is stupid.

        //2.check Hub token
        const DB=require("../lib/mndb.js");
        const token=req.params.token;
        const hub=DB.key_get(token);
        if(hub===null) return ctx.body=self.exportJSON({error:"illigle token"},req.id);

        // const hubs=DB.hash_all(config.keys.hubs);
        // for(var uri in hubs){
        //     const row=hubs[uri];
        //     if(row.active===token){
        //         pass=true;
        //         break;
        //     }
        // }
        // if(!pass) return ctx.body=self.exportJSON({error:"illigle token"},req.id);

        const result= await me.mod[req.method](req.method,req.params,req.id,config);
        ctx.body= self.exportJSON(!result.error?result.data:result,req.id);

        const end=tools.stamp();
        console.log(`[ call ] stamp: ${end}, cost: ${end-start}ms, Result : ${JSON.stringify(result)}`);
        console.log(config.theme.success,`---------------------------- request end ----------------------------\n`); 
    });

    // call from Hub of management
    router.post("/hub",async (ctx)=>{
        const header=ctx.request.header;
        const req=ctx.request.body;
        const start=tools.stamp();
        console.log(config.theme.success,`--------------------------- request start ---------------------------`);
        console.log(`[ hub ] stamp: ${start}, JSON RPC : ${JSON.stringify(req)}`);
        if(!req.method || !me.hub[req.method]){
            return ctx.body=JSON.stringify({error:"unkown call"});
        }
        const result=me.hub[req.method](req,ctx.req,config);
        if(result.head){
            for(var k in result.head){
                ctx.set(k,result.head[k])
            }
        }
        ctx.body= self.exportJSON(!result.error?result.data:result,req.id);

        const end=tools.stamp();
        console.log(`[ hub ] stamp: ${end}, cost: ${end-start}ms, Result : ${JSON.stringify(result)}`);
        console.log(config.theme.success,`---------------------------- request end ----------------------------\n`); 
    });

    app.listen(port,()=>{
        //1.bind application to server port
        console.log(`vService running at port ${port}`);
        console.log(config.theme.primary,`http://localhost:${port}`);
        
        console.log(`curl "http://localhost:${port}/ping"\n`)

        //2.start auto actions
        for(var k in me.action) me.action[k](config);

        //console.log(`curl "http://localhost:${port}/ping" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
    });
});
