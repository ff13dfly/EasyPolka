/***********************/
/***********************/

const JWT=require("jsonwebtoken");
const DB=require("../../lib/mndb.js");


const self={
    stamp:()=>{
        return new Date().getTime();
    },
    rand:(m,n)=>{return Math.floor(Math.random() * (m-n+1) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
    },
}

module.exports=(req,server)=>{
    console.log(`[ knock ] called : ${JSON.stringify(req)}`);
    const salt=req.params.salt;
    const token=self.char(6);           //need to save
    DB.key_set("hub",token);
    console.log(DB.key_get("hub"));

    const encry = JWT.sign(
        {salt:salt,uri:"http://localhost:4501",token:token,from:"vService"},
        salt, 
        {expiresIn: '3h'});

    const result={
        data:{
            success:true,
        },
        head:{
            encry:encry,
        },
        stamp:self.stamp(),
    }
    console.log(`[ knock ] response : ${JSON.stringify(result)}\n`)
    return result;
};