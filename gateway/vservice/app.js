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

const tools = require("../lib/tools");
const { output } = require("../lib/output");
const config = {
    version: "1.1.0",
    keys: {
        hubs: tools.char(13),    //DB key: save hub data
        locker: tools.char(22),  //DB key: response locker, when response the Hub data request, hold 500ms to retry
    },
    fresh: 130000,
    polka: 'ws://127.0.0.1:9944',
    expire: {
        spam: 10000,
    },
    timer: {
        secret: 120000,      //2 minutes ( 120000 ) to fresh dock secret
        ping: 540000,        //9 minutes ( 540000 ) to fresh token and AES salt
    },
};

const anchorJS = require('../../package/node/anchor.node.js');
const { ApiPromise, WsProvider } = require('../../package/node/polkadot.node.js');
const { easyRun } = require('../../package/node/easy.node.js');
const koa = require("koa"), bodyParser = require("koa-bodyparser"), koaRouter = require("koa-router");
const { JSONRPCServer } = require("json-rpc-2.0");

const me = {
    "action": {
        "tick": require("./action/tick.js"),     //fresh link secret
        "ping": require("./action/ping.js"),     //ping Hub to confirm link and fresh token
    },
    "hub": {        //public request method name checked here
        "knock": require("./hub/knock.js"),      //response the handshake from Hub
        "reg": require("./hub/reg.js"),          //response the reg request from Hub
        "unlink": require("./hub/unlink.js"),    //response the apart request from Hub
    },
    "mod": {
        "view": require("./mod/view.js"),
        "testing": require("./mod/testing.js"),  //multi testing
    },
};


let websocket = null;
const self = {
    auto: (ck) => {
        if (websocket !== null) return ck && ck();
        output(`Ready to link to server ${config.polka}.`, "", true);

        ApiPromise.create({ provider: new WsProvider(config.polka) }).then((api) => {
            output(`Linker to node [${config.polka}] created.`, "success", true);
            websocket = api;
            anchorJS.set(api);
            return ck && ck();
        });
    },
    easyPromise: (linker, n) => {
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
            easyRun(linker, startAPI, (res) => {
                if (res.error.length !== 0) return reject({ error: res.error, count: n });
                resolve({ location: res.location, count: n });
            });
        });
    },
    exportJSON: (data, id) => {
        if (data.error) {
            return {
                jsonrpc: '2.0',
                id: id,
                error: data.error,
            }
        };
        return {
            jsonrpc: '2.0',
            id: id,
            result: data
        }
    },
}

const app = new koa(), router = new koaRouter();
const cfgService = {
    RPC: "http",
    hub: "hub",
    ping: "ping",
}
const listen = {
    run: (obj) => {
        app.use(bodyParser({
            detectJSON: function (ctx) {
                return ctx;
            }
        }));
        for (var k in cfgService) {
            if (listen[cfgService[k]]) listen[cfgService[k]]();
        }

        app.use(router.routes());

        const port = obj.port;
        app.listen(port, () => {
            //1.bind application to server port
            output(`vService running at port ${port}`, "", true);
            output(`http://localhost:${port}`, "primary", true);
            output(`curl "http://localhost:${port}/ping"\n`, "", true);

            //2.start auto actions
            for (var k in me.action) me.action[k](config);
        });
    },
    http: () => {
        // call from Hub of exposed method
        router.post("/", async (ctx) => {
            const header = ctx.request.header;
            const req = ctx.request.body;
            const start = tools.stamp();
            output(`--------------------------- request start ---------------------------`, "success", true);
            output(`[ call ] stamp: ${start}, JSON RPC : ${JSON.stringify(req)}`, "", true);
            if (!req.method || !me.mod[req.method]) {
                return ctx.body = self.exportJSON({ error: "unkown call" }, req.id);
            }
            if (!req.params || !req.params.token) {
                return ctx.body = self.exportJSON({ error: "no authority" }, req.id);
            }

            //2.check Hub token
            const DB = require("../lib/mndb.js");
            const token = req.params.token;
            const hub = DB.key_get(token);
            if (hub === null) return ctx.body = self.exportJSON({ error: "illigle token" }, req.id);

            const result = await me.mod[req.method](req.method, req.params, req.id, config);
            ctx.body = self.exportJSON(!result.error ? result.data : result, req.id);

            const end = tools.stamp();
            output(`[ call ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`, "", true);
            output(`---------------------------- request end ----------------------------\n`, "success", true);
        });
    },
    hub: () => {
        // call from Hub of management
        router.post("/hub", async (ctx) => {
            const header = ctx.request.header;
            const req = ctx.request.body;
            const start = tools.stamp();
            output(`--------------------------- request start ---------------------------`, "success", true);
            output(`[ hub ] stamp: ${start}, JSON RPC : ${JSON.stringify(req)}`, "", true);
            if (!req.method || !me.hub[req.method]) {
                return ctx.body = JSON.stringify({ error: "unkown call" });
            }
            const result = me.hub[req.method](req, ctx.req, config);
            if (result.head) {
                for (var k in result.head) {
                    ctx.set(k, result.head[k])
                }
            }
            ctx.body = self.exportJSON(!result.error ? result.data : result, req.id);

            const end = tools.stamp();
            output(`[ hub ] stamp: ${end}, cost: ${end - start}ms, Result : ${JSON.stringify(result)}`, "", true);
            output(`---------------------------- request end ----------------------------\n`, "success", true);
        });
    },
    ping: () => {
        router.get("/ping", async (ctx) => {
            ctx.body = JSON.stringify({ hello: "world", stamp: tools.stamp() });
        });
    },
}

/************************************************/
/*************** Running logical ****************/
/************************************************/

console.clear();
output(`\nAnchor Gateway vService framework ( v${config.version} ) running...`, "dark", true);


const Valid = require("../lib/valid");
Valid(process.argv.slice(2), (cfg) => {
    if (cfg.error) return output(cfg.error, "error");
    if (!cfg.address) return output(`No manager address, valid hub server.`, "error");
    if (!cfg.port) return output(`No port to bind hub service.`, "error");
    if (cfg.port < 4000) return output(`Please set the bind port > 4000 `, "error");
    self.auto(() => {
        listen.run({ port: cfg.port });
    });
});