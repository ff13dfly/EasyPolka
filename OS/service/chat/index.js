//########## RUNNING ##########
// node index.js

// ## abanded, runner will be on config.json
// node index.js config.json 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw  

const {output}=require("../lib/output");
const Valid = require("../lib/valid");
const Chat=require("../lib/chat");
const Paytovertify=require("../lib/paytovertify");

const version="1.0.1";
console.clear();
output(`W3OS chatting service ( v${version} ) running...`,"dark",true);
Valid(process.argv.slice(2),(res)=>{
    const cfg=res.data;
    const agent={
        reg:(acc,ck)=>{
            output(`Ready to reg "${acc}"`);
            Paytovertify.agent(
                (res)=>{    //when vertification successful
                    console.log(res);
                },
                (res)=>{    //when vertification failed
                    console.log(res);
                }
            );
            Paytovertify.subcribe(()=>{
        
            });

            Paytovertify.add(acc,false,(amount)=>{
                output(`The pay amount is ${amount}`);
                return ck && ck(amount);
            });
        },
        live:()=>{

        },
        offline:(from,to,msg)=>{
            output(`Ready to cache "${msg}" from ${from} to ${to}`);
            
        },
    }
    Chat.init(cfg.server.port,agent);
});