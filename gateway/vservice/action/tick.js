const DB = require("../../lib/mndb");
const tools = require("../../lib/tools");
const { output } = require("../../lib/output");
let timer=null;
let secret=tools.sn();
DB.key_set("secret",secret);

module.exports = (config) => {
    //console.log(`This is from action "tick"`);
    
    //let secret=tools.vcode();
    output(`---------------------------- secret code ----------------------------`,"success",true);
    output(`Secret code, this is for Gateway Hub to dock this vService.`,"",true);
    output(secret,"primary",true);
    output(`Will expire in 2 minutes at ${new Date(tools.stamp()+config.interlval)}`,"",true);
    output(`---------------------------- secret code ----------------------------\n`,"success",true);

    DB.key_set("secret",secret);
    timer=setInterval(()=>{
        secret=tools.sn();
        DB.key_set("secret",secret);
        output(`---------------------------- secret code ----------------------------`,"success",true);
        output(`Secret code, this is for Gateway Hub to dock this vService.`,"",true);
        output(secret,"primary",true);
        output(`Will expire in 2 minutes at ${new Date(tools.stamp()+config.interlval)}`,"",true);
        output(`---------------------------- secret code ----------------------------\n`,"success",true);
    },config.timer.secret);
};