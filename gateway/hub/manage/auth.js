
const {Keyring}=require('@polkadot/api');
const tools=require('../lib/tools.js');
const DB=require("../../lib/mndb.js");
const encry=require('../lib/encry');

module.exports=(method,params,id,address)=>{
    console.log(`From auth API, params : ${JSON.stringify(params)}`);
    const stamp=tools.stamp();
    const runner='5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw';
    const json=DB.key_get(runner);

    const s_key='1234123412341234',s_iv='5566556655665566'
    encry.setKey(s_key);
    encry.setIV(s_iv);
    const de_pass=encry.decrypt(params.pass);

    //2.Polkadot Keyring to decode the JSON file to confirm the authority
    //console.log(json);
    const keyring = new Keyring({ type: 'sr25519' });
    //json.address="333444";
    const pair = keyring.createFromJson(json);
    try {
        pair.decodePkcs8(de_pass);
        console.log(pair.address);

    } catch (error) {
        console.log(error);
    }

    const jsonwebtoken = require('jsonwebtoken');
    const secret=tools.char(20);
    const cfg={
        expiresIn: 60 * 60,
    }
    const token = jsonwebtoken.sign({"hello":"account"}, secret, cfg);
    console.log(secret);
    console.log(token);



    const res={
        data:{
            //secret:secret,
            //token:token,
            cache:json,
            password:de_pass,
        },
        stamp:stamp,
    }

    return res;
};