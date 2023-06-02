/***********************/
/***********************/

// call to get the salt of target account

// Security
// 1. not related to account. That will cause ddos to target account.
const DB = require("../../lib/mndb.js");
const tools = require("../../lib/tools");

const self = {
    clean:()=>{     //clean the expired spam

    },
}
module.exports = (method, params, id, config,env) => {
    //TODO, record the request to avoid DDOS
    //1.log the request to avoid DDOS
    const spam = tools.char(8);
    const stamp = tools.stamp();
    const exp = stamp + config.expire.spam;


    const ks=config.keys;
    DB.list_push(ks.clean,spam);
    DB.hash_set(ks.spam,spam, {
        start: stamp, 
        exp: exp, 
        more: {
            IP:env.IP,      //store the IP to confirm IP
        }
    });

    const res = {
        spam: spam,
        stamp: stamp,
    }
    return res;
};