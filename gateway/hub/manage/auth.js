/***********************/
/***********************/

// set special token for JWT what is needed for docking new service

// Security
// 1. not related to account. That will cause ddos to target account.
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


module.exports=(method,params,id,address)=>{

    console.log(`From auth API, params : ${JSON.stringify(params)}`);
    const token=self.char(6,"AU");
    const stamp=self.stamp();
    DB.key_set(token,{stamp:stamp,more:{}});

    const jsonwebtoken = require('jsonwebtoken');
    const sent_encry = jsonwebtoken.sign({token:token,stamp:self.stamp()}, 'spam', {expiresIn:'3h'}); 

    const res={
        data:{
            token:sent_encry,
        },
        success:true,
        stamp:stamp,
    }
    
    return res;
};