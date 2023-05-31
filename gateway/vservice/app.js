//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=vservice.min.js --platform=node

//########## RUNNING ##########
//node app.js ss58_address port cfg_anchor
//node app.js 5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9 4501

//scp vservice.min.js root@167.179.119.110:/root/
//curl "http://167.179.119.110:4501/ping" -v

//vService can not be mananged after running
//vService hold a secret code to verify

const tools=require("../lib/tools");
const config = {
    theme:{
        error:      '\x1b[36m%s\x1b[0m',
        success:    '\x1b[36m%s\x1b[0m',
    },
    port:       4501,
    interlval:  120000,
    //polka:      'wss://dev.metanchor.net',
    polka:      'ws://127.0.0.1:9944',
};

console.log(`\nAnchor Gateway vService demo ( v1.0 ) running...`);

const args = process.argv.slice(2);
if(!args[0]) return console.log(config.theme.error,`Error: no runner address.`);
const address=args[0];
if(address.length!==48) return  console.log(config.theme.error,`Error: runner address illegal.`);
const port=!args[1]?config.port:args[1];
const cfgAnchor=!args[2]?"":args[2];
console.log(config.theme.success,`Ready to load gateway Hub by ${address}, the config Anchor is ${!cfgAnchor?"not set":cfgAnchor}`);

const anchor={
    name:"vHistory",
    methods:{
        view:{
            intro:'View anchor details',
            type:'POST',
            param:{
                'anchor':'String'
            }, 
        },
        history:{
            intro:'View anchor history',
            type:'POST',
            param:{
                'anchor':'String'
            }, 
        },
    },
};

const anchorJS= require('../../package/node/anchor.node.js');
const { ApiPromise,WsProvider } = require('../../package/node/polkadot.node.js');
const {easyRun} = require('../../package/node/easy.node.js');

const koa=require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter=require("koa-router");
const { JSONRPCServer } = require("json-rpc-2.0");
const DB=require("../lib/mndb.js");

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

const app=new koa(),router=new koaRouter();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));
app.use(router.routes());

let websocket=null;
let timer=null;
let secret=tools.sn(); 
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
    getExpire:()=>{
        const start=tools.stamp;
        const end=start+config.interlval;
    },
    tick:()=>{
        //let secret=tools.vcode();
        console.log(`Secret code : ${secret} , this is for Gateway Hub to dock this vService. \nWill expire in 2 minute at ${new Date(tools.stamp()+config.interlval)}\n`)
        timer=setInterval(()=>{
            secret=tools.sn();
            DB.key_set("secret",secret);
            console.log(`Secret code : ${secret} , this is for Gateway Hub to dock this vService. \nWill expire in 2 minute at ${new Date(tools.stamp()+config.interlval)}\n`)
        },config.interlval);
    }
}

self.auto(()=>{
    router.get("/ping",async (ctx)=>{
        ctx.body=JSON.stringify({hello:"world"});
    });

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
        const result=me.hub[req.method](req,ctx.req);
        if(result.head){
            for(var k in result.head){
                ctx.set(k,result.head[k])
            }
        }
        ctx.body= self.exportJSON(result.data,req.id);
    });

    app.listen(port,()=>{
        console.log(`vService running at port ${port}`);
        console.log(`http://localhost:${port}`);
        
        console.log(`curl "http://localhost:${port}/ping"\n`)

        self.tick();
        //console.log(`curl "http://localhost:${port}/ping" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
    });
});
