/***********************/
/***********************/

//1. Hub `knock` vService to get a temp salt ( char(8) );  --- to avoid DDOS crack
//2. Hub `reg` vService by sent the AES data ({runner:"",aes:"md5(rand)"}) encrypt by md5(`secret code`+salt);
//3. vService confirm the `reg`, then response an access token ( char(16) ) which will expire in (1+float) hour;
//4. vService will `ping` the Hub `pong` with AES data ({token:"char(16)"}) encrypt by Hub aes per hour;
//5. Hub get the new token to access vService;

const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");
module.exports=(req,server)=>{
    console.log(`[ knock ] called : ${JSON.stringify(req)}`);
    //console.log(server);
    //1.DDOS check to avoid too much request

    //2.new salt to Hub
    const salt=tools.char(4)+tools.sn(4);
    DB.key_set(salt,{
        secret:DB.key_get("secret"),
        exp:tools.stamp()+10000,    //expired in 10 seconds
        server:"IP",
    });

    const result={
        data:{
            salt:salt,
        },
        stamp:tools.stamp(),
    }
    console.log(`[ knock ] response : ${JSON.stringify(result)}\n`)
    return result;
};