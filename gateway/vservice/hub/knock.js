/***********************/
/***********************/

//1. Hub `knock` vService to get a temp salt ( char(8) );  --- to avoid DDOS crack
//2. Hub `reg` vService by sent the AES data ({runner:"",aes:"md5(rand)"}) encrypt by md5(`secret code`+salt);
//3. vService confirm the `reg`, then response an access token ( char(16) ) which will expire in (1+float) hour;
//4. vService will `ping` the Hub `pong` with AES data ({token:"char(16)"}) encrypt by Hub aes per hour;
//5. Hub reponse new AES key ({token:"md5()"}) to vService encrypt by previous one.
//6. Hub get the new token to access vService;

const DB=require("../../lib/mndb.js");
const tools=require("../../lib/tools");
const {output}=require("../../lib/output");

module.exports=(req,server,config)=>{
    output(`[ knock ] called : ${JSON.stringify(req)}`,"",true);
    //console.log(server);
    //1.DDOS check to avoid too much request

    //2.new salt to Hub
    const salt=tools.char(4)+tools.sn(4);
    DB.key_set(salt,{
        secret:DB.key_get("secret"),
        exp:tools.stamp()+config.expire.spam,    //expired in 10 seconds
        server:"IP",
    });

    const result={
        data:{
            salt:salt,
        },
        stamp:tools.stamp(),
    }
    output(`[ knock ] response : ${JSON.stringify(result)}\n`,"",true)
    return result;
};