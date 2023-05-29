/***********************/
/***********************/

// upload runner auth JSON file. Hub can decode it from encry string then compare with the anchor data.

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
    console.log(`From upload API, params : ${JSON.stringify(params)}`);

    const encry=require('../lib/encry');
    const s_key='1234123412341234',s_iv='5566556655665566'
    encry.setKey(s_key);
    encry.setIV(s_iv);
    const de_file=encry.decrypt(params.file);

    try {
        const json=JSON.parse(de_file);
        console.log(json);

    } catch (error) {
        
    }

    const spam=self.char(13);
    const stamp=self.stamp();
    DB.key_set(spam,{stamp:stamp,more:{}});
    const res={
        hello:"uploading",
        spam:spam,
        stamp:stamp,
    }
    
    return res;
};