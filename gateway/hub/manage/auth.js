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
    const mock_runner="5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw";       //mock running address
    
    const encry=require('../lib/encry');
    const md5=encry.md5(mock_runner);
    const key=md5.substring(0,16),iv=md5.substring(16,32);
    encry.setKey(key);
    encry.setIV(iv);
    const de_result=encry.decrypt(params.code);
    if(!de_result){
        return {error:"No authority to access."}
    }

    const arr=de_result.split(".");
    encry.setKey(arr[0]);
    encry.setIV(arr[1]);

    const s_key='1234123412341234',s_iv='5566556655665566'
    const security=encry.encrypt(`${s_key}.${s_iv}`);
    const stamp=self.stamp();
    const res={
        data:{
            token:security,
            encry:de_result,
        },
        success:true,
        stamp:stamp,
    }
    
    return res;
};