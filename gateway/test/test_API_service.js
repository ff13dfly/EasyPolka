const koa=require("../../package/node/koa.node");
const bodyParser = require("koa-bodyparser");
const Rt=require("koa-router");
const app=new koa();
const router=new Rt();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));

//curl "http://localhost:8001" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":1}'
//{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":1}

//https://github.com/koajs/koa/blob/dbf4b8f41286befd53dfd802740f2021441435bf/docs/api/context.md

const { JSONRPCServer } = require("json-rpc-2.0");
const server = new JSONRPCServer();
server.addMethod("echo", (params) => {
    return params.text+' ,this is modified by functions';
});
server.addMethod("log", ({ message }) => console.log(message));

app.use(router.routes());
router.post("/", async (ctx) => {
    console.log(`Req:${JSON.stringify(ctx.request.body)}\n`)
    const JR2=await server.receive(ctx.request.body);
    console.log(`Res:${JSON.stringify(JR2)}\n`)
    ctx.body=JSON.stringify(JR2);
});

const port=8001;
app.listen(port,()=>{
    console.log(`JSON RPC 2.0 server running at port ${port}`);
    console.log(`http://localhost:${port}`);

    console.log(`Testing command lines:`);
    console.log(`curl "http://localhost:${port}" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'`)
});