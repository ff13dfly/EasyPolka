//!important This is the Hub of Anchor Network micro-service system.

//########## BUILD ##########
//package command, `esbuild` needed.
//yarn add esbuild
//../node_modules/.bin/esbuild app.js --bundle --minify --outfile=hub.min.js --platform=node

//########## RUNNING ##########
// node app.js ss58_address port cfg_anchor
// node app.js 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw

//JSON RPC 2.0
//https://www.jsonrpc.org/specification#response_object

// security
// 1. no refer anchor, single Anchor data to run
// 2. only trust anchor data, even the encry JSON file.
// 3. when start, need to vertify the runner password. When adding vservice, need to confirm the account

// running config
const tools = require("../lib/tools");
const config = {
    theme: {
        error: '\x1b[31m%s\x1b[0m',
        success: '\x1b[36m%s\x1b[0m',
        primary: '\x1b[33m%s\x1b[0m',
        dark: '\x1b[90m%s\x1b[0m',
    },
    keys: {
        host: tools.char(20),        //DB key: host information
        encry: tools.char(20),       //DB key: encry `key` and `iv` data of excutor
        setting: tools.char(20),     //DB key: the config anchor name
        encoded: tools.char(20),     //DB key: the encoded account file
        monitor:tools.char(20),      //DB key: Hub monitor
        nodes: tools.char(20),       //Hash main: node save
        spam:  tools.char(19),       //Hash main: spam
        clean: tools.char(19),       //List main: spam list, stack, used to clean the expired spam
    },
    expire: {
        spam: 300000,                //spam expire time, 5 mins
        encry: 600000,               //JSON encry file expired time, 10 mins
        vservice:9000000,            //vService acitve exipred time, 15 mins
    },
}
console.log(config.theme.dark, `\nAnchor Gateway Hub ( v1.0 ) running...`);

// arguments
const args = process.argv.slice(2);
if (!args[0]) return console.log(config.theme.error, `Error: no runner address.`);
const address = args[0];
if (address.length !== 48) return console.log(config.theme.error, `Error: runner address illegal.`);
const port = !args[1] ? 8001 : args[1];
const cfgAnchor = !args[2] ? "" : args[2];
console.log(config.theme.success, `Ready to load gateway Hub by ${address}, the config Anchor is ${!cfgAnchor ? "not set" : cfgAnchor}`);

// basic setting and init the env
const DB = require("../lib/mndb");
const init = {
    run: () => {
        init.mndb();
    },
    mndb: () => {
        const ks = config.keys;
        //DB.key_set(ks.runner, address);                 //runner address
        DB.key_set(ks.setting, cfgAnchor);              //setting anchor
        DB.key_set(ks.host, {                           //hub host details
            endpoint:"",        //access uri
            service:"",
            manage:"",
            runner:address,
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
init.run();
//console.log( DB.key_get(config.keys.runner));

const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter = require("koa-router");
const { JSONRPCServer } = require("json-rpc-2.0");

//combine all files needed to test package. Can be removed when final release.
const me = {
    "pub": {
        "koa": koa,
        "koa-router": koaRouter,
        "koa-bodyparser": bodyParser,
        "json-rpc-2.0": JSONRPCServer,
        "axios": require("axios").default,
    },
    "anchor": {
        "anchorjs": "",
        "polkadot": "",
    },
    "lib": {
        "mndb": require("../lib/mndb.js"),
    }
};

/*****************************************************/
/*********** koa.js to run the http server ***********/
/*****************************************************/

// exposed module
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
        "handshake": require("./manage/handshake.js"),   //get hub encry token to transport JSON file
        "upload": require("./manage/upload.js"),         //upload account JSON file
        "auth": require("./manage/auth.js"),             //verify authority to get JWT token
        "dock": require("./manage/dock.js"),             //dock vService by URI and secret
        "apart": require("./manage/apart.js"),           //apart vService by URI
        "system": require("./manage/system.js"),
        "list": require("./manage/list.js"),
        "drop": require("./manage/drop.js"),
    },
}

// application start
const app = new koa(), router = new koaRouter();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));
app.use(router.routes());

// application implement
const self = {
    getRequestURI: (port) => {
        //const IP=self.getIpAddress();
        //console.log(IP);
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
        //console.log(`Spam checking ...`);
        const DB = require("../lib/mndb.js");
        const data = DB.hash_get(config.keys.spam,spam);
        if (data === null) return 'error spam';

        const stamp = tools.stamp();
        if (stamp > data.exp) return 'expired spam';
        data.exp = stamp + config.expire.spam;
        console.log({ IP });
        console.log(data);
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

// Router of hub, API clls, for web jsonp
router.get("/", async (ctx) => {
    const params = self.getParams(ctx.request.url);
    const start = tools.stamp();
    console.log(config.theme.success, `--------------------------- request start ---------------------------`);
    console.log(`[ call ] stamp: ${start}. Params : ${JSON.stringify(params)}`);

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
    console.log(`[ manage ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`);
    console.log(config.theme.success, `---------------------------- request end ----------------------------\n`);
});

router.get("/manage", async (ctx) => {
    const params = self.getParams(ctx.request.url, "/manage");
    const start = tools.stamp();
    console.log(config.theme.success, `--------------------------- request start ---------------------------`);
    console.log(`[ manage ] stamp: ${start}. Params : ${JSON.stringify(params)}`);

    const mon=DB.key_get(config.keys.monitor);
    mon.manage+=1;
    mon.last=tools.stamp();

    const jsonp = self.formatParams(params);
    const method = jsonp.request.method;
    //console.log(`Request [ manage ] stamp: ${jsonp.stamp}, server stamp : ${tools.stamp()}`);

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

    const end = tools.stamp();
    console.log(`[ manage ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`);
    console.log(config.theme.success, `---------------------------- request end ----------------------------\n`);
});

// vService APIs
router.post("/service", async (ctx) => {
    //const header=ctx.request.header;
    const req = ctx.request.body;
    const start = tools.stamp();
    console.log(config.theme.success, `--------------------------- request start ---------------------------`);
    console.log(`[ service ] stamp: ${start}. Request : ${JSON.stringify(req)}`);

    const mon=DB.key_get(config.keys.monitor);
    mon.service+=1;
    mon.last=tools.stamp();

    if (!req.method || !exposed.service[req.method]) {
        
        return ctx.body = JSON.stringify({ error: "unkown call" });
    }
    const result = await exposed.service[req.method](req.method, req.params, req.id, config);
    ctx.body = self.export(!result.error ? result.data : result, req.id);

    const end = tools.stamp();
    console.log(`[ service ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`);
    console.log(config.theme.success, `---------------------------- request end ----------------------------\n`);
});

// start hub application
app.listen(port, () => {
    //console.log(self.getRequestURI(port) + '/service/');
    const ks=config.keys;
    const endpoint=self.getRequestURI(port);

    const host=DB.key_get(ks.host);
    host.endpoint=endpoint;
    host.service=`${endpoint}/service/`;
    host.manage=`${endpoint}/manage/`;

    //console.log(`JSON RPC 2.0 server running at port ${port}`);
    console.log(config.theme.primary, `[ Hub url ] http://localhost:${port}`);
    console.log(config.theme.primary, `[ Manage url ] http://localhost:${port}/manage`);

    console.log(`Testing command lines:`);
    console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'`)
    console.log(config.theme.success, `Enjoy the Anchor Gateway Micro-service System.\n`)
});