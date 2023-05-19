const koa=require("../../package/node/koa.node");
const bodyParser = require("koa-bodyparser");
const Rt=require("koa-router");
const app=new koa();
const router=new Rt();
//app.use(bodyParser());
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));

//curl "http://localhost:8001" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":1}'
//{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":1}

const { JSONRPCServer } = require("json-rpc-2.0");
const server = new JSONRPCServer();
server.addMethod("echo", ({ text }) => text);
server.addMethod("log", ({ message }) => console.log(message));

app.use(router.routes());
router.post("/", async (ctx) => {
    const jsonRPCRequest = ctx.request.body;
    server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        //console.log(ctx.response);
        console.log(JSON.stringify(jsonRPCResponse));
        //console.log(ctx.res);
        //ctx.res.body=JSON.stringify(jsonRPCResponse);
        //ctx.body=jsonRPCResponse;
    });
});

const port=8001;
app.listen(port,()=>{
    console.log(`JSON RPC 2.0 server running at port ${port}`);
    console.log(`http://localhost:${port}`);

    console.log(`Testing command lines:`);
    console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'`)
});