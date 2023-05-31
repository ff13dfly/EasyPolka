/***********************/
/***********************/
const DB=require("../../lib/mndb");
const tools=require("../../lib/tools");
const encry=require('../../lib/encry');

const self={
    getKeyIV:(secret,salt)=>{
        const md5=encry.md5(secret+salt);
        const key=md5.substring(0,16),iv=md5.substring(16,32);
        return {key:key,iv:iv};
    },
}

module.exports=(req,server)=>{  
    console.log(`[ reg ] called : ${JSON.stringify(req)}`); 
    if(!req.params) return {error:"Invalid request."};
    if(!req.params.encry) return {error:"Invalid request data."};
    if(!req.params.salt) return {error:"Invalid salt."};
    //1.get the right secret
    const code=req.params.encry;
    const salt=req.params.salt;
    const data=DB.key_get(salt);
    if(!data) return {error:"Error salt"};
    if(tools.stamp()>data.exp)  return {error:"Expired salt"};

    //2.decode the encry code
    const secret=data.secret;
    const obj=self.getKeyIV(secret,salt);
    encry.setKey(obj.key);
    encry.setIV(obj.iv);
    const ddata=encry.decrypt(code);
    console.log(ddata);
    try {
        const reg=JSON.parse(ddata);
        console.log(reg);
        const result={
            data:{
                name:"vHistory",
                exposed:{
                    view:{},
                    history:{},
                },
                test:{
                    view:{
                        params:[],
                        result:'',
                    },
                    history:{
                        params:[],
                        result:'',
                    },
                },
                success:true,
            },
            stamp:tools.stamp(),
        }
        console.log(`[ reg ] response : ${JSON.stringify(result)}\n`);
        return result;
    } catch (error) {
        return {error:error}
    }
};