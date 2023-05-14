
//koa-router            //tested
//koa-bodyparser        //
//koa-jwt               //https://www.jianshu.com/p/2552cdf35e66
//koa-helmet            //security extend

//koa demo
//https://www.jianshu.com/p/2b135f798d46

const koa=require("koa");
let app=new koa();

/******************koa-router example******************/
const Rt=require("koa-router");
const router=new Rt();
//console.log(router);

app.use(router.routes());
//app.use(router.allowMethods());

router.get("/",async (ctx)=>{
    ctx.body=JSON.stringify({"hello":"world peace"});
    //console.log(ctx.query);
    //console.log(ctx.querystring);
    //console.log(ctx.request);
});

router.get("/good",async (ctx)=>{
    ctx.body=JSON.stringify({"good":"world peace"});
});

/******************koa-jwt example******************/
const jwt = require('koa-jwt');
const secret = 'moyufed-test'; 
console.log(jwt);
app.use(jwt({
    secret,
    debug: true // 开启debug可以看到准确的错误信息
}));

router.get("/auth",async (ctx)=>{
    ctx.body = ctx.state.user;
});



const port=6677;
app.listen(port,()=>{
    console.log(`Http server running at port ${port}`);
});

