const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const koaRouter = require("koa-router");
const tools = require("./lib/tools");
const axios= require("axios").default;

const self = {
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
    getFromService:(cfg)=>{
        return new Promise((resolve, reject) => {
            axios(cfg).then((res)=>{
                const data=res.data;
                resolve(data);
            }).catch((err)=>{
               console.log(err);
            });
        })
    },
}

const port=3333;
const app = new koa(), router = new koaRouter();
app.use(bodyParser({
    detectJSON: function (ctx) {
        return ctx;
    }
}));
app.use(router.routes());

router.get("/", async (ctx) => {
    const params = self.getParams(ctx.request.url);
    console.log(params);
    const data={hello:"world",stamp:tools.stamp()}
    ctx.body = JSON.stringify(data);
});

router.post("/direct", async (ctx) => {
    const data={hello:"world",stamp:tools.stamp(),index:ctx.request.body.index}
    ctx.body = JSON.stringify(data);
});


// router.post("/server",async (ctx) => {
//     const cfg={
//         method: 'post',
//         url: "http://localhost:4444",
//         data:{"index":ctx.request.body.index},
//     }
//     const result=await self.getFromService(cfg);
//     ctx.body = JSON.stringify(result);
// });

router.post("/server",(ctx) => {
    ctx.body ="ok";
    // const cfg={
    //     method: 'post',
    //     url: "http://localhost:4444",
    //     data:{"index":ctx.request.body.index},
    // }
    // const result=self.getFromService(cfg);
    // ctx.body = JSON.stringify(result);
});



app.listen(port, () => {
    console.log(`[ Hub url ] http://localhost:${port}`);
});