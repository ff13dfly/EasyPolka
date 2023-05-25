//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=vservice.min.js --platform=node

//scp vservice.min.js root@167.179.119.110:/root/
//curl "http://167.179.119.110:4501/ping" -v
const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    port:       4501,
    //polka:      'wss://dev.metanchor.net',
    polka:      'ws://127.0.0.1:9944',
};

const args = process.argv.slice(2);
//if(!args || !args[0]) return console.log(config.error,`Error: no target anchor to run ...`);
const port=!args[1]?config.port:args[1];

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
const self={
    auto: (ck) => {
        if(websocket!==null) return ck && ck();
        console.log(`Ready to link to server ${config.polka}.`);
        
        ApiPromise.create({ provider: new WsProvider(config.polka) }).then((api) => {
            console.log(config.success,`Linker to node [${config.polka}] created.`);

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

    //checking functions by anchor
    analyze:()=>{

    },
    rand:(m,n)=>{return Math.floor(Math.random() * (m-n+1) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
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
        ctx.body= self.exportJSON(result.data,req.id) ;
    });

    //const port=4501;
    app.listen(port,()=>{
        console.log(`vService running at port ${port}`);
        console.log(`http://localhost:${port}`);
        
        console.log(`curl "http://localhost:${port}/ping"\n`)
        //console.log(`curl "http://localhost:${port}/ping" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
    });
});
