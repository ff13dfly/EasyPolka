
// security
// 1. no refer anchor, single Anchor data to run
// 2. only trust anchor data, even the encry JSON file.
// 3. when start, need to vertify the runner password. When adding vservice, need to confirm the account

//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=hub.min.js --platform=node

//JSON RPC 2.0
//https://www.jsonrpc.org/specification#response_object

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
        "pong":require("./service/pong.js"),
        "shuttle":require("./service/shuttle.js"),
    },
    
    "call":{        //public request method name checked here
        "auto":require("./call/auto.js"),
        "spam":require("./call/spam.js"),
    },
    "manage":{      //manage request method name checked here
        "auth":require("./manage/auth.js"),
        "upload":require("./manage/upload.js"),
        "apart":require("./manage/apart.js"),
        "drop":require("./manage/drop.js"),
        "system":require("./manage/system.js"),
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
    rand:(m,n)=>{return Math.floor(Math.random() * (m-n+1) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
    },
    

    // reg hub details
    reg:()=>{

    },
    getParams:(str,pre)=>{
        const map={};
        if(!str) return map;
        const txt=str.replace((!pre?'':pre+"/?"),"");
        console.log(!pre?'':pre+"/?");
        const arr=txt.split("&");
        
        for(let i=0;i<arr.length;i++){
          const kv=arr[i].split("=");
          map[kv[0]]=kv[1];
        }
        return map;
    },
    formatParams:(map)=>{
        const params={};
        let callback='';
        const json={
            id:"",
            method:"",
            params:{},
        }
        for(var k in map){
            if(k==="_"){
                continue;
            }
            if(k==="callback"){
                callback=map[k];
                continue;
            }
            if(k==="id"){
                json.id=map[k];
                continue;
            }
            if(k==="method"){
                json.method=map[k];
                continue;
            }
            params[k]=map[k];
        }
        json.params=params;

        return {request:json,callback:callback,stamp:self.stamp()}
    },
    export:(data,id,callback)=>{
        let output={jsonrpc: '2.0',id:id};
        if(!data){
            output.error='No response from server';
        }else{
            if(data.error) output.error=data.error;
        }
        
        if(output.error) return !callback?output:`${callback}(${JSON.stringify(output)})`;
        output.result=data;
        return !callback?output:`${callback}(${JSON.stringify(output)})`;
    },
    checkSpam:(spam,stamp)=>{
        console.log(`Spam checking ...`);
        const DB=require("../lib/mndb.js");
        const data=DB.key_get(spam);
        if(data===null) return 'error spam';

        const exp=stamp-data.stamp;
        if(exp>10*60*1000){
            //TODO, here to clean the spam
            return 'expired spam';
        } 
        return true;
    },
}

// Router of hub, API clls, for web jsonp
router.get("/", async (ctx) => {
    const params=self.getParams(ctx.request.url);
    const jsonp=self.formatParams(params);
    const method=jsonp.request.method;
    console.log(`Request stamp: ${jsonp.stamp}, server stamp : ${self.stamp()}`);
    if(method!=='spam'){
        if(!jsonp.request.params.spam) return ctx.body=self.export({error:"no spam"},jsonp.request.id,jsonp.callback);
        const spamResult=self.checkSpam(jsonp.request.params.spam,jsonp.stamp);
        if(spamResult!==true){
            return ctx.body=self.export({error:spamResult},jsonp.request.id,jsonp.callback);
        }
    }

    if(!method || !me.call[method]){
        return ctx.body=self.export({error:"unkown call"},jsonp.request.id,jsonp.callback);
    }
    const result = await me.call[method](method,jsonp.request.params,jsonp.request.id,jsonp.request.id);
    ctx.body=self.export(result,jsonp.request.id,jsonp.callback);
});

router.get("/manage", async (ctx) => {
    const params=self.getParams(ctx.request.url,"/manage");
    const jsonp=self.formatParams(params);
    const method=jsonp.request.method;
    console.log(`Request stamp: ${jsonp.stamp}, server stamp : ${self.stamp()}`);
    if(method!=='spam'){
        if(!jsonp.request.params.spam) return ctx.body=self.export({error:"no spam"},jsonp.request.id,jsonp.callback);
        const spamResult=self.checkSpam(jsonp.request.params.spam,jsonp.stamp);
        if(spamResult!==true){
            return ctx.body=self.export({error:spamResult},jsonp.request.id,jsonp.callback);
        }
    }
    console.log(`Request method : ${method}`);
    if(!method || !me.manage[method]){
        return ctx.body=self.export({error:"unkown call"},jsonp.request.id,jsonp.callback);
    }
    const result = await me.manage[method](method,jsonp.request.params,jsonp.request.id,jsonp.request.id);
    ctx.body=self.export(result.data,jsonp.request.id,jsonp.callback);
});

// Router of Hub, API calls, for server
router.post("/", async (ctx) => {
    const header=ctx.request.header;
    const req=ctx.request.body;
    if(!req.method || !me.call[req.method]){
        return ctx.body=JSON.stringify({error:"unkown call"});
    }

    //1.check the header
    for(let k in me.call){
        server.addMethod(k,()=>{
            return me.call[k](req.method,req.params,req.id,req.id);
        });
    }

    try {
        const result = await server.receive(ctx.request.body);
        ctx.body= self.export(result,req.id);
    } catch (error) {
        ctx.body= self.export({error:error},req.id);
    }
});

// Manage APIs
router.post("/manage", async (ctx) => {
    const header=ctx.request.header;
    const req=ctx.request.body;
    if(!req.method || !me.manage[req.method]){
        return ctx.body=JSON.stringify({error:"unkown call"});
    }
    const result= await me.manage[req.method](req.method,req.params,req.id,req.id);
    if(!result.error){
        ctx.body=self.export(result.data,req.id);
    }else{
        ctx.body=self.export(result,req.id);
    }
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