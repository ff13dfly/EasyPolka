
const {Keyring}=require('@polkadot/api');
const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry=require('../lib/encry');

module.exports=(method,params,id,config)=>{
    console.log(`From auth API, params : ${JSON.stringify(params)}`);
    const ks=config.keys;
    const runner=DB.key_get(ks.runner);
    const json=DB.key_get(ks.encoded);

    const stamp=tools.stamp();

    const ekey=DB.key_get(ks.encry);
    const s_key=ekey.key,s_iv=ekey.iv;
    encry.setKey(s_key);
    encry.setIV(s_iv);
    const de_pass=encry.decrypt(params.pass);

    //2.Polkadot Keyring to decode the JSON file to confirm the authority
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.createFromJson(json);
    try {
        pair.decodePkcs8(de_pass);
        console.log(pair.address);
    } catch (error) {
        console.log(error);
    }

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