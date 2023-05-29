const tools=require('../lib/tools.js');
const DB=require("../../lib/mndb.js");
const encry=require('../lib/encry');

module.exports=(method,params,id,address)=>{
    console.log(`From auth API, params : ${JSON.stringify(params)}`);
    const stamp=tools.stamp();
    const runner='5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw';
    const json=DB.hash_get(runner);

    
    const s_key='1234123412341234',s_iv='5566556655665566'
    encry.setKey(s_key);
    encry.setIV(s_iv);
    const de_pass=encry.decrypt(params.pass);

    const res={
        data:{
            cache:json,
            password:de_pass,
        },
        stamp:stamp,
    }

    return res;
};