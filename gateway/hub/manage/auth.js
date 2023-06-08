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

    //1.decode the password
    const ks=config.keys;
    const json=DB.key_get(ks.encoded);
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
        const host=DB.key_get(ks.host),runner=host.runner;
        if(runner!==pair.address) return {error:"Illegal account"}

        //3. set up the access
        const stamp=tools.stamp();
        const excutor={salt:tools.char(3),exp:stamp+10000*60};
        DB.key_set(ks.excutor,excutor);
        //console.log(excutor);
        const access=encry.encrypt(JSON.stringify(excutor));

        //4. remove the encoded json file
        const result={
            data:{
                access:access,
            },
        }
    
        return result;
        
    } catch (error) {
        return {error:error}
    }
};