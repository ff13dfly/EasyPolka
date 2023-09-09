const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter = require("koa-router");
const tools = require("./lib/tools");

const port=4444;
const app = new koa(), router = new koaRouter();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));
app.use(router.routes());

const getResult=(index)=>{
    const at=tools.rand(50,1500);
    return new Promise((resolve, reject) => {
        const data={index:index,stamp:tools.stamp(),more:"vService response"}
        setTimeout(()=>{
            console.log(`${index}:${at}`);
            resolve(data);
        },at)
    })
}

router.post("/", async (ctx) => {
    const data=await getResult(ctx.request.body.index);
    ctx.body = JSON.stringify(data);
});

app.listen(port, () => {
    console.log(`[ vService url ] http://localhost:${port}`);
});