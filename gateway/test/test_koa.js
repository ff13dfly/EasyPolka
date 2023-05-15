
//koa-router            //tested
//koa-bodyparser        //
//koa-jwt               //https://www.jianshu.com/p/2552cdf35e66
//koa-helmet            //security extend

//koa demo
//https://www.jianshu.com/p/2b135f798d46

const koa=require("../../package/node/koa.node");
let app=new koa();

console.log(koa);

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
// const jwt = require('koa-jwt');
// const secret = 'moyufed-test'; 
// console.log(jwt);
// app.use(jwt({
//     secret,
//     debug: true // 开启debug可以看到准确的错误信息
// }));

// router.get("/auth",async (ctx)=>{
//     ctx.body = ctx.state.user;
// });


const jsonwebtoken = require('jsonwebtoken');
const secret="abc";
//console.log(jsonwebtoken.sign);
const json={
    good:"day",
    name:"fuu",
    hello:"world",
}
const cfg={
    //algorithm: 'RS256',
    expiresIn: '3h'
}
const token = jsonwebtoken.sign(json, secret, cfg);
//console.log(token);

jsonwebtoken.verify(token, secret, function(err, decoded) {
    console.log(decoded) // bar
});

//token is including the data needed to transport

//salt: abc,abcd
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibW95dWZlZCIsImlhdCI6MTY4NDEwNzAyMiwiZXhwIjoxNjg0MTE3ODIyfQ.uy2bdBdQvDzCMI3JFx8humP7vNU3iEkReV7K3eYPTGo
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibW95dWZlZCIsImlhdCI6MTY4NDEwNjk1NCwiZXhwIjoxNjg0MTE3NzU0fQ.av2TIU1iKIT0SYXNyvODyDyjm2ACZvZnnOlLwDhu6G4
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibW95dWZlZCIsImlhdCI6MTY4NDEwNjkxNCwiZXhwIjoxNjg0MTE3NzE0fQ.yigMLdVNBGTTr6w3u3zVGqtzIvQKIKg2NGCbFho5fzc
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZnV1IiwiaGVsbG8iOiJ3b3JsZCIsImdvb2QiOiJkYXkiLCJpYXQiOjE2ODQxMDcxMjUsImV4cCI6MTY4NDExNzkyNX0.sUx3tfEFFMl5kh7yIjkceO3HG4CmRpq_F1lori4-rCU
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJnb29kIjoiZGF5IiwibmFtZSI6ImZ1dSIsImhlbGxvIjoid29ybGQiLCJpYXQiOjE2ODQxMDcxNjksImV4cCI6MTY4NDExNzk2OX0.v8MBjRa3Fn3ELp5x4WbBZWkeI9fAbLSRZyeR1LQMiYk
const port=6677;
app.listen(port,()=>{
    console.log(`Http server running at port ${port}`);
});

