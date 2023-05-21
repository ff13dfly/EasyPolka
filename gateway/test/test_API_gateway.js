
const koa=require("../../package/node/koa.node");
const Rt=require("koa-router");
let app=new koa();
const router=new Rt();
app.use(router.routes());

// 1.init token
router.get("/:act",async (ctx)=>{
    const result={
        "token":cAPI.token(),
        "url":ctx.url,
        "query":ctx.query,
        "querystring":ctx.querystring,
        "param":ctx.params,
    }
    ctx.body=JSON.stringify(result);
});

//2. vservice call
router.get("/:service/:action",async (ctx)=>{
    console.log(ctx.params);
    const result={
        "token":cAPI.token(),
        "url":ctx.url,
        "query":ctx.query,
        "querystring":ctx.querystring,
        "param":ctx.params,
    }
    ctx.body=JSON.stringify(result);
});


/***************************************/
/************* server start ************/
/***************************************/
const port=1234;
app.listen(port,()=>{
    console.log(`Http server running at port ${port}`);
    console.log(`http://localhost:${port}`);
});