
//koa-router            //tested
//koa-bodyparser        //
//koa-jwt               //https://www.jianshu.com/p/2552cdf35e66
//koa-helmet            //security extend

//koa demo
//https://www.jianshu.com/p/2b135f798d46

const koa=require("../../../package/node/koa.node");
let app=new koa();

/******************koa-router example******************/
const Rt=require("koa-router"),router=new Rt();
app.use(router.routes());

router.get("/",async (ctx)=>{
    ctx.body=JSON.stringify({"hello":"world peace"});
});

router.get("/good",async (ctx)=>{
    ctx.body=JSON.stringify({"good":"world peace"});
});

const port=6677;
app.listen(port,()=>{
    console.log(`Http server running at port ${port}, url: http://localhost:${port}`);
});

