/***********************/
/***********************/

const {Keyring}=require('@polkadot/api');
const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry=require('../../lib/encry');

module.exports=(method,params,id,config)=>{
    if(method!=="auth") return {error:"illegle request"};

    // const start=tools.stamp();
    // console.log(`[ auth ] called : ${JSON.stringify(params)}, stamp ${start}`);

    //1.check the uploader file expire time
    const stamp=tools.stamp();
    const ks=config.keys;
    const json=DB.key_get(ks.encoded);
    if(json.exp>stamp) return {error:"Encry JSON file expired."}

    //2.decode the password
    const ekey=DB.key_get(ks.encry);
    const s_key=ekey.key,s_iv=ekey.iv;
    encry.setKey(s_key);
    encry.setIV(s_iv);
    const de_pass=encry.decrypt(params.pass);

    //3.Polkadot Keyring to decode the JSON file to confirm the authority
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.createFromJson(json);
    try {
        pair.decodePkcs8(de_pass);
        const host=DB.key_get(ks.host),runner=host.runner;
        if(runner!==pair.address) return {error:"Illegal account"}

        //3. set up the access
        const exp_pass=stamp+config.expire.password;
        const fa=DB.key_get(ks.encoded);
        fa.exp.password=exp_pass;

        const access=encry.encrypt(JSON.stringify({file:fa.exp.file,password:exp_pass}));
        //4. remove the encoded json file
        const result={
            data:{
                access:access,
                exp:fa.exp,
            },
        }
        return result;
        
    } catch (error) {
        return {error:error}
    }
};