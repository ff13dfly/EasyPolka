//########## RUNNING ##########
// node index.js

// ## build command
// yarn add esbuild
// ../../node_modules/esbuild/bin/esbuild index.js --bundle --minify --outfile=./chat_server.min.js --platform=node

// ## abanded, runner will be on config.json
// node index.js config.json 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw  

// ## server iptables
// iptables -I INPUT -p tcp --dport 7788 -j ACCEPT

const {output}=require("../lib/output");
const Valid = require("../lib/valid");
const Chat=require("../lib/chat");
const Paytovertify=require("../lib/paytovertify");
const Chain=require("../lib/chk_polkadot");
const History=require("../lib/history");

const version="1.0.1";
console.clear();
output(`W3OS chatting service ( v${version} ) running...`,"dark",true);

Valid(process.argv.slice(2),(res)=>{
    const cfg=res.data;
    Chain.endpoint(cfg.server.polkadot);
    const agent={
        reg:(acc,ck)=>{
            output(`Ready to reg "${acc}"`);
            Paytovertify.account(cfg.server.vertification);
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
                return ck && ck(amount,cfg.server.vertification);
            });
        },
        active:(address,count)=>{
            History.clean(address,count);
            return true;
        },
        leave:()=>{

        },
        offline:(from,to,msg)=>{
            History.message(from,to,msg);
        },
        group:{

        },
        get:{
            message:(address)=>{
                return History.mine(address);
            },
        }
    }
    Chat.init(cfg.server.port,agent);
});