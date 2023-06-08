/***********************/
/***********************/

const DB = require("../../lib/mndb");
const tools = require("../../lib/tools");

module.exports = (req, server, config) => {
    console.log(`[ unlink ] called : ${JSON.stringify(req)}`);
    const token = req.params.token;
    const hub=DB.key_get(token);
    if(hub===null) return {error:"illigle token"};

    const hubs=DB.hash_all(config.keys.hubs);
    delete hubs[hub];

    const result={
        data:{
            msg:"vService unlinked",
        },
        stamp:tools.stamp(),
    }
    console.log(`[ unlink ] response : ${JSON.stringify(result)}\n`)
    return result;
};