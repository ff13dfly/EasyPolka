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
    },
    port:       4501,
    interlval:  120000,         //2 minutes
    fresh:      540000,         //9 minutes to fresh token and AES salt
    //polka:      'wss://dev.metanchor.net',
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

const axios= require("axios").default;
const encry = require('../lib/encry');
let websocket=null;
let timer=null,active=null;                 //two tast: 1. SN ; 2. Fresh AES token

let secret=tools.sn();
let locker=false;                           //when response, lock the AES update
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
        console.log(config.theme.success,`---------------------------- secret code ----------------------------`)
        console.log(`Secret code, this is for Gateway Hub to dock this vService.`)
        console.log(config.theme.primary,secret);
        console.log(`Will expire in 2 minutes at ${new Date(tools.stamp()+config.interlval)}`);
        console.log(config.theme.success,`---------------------------- secret code ----------------------------\n`)

        DB.key_set("secret",secret);
        timer=setInterval(()=>{
            secret=tools.sn();
            DB.key_set("secret",secret);

            console.log(config.theme.success,`---------------------------- secret code ----------------------------`)
            console.log(`Secret code, this is for Gateway Hub to dock this vService.`)
            console.log(config.theme.primary,secret);
            console.log(`Will expire in 2 minutes at ${new Date(tools.stamp()+config.interlval)}`);
            console.log(config.theme.success,`---------------------------- secret code ----------------------------\n`)

        },config.interlval);
    },
    active:()=>{
        if(active===null) active=setInterval(()=>{
            console.log(config.theme.success,`---------------------------- auto fresh ----------------------------`)
            const hubs=DB.hash_all(config.keys.hubs);
            console.log(hubs);
            if(hubs===null){
                console.log(config.theme.error,`No active Hub linked yet.`);
                return true;
            }

            const list=[];
            for(let k in hubs){
                list.push(hubs[k]);
            }
            self.ping(list,(ts)=>{

                for(var k in ts){
                    const row=ts[k];
                    hubs[k]["AES"]=row.AES;
                    hubs[k]["active"]=row.active;
                }

                console.log(config.theme.success,`All hubs active.`);
            });
            console.log(config.theme.success,`---------------------------- auto fresh ----------------------------\n`)
        },config.fresh);
    },
    ping:(list,ck,ts)=>{
        if(!ts) ts={};
        if(list.length===0) return ck && ck(ts);
        const row=list.pop();
        const fresh=tools.char(16);
        //ts[row.address]=fresh;
        console.log(row);

        //1. encry the new salt to sent to Hub (as spam, hub will call with this)
        const md5=row.AES;
        const key=md5.substring(0,16),iv=md5.substring(16,32);
        encry.setKey(key);
        encry.setIV(iv);
        const code=encry.encrypt(fresh);
        //console.log({key,iv,code,md5,fresh})

        const data={
            fresh:code,
            token:row.active,
        };
        //console.log(data);
        const reqPing={
            method: 'post',
            url: row.URI,
            data:self.formatJSON("pong",data,`autofresh_${tools.stamp()}`),
        }
        axios(reqPing).then((res)=>{
            const json=res.data;
            const AES=encry.decrypt(json.result.AES);
            ts[row.URI]={
                active:fresh,
                AES:AES,
            }
            
            return self.ping(list,ck,ts);
        }).catch((err)=>{
            console.log(config.theme.error,err);
            return self.ping(list,ck,ts);
        });
    },
    formatJSON:(method,params,id)=>{
        //console.log(params);
        return {
            "jsonrpc":"2.0",
            "method":method,
            "params":params,
            "id":id,
        }
    },
}

self.auto(()=>{
    router.get("/ping",async (ctx)=>{
        ctx.body=JSON.stringify({hello:"world"});
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

        //const hub=DB.key_get(req.params.token);
        let pass=false;
        const token=req.params.token;
        const hubs=DB.hash_all(config.keys.hubs);
        for(var uri in hubs){
            const row=hubs[uri];
            if(row.active===token){
                pass=true;
                break;
            }
        }
        if(!pass) return ctx.body=self.exportJSON({error:"illigle token"},req.id);

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
        console.log(`vService running at port ${port}`);
        console.log(config.theme.primary,`http://localhost:${port}`);
        
        console.log(`curl "http://localhost:${port}/ping"\n`)

        self.tick();
        self.active();
        //console.log(`curl "http://localhost:${port}/ping" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'\n`)
    });
});
