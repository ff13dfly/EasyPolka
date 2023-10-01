//########## RUNNING ##########
// node index.js

// ## abanded, runner will be on config.json
// node index.js config.json 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw  

const {output}=require("../lib/output");
const Valid = require("../lib/valid");
const Chat=require("../lib/chat");
const Paytovertify=require("../lib/paytovertify");
const Chain=require("../lib/chk_polkadot");

const version="1.0.1";
console.clear();
output(`W3OS chatting service ( v${version} ) running...`,"dark",true);

const vertify_account="5EUFM4U2LUypvctxvqnEV2vb3hBABspWUYEjErwRpTbsYEaJ";

Valid(process.argv.slice(2),(res)=>{
    const cfg=res.data;
    Chain.endpoint(cfg.server.polkadot);
    const agent={
        reg:(acc,ck)=>{
            output(`Ready to reg "${acc}"`);
            Paytovertify.account(vertify_account);
            Paytovertify.agent(
                (res)=>{    //when vertification successful
                    output(`Verification successful, ready to sent notification.`,"success");
                    Chat.notification(res.from,{status:1,msg:"Payment vertification successful"});
                },
                (res)=>{    //when vertification failed
                    output(`Verification failed, ready to sent notification.`,"error");
                    Chat.notification(res.from,{status:0,msg:"Payment vertification failed"});
                }
            );

            Paytovertify.subcribe(Chain.subcribe,Chain.convert);

            Paytovertify.add(acc,false,(amount)=>{
                output(`The pay amount is ${amount}`);
                return ck && ck(amount);
            });
        },
        active:()=>{

        },
        leave:()=>{

        },
        offline:(from,to,msg)=>{
            output(`Ready to cache "${msg}" from ${from} to ${to}`);
            
        },
    }
    Chat.init(cfg.server.port,agent);
});