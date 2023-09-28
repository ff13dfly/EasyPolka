//########## RUNNING ##########
// node index.js

// ## abanded, runner will be on config.json
// node index.js config.json 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw  

const {output}=require("../lib/output");
const Valid = require("../lib/valid");
const chat=require("../lib/chat");

const version="1.0.1";
console.clear();
output(`W3OS chatting service ( v${version} ) running...`,"dark",true);
Valid(process.argv.slice(2),(res)=>{
    const cfg=res.data;
    //console.log(cfg);
    //console.log(chat);
    const port=cfg.server.port;
    chat.init(port);
});