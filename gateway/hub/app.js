//!important This is the Hub of Anchor Network micro-service system.

//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=hub.min.js --platform=node

//########## RUNNING ##########
// node app.js ss58_address port cfg_anchor
// node app.js 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw

// #Best way
// node app.js config.json

//########## LOADER ##########
// node hub.min.js 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw 8001
// node loader.nodejs.js anchor://gateway_hub/ ws://127.0.0.1:9944 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw 8001

// node app.js anchor://gateway_hub/ config.json

//JSON RPC 2.0
//https://www.jsonrpc.org/specification#response_object

// security
// 1. no refer anchor, single Anchor data to run
// 2. only trust anchor data, even the encry JSON file.
// 3. when start, need to vertify the runner password. When adding vservice, need to confirm the account

const tools = require("../lib/tools");
const config = {
    version:"1.1.0",
    keys: {
        host: tools.char(20),        //DB key: host information
        encry: tools.char(20),       //DB key: encry `key` and `iv` data of excutor
        setting: tools.char(20),     //DB key: the config anchor name
        encoded: tools.char(20),     //DB key: the encoded account file
        excutor: tools.char(20),     //DB key: manager status
        monitor:tools.char(20),      //DB key: Hub monitor
        nodes: tools.char(20),       //Hash main: node save
        spam:  tools.char(19),       //Hash main: spam
        clean: tools.char(19),       //List main: spam list, stack, used to clean the expired spam
    },
    expire: {
        spam: 300000,                //spam expire time, 5 mins
        encry: 6000000,              //JSON encry file expired time, 60 mins
        password:300000,            //Authority expired time, 5 mins
        //spam: 10000,               //spam expire time, 10 sec for testing
        //encry: 30000,              //JSON encry file expired time, 30 sec
        //password:20000,             //Authority expired time, 20 sec for testing
        vservice:9000000,            //vService acitve exipred time, 15 mins
    },
}

/************************************************/
/***************** Memory DB ********************/
/************************************************/

// basic setting and init the env
const DB = require("../lib/mndb");
const init = {
    run: (obj) => {
        init.mndb(obj);
    },
    mndb: (obj) => {
        const ks = config.keys;
        //DB.key_set(ks.runner, address);               //runner address
        DB.key_set(ks.setting, obj.anchor);              //setting anchor
        DB.key_set(ks.host, {                           //hub host details
            endpoint:"",        //access uri
            service:"",
            manage:"",
            runner:obj.address,
        });              
        DB.key_set(ks.encry, { key: "", iv: "" });

        const stamp=tools.stamp();
        DB.key_set(ks.monitor, {
            start:stamp,
            last:stamp,
            req:0,              //request of Hub
            manage:0,           //request of Hub management
            service:0,          //request of service
            active:0,           //pong request from vService
            flow:0,             //flow length of Hub
            spam:0,             //access spam count
        });
    },
}

/************************************************/
/***************** RPC server *******************/
/************************************************/
const {output}=require("../lib/output");
const self = {
    getRequestURI: (port) => {
        const host="localhost";
        const uri = `http://${host}:${port}`;
        return uri;
    },
    getParams: (str, pre) => {
        const map = {};
        if (!str) return map;
        const txt = str.replace(((!pre ? '' : pre) + "/?"), "");
        const arr = txt.split("&");
        for (let i = 0; i < arr.length; i++) {
            const kv = arr[i].split("=");
            map[kv[0]] = kv[1];
        }
        return map;
    },
    formatParams: (map) => {
        const params = {};
        let callback = '';
        const json = {
            id: "",
            method: "",
            params: {},
        }
        for (var k in map) {
            if (k === "_") {
                continue;
            }
            if (k === "callback") {
                callback = map[k];
                continue;
            }
            if (k === "id") {
                json.id = map[k];
                continue;
            }
            if (k === "method") {
                json.method = map[k];
                continue;
            }
            params[k] = map[k];
        }
        json.params = params;

        return { request: json, callback: callback }
    },
    export: (data, id, callback) => {
        let output = { jsonrpc: '2.0', id: id };
        if (!data) {
            output.error = 'No response from server';
        } else {
            if (data.error) output.error = data.error;
        }

        if (output.error) return !callback ? output : `${callback}(${JSON.stringify(output)})`;
        output.result = data;
        return !callback ? output : `${callback}(${JSON.stringify(output)})`;
    },
    checkSpam: (spam, IP) => {
        const DB = require("../lib/mndb.js");
        const data = DB.hash_get(config.keys.spam,spam);
        if (data === null) return 'error spam';

        const stamp = tools.stamp();
        if (stamp > data.exp) return 'expired spam';
        data.exp = stamp + config.expire.spam;
        if (data.more.IP !== IP) return 'illigle spam';
        return true;
    },
    getClientIP: (req) => {
        let ip = req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            req.ip ||
            req.connection.remoteAddress || // 判断 connection 的远程 IP
            req.socket.remoteAddress || // 判断后端的 socket 的 IP
            req.connection.socket.remoteAddress || ''
        if (ip) {
            ip = ip.replace('::ffff:', '')
        }
        return ip;
    },
    getIpAddress:()=>{
        const os = require('os');
        let ifaces = os.networkInterfaces()
        for (let dev in ifaces) {
            let iface = ifaces[dev]
            for (let i = 0; i < iface.length; i++) {
                let { family, address, internal } = iface[i]
                if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                    return address
                }
            }
        }
    },
}

