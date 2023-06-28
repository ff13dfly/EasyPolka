
//koa-router            //tested
//koa-bodyparser        //
//koa-jwt               //https://www.jianshu.com/p/2552cdf35e66
//koa-helmet            //security extend

//koa demo
//https://www.jianshu.com/p/2b135f798d46

//../../node_modules/.bin/esbuild gateway.js --bundle --minify --outfile=koa.min.js --platform=node

const fs=require('fs');
const file={
    read:(target,ck,)=>{
        fs.stat(target,(err,stats)=>{
            if (err) return ck && ck({error:err});
            if(!stats.isFile()) return ck && ck(false);
            fs.readFile(target,(err,data)=>{
                if (err) return ck && ck({error:err});
                return ck && ck(data.toString());
            });
        });
    },
    save:(name,data,ck)=>{
        fs.writeFile(name, data,'utf8',function (err) {
            if (err) return ck && ck({error:err});
            return ck && ck(true);
        });
    },
};


const koa=require("../../../package/node/koa.node");
//const anchorJS=require("../../../package/node/anchor.node");
//const polkadot=require("../../../package/node/polkadot.node");
//const easy=require("../../../package/node/easy.node");
let app=new koa();

/******************koa-router example******************/
const Rt=require("../../../package/node/koa-router.node"),router=new Rt();
app.use(router.routes());

router.get("/",async (ctx)=>{
    ctx.body=JSON.stringify({"hello":"world peace"});
});

router.get("/good",async (ctx)=>{
    ctx.body=JSON.stringify({"good":"world peace"});
    file.save("test","good day");
});

const port=6677;
app.listen(port,()=>{
    console.log(`Http server running at port ${port}, url: http://localhost:${port}`);
});

