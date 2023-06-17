/***********************/
/***********************/

// Drop hub server

const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry=require('../../lib/encry');

const self={
    checkAuthority:(token,ks)=>{
        const stamp=tools.stamp();

        const ekey=DB.key_get(ks.encry);
        const s_key=ekey.key,s_iv=ekey.iv;
        encry.setKey(s_key);
        encry.setIV(s_iv);

        const de_token=encry.decrypt(token);
        if(!de_token) return {error:"Illigle authority token."};


        const auth=JSON.parse(de_token);
        console.log(`Authority:${JSON.stringify(auth)}`);
        const json=DB.key_get(ks.encoded);
        if(json===null){
            return {error:"No authority file."};
        }

        const exp=json.exp;
        console.log(`Authority on Hub:${JSON.stringify(exp)}`);
        if(auth.password!==exp.password){
            return {error:"Illigle authority of pass"};
        }
        if(auth.file!==exp.file){
            return {error:"Illigle authority of file"};
        }

        if(stamp>auth.password){
            return {error:"Expired authority"};
        }
        return true;
    },  
}

module.exports=(method,params,id,config)=>{
    if(method!=="drop") return {error:"illegle request"};

    const ks=config.keys;
    const check=self.checkAuthority(params.token,ks);
    if(check!==true){
        return {error:check.error};
    }

    // const start=tools.stamp();
    // console.log(`[ drop ] called : ${JSON.stringify(params)}, stamp ${start}`);

    DB.key_del(ks.encoded);
    const stamp=tools.stamp;

    const res={
        data:{
            success:true,
        },
        stamp:stamp,
    }
    
    return res;
};