const exposed = {
    "service": {      //service functions here
        //"knock":require("./service/knock.js"),
        //"reg":require("./service/reg.js"),
        "pong": require("./service/pong.js"),
        "shuttle": require("./service/shuttle.js"),
    },

    "call": {        //public request method name checked here
        "auto": require("./call/auto.js"),
        "spam": require("./call/spam.js"),
    },
    "manage": {      //manage request method name checked here
        "handshake": require("./manage/handshake.js"),  //get hub encry token to transport JSON file
        "upload": require("./manage/upload.js"),        //upload account JSON file
        "drop": require("./manage/drop.js"),            //drop the encry JSON file
        "auth": require("./manage/auth.js"),            //verify authority to get JWT token
        "dock": require("./manage/dock.js"),            //dock vService by URI and secret
        "apart": require("./manage/apart.js"),          //apart vService by URI
        "system": require("./manage/system.js"),        //system monitor data
        "list": require("./manage/list.js"),            //vService exposed methods list 
    },
}

const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter = require("koa-router");
const app = new koa(),router=new koaRouter();
const cfgService={
    manage:"manage",
    service:"service",
    RPC:"websocket",
    http:"http",
}
const listen={
    run:(obj)=>{
        app.use(bodyParser({
            detectJSON: function (ctx) {
                return ctx;
            }
        }));
        app.use(router.routes());

        // router running...
        for(var k in cfgService){
            if(listen[cfgService[k]]) listen[cfgService[k]]();
        }

        const port=obj.port;
        app.listen(port, () => {
            const ks=config.keys;
            const endpoint=self.getRequestURI(port);
        
            const host=DB.key_get(ks.host);
            host.endpoint=endpoint;
            host.service=`${endpoint}/service/`;
            host.manage=`${endpoint}/manage/`;
            
            output(`[ Hub url ] http://localhost:${port}`,"primary",true);
            output(`[ Manage url ] http://localhost:${port}/manage`,"primary",true);
            
            output(`Testing command lines:`,"",true);
            output(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'`,"",true);
            output(`Enjoy the Anchor Gateway Micro-service System.`,"success",true);
        });
    },
    manage:()=>{
        router.get("/manage", async (ctx) => {
            const params = self.getParams(ctx.request.url, "/manage");
            const start = tools.stamp();
            output(`--------------------------- request start ---------------------------`,"success",true);
            output(`[ manage ] stamp: ${start}. Params : ${JSON.stringify(params)}`,"",true);

            const mon=DB.key_get(config.keys.monitor);
            mon.manage+=1;
            mon.last=tools.stamp();
        
            const jsonp = self.formatParams(params);
            const method = jsonp.request.method;

            //1. check spam
            if (!jsonp.request.params.spam) return ctx.body = self.export({ error: "no spam" }, jsonp.request.id, jsonp.callback);
            const spam = jsonp.request.params.spam;
            const IP = self.getClientIP(ctx.req);
            const spamResult = self.checkSpam(spam, IP);
            if (spamResult !== true) {
                return ctx.body = self.export({ error: spamResult }, jsonp.request.id, jsonp.callback);
            }
        
            //2. router to target method
            if (!method || !exposed.manage[method]) {
                return ctx.body = self.export({ error: "unkown call" }, jsonp.request.id, jsonp.callback);
            }
            const result = await exposed.manage[method](method, jsonp.request.params, jsonp.request.id, config);
            ctx.body = self.export(!result.error ? result.data : result, jsonp.request.id, jsonp.callback);
        
            //3. fresh the encry JSON file expire time
            //TODO, fresh the expire time of JSON file.
        
            const end = tools.stamp();
            output(`[ manage ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`,"",true);
            output(`---------------------------- request end ----------------------------\n`,"success",true);
        });
    },
    http:()=>{
        router.get("/", async (ctx) => {
            const params = self.getParams(ctx.request.url);
            const start = tools.stamp();
            output(`--------------------------- request start ---------------------------`,"success",true);
            output(`[ call ] stamp: ${start}. Params : ${JSON.stringify(params)}`,"",true);
            const mon=DB.key_get(config.keys.monitor);
            mon.req+=1;
            mon.last=tools.stamp();
        
            const jsonp = self.formatParams(params);
            const method = jsonp.request.method;
            const IP = self.getClientIP(ctx.req);
            if (method !== 'spam') {
                if (!jsonp.request.params.spam) return ctx.body = self.export({ error: "no spam" }, jsonp.request.id, jsonp.callback);
                const spam = jsonp.request.params.spam;
                const spamResult = self.checkSpam(spam, IP);
                if (spamResult !== true) {
                    return ctx.body = self.export({ error: spamResult }, jsonp.request.id, jsonp.callback);
                }
            }else{
                mon.spam+=1;
            }
            
            if (!method || !exposed.call[method]) {
                return ctx.body = self.export({ error: "unkown call" }, jsonp.request.id, jsonp.callback);
            }
        
            const env = { IP: IP };
            const result = await exposed.call[method](method, jsonp.request.params, jsonp.request.id, config, env);
            ctx.body = self.export(result, jsonp.request.id, jsonp.callback);
        
            const end = tools.stamp();
            output(`[ manage ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`,"",true);
            output(`---------------------------- request end ----------------------------\n`,"success",true);
        });
    },
    service:()=>{
        router.post("/service", async (ctx) => {
            const req = ctx.request.body;
            const start = tools.stamp();
            output(`--------------------------- request start ---------------------------`,"success",true);
            output(`[ service ] stamp: ${start}. Request : ${JSON.stringify(req)}`,"",true);

            const mon=DB.key_get(config.keys.monitor);
            mon.service+=1;
            mon.last=tools.stamp();
        
            if (!req.method || !exposed.service[req.method]) {
                
                return ctx.body = JSON.stringify({ error: "unkown call" });
            }
            const result = await exposed.service[req.method](req.method, req.params, req.id, config);
            ctx.body = self.export(!result.error ? result.data : result, req.id);
        
            const end = tools.stamp();
            output(`[ service ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`,"",true);
            output(`---------------------------- request end ----------------------------\n`,"success",true);
        });
    },
    websocket:()=>{
        const WS = require("../lib/wss");
        const fetch=(req,ck)=>{

            const start = tools.stamp();
            output(`--------------------------- request start ---------------------------`,"success",true);
            output(`[ service ] stamp: ${start}. Request : ${JSON.stringify(req)}`,"",true);

            //monitor code
            const mon=DB.key_get(config.keys.monitor);
            mon.req+=1;
            mon.last=tools.stamp();
            
            const method = req.method;
            if (!req.method || !exposed.call[method]) {
                return ck && ck({error:"unkown call"});
            }
            
            const env = {};
            exposed.call[method](method, req, req.id, config, env).then((result)=>{
                if(result.error) return ck && ck(result);
                const data=result.data;
                data.done=result.stamp;
                data.hub=tools.stamp();
                ck && ck(data);
            });
        };
        WS.auto({},{fetch:fetch});
        WS.start();
    },
}

/************************************************/
/*************** Running logical ****************/
/************************************************/
console.clear();
output(`Anchor Gateway Hub ( v${config.version} ) running...`,"dark",true);
const Valid = require("../lib/valid");
Valid(process.argv.slice(2),(cfg)=>{
    if(cfg.error) return output(cfg.error,"error");
    if(!cfg.address) return output(`No manager address, valid hub server.`,"error");
    if(!cfg.port) return output(`No port to bind hub service.`,"error");
    if(cfg.port<8000) return output(`Please set the bind port > 8000 `,"error");
    
    init.run({anchor:cfg.anchor,address:cfg.address});
    listen.run({port:cfg.port});
});