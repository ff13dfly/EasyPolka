/***********************/
/***********************/

const DB = require("../../lib/mndb");
const tools = require("../../lib/tools");

let timer=null;
let secret=tools.sn();
DB.key_set("secret",secret);

module.exports = (config) => {
    //console.log(`This is from action "tick"`);
    
    //let secret=tools.vcode();
    console.log(config.theme.success,`---------------------------- secret code ----------------------------`)
    console.log(`Secret code, this is for Gateway Hub to dock this vService.`)
    console.log(config.theme.primary,secret);
    console.log(`Will expire in 2 minutes at ${new Date(tools.stamp()+config.interlval)}`);
    console.log(config.theme.success,`---------------------------- secret code ----------------------------\n`)

    DB.key_set("secret",secret);
    timer=setInterval(()=>{
        secret=tools.sn();
        DB.key_set("secret",secret);

        console.log(config.theme.success,`---------------------------- secret code ----------------------------`)
        console.log(`Secret code, this is for Gateway Hub to dock this vService.`)
        console.log(config.theme.primary,secret);
        console.log(`Will expire in 2 minutes at ${new Date(tools.stamp()+config.interlval)}`);
        console.log(config.theme.success,`---------------------------- secret code ----------------------------\n`)

    },config.timer.secret);
};