/***********************/
/***********************/

// call to get the salt of target account

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
    const spam=self.char(8);
    const stamp=self.stamp();
    DB.key_set(spam,{stamp:stamp,more:{}});
    const res={
        spam:spam,
        stamp:stamp,
    }
    return res;
};