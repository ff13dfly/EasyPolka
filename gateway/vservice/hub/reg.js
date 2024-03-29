/***********************/
/***********************/
const DB = require("../../lib/mndb");
const tools = require("../../lib/tools");
const encry = require('../../lib/encry');
const {output}=require("../../lib/output");

const self = {
    getKeyIV: (secret, salt) => {
        const md5 = encry.md5(secret + salt);
        const key = md5.substring(0, 16), iv = md5.substring(16, 32);
        return { key: key, iv: iv };
    },
}

module.exports = (req, server, config) => {
    output(`[ reg ] called : ${JSON.stringify(req)}`);
    //console.log(`[ reg ] called : ${JSON.stringify(req)}`);
    //console.log(`[ reg ] config : ${JSON.stringify(config)}`);
    if (!req.params) return { error: "Invalid request." };
    if (!req.params.encry) return { error: "Invalid request data." };
    if (!req.params.salt) return { error: "Invalid salt." };

    //1.get the right secret
    const code = req.params.encry;
    const salt = req.params.salt;
    const data = DB.key_get(salt);
    if (!data) return { error: "Error salt" };
    if (tools.stamp() > data.exp) return { error: "Expired salt" };

    //2.decode the encry code
    const secret = data.secret;
    const obj = self.getKeyIV(secret, salt);
    encry.setKey(obj.key);
    encry.setIV(obj.iv);
    const ddata = encry.decrypt(code);
    //console.log(`Decode result : ${ddata}`);
    try {
        const reg = JSON.parse(ddata);
        const token=tools.char(16);
        reg.active=token;
        DB.hash_set(config.keys.hubs, reg.URI, reg);    //save Hub details
        DB.key_set(token,reg.URI);                      //set token-Hub map
        const result = {
            data: {
                name: "vHistory",
                exposed: {
                    view: {
                        "intro": "",
                        "params": {
                            "name": "string"
                        }
                    },
                    target: {
                        "intro": "",
                        "params": {
                            "name": "string",
                            "block": "blocknumber"
                        }
                    },
                    history: {
                        "intro": "",
                        "params": {
                            "name": "string",
                            "page": "u32",
                            "step": "u32"
                        }
                    },
                    testing: {
                        "intro": "",
                        "params": {
                            "stamp": "stamp"
                        }
                    },
                },
                test: {
                    view: {
                        params: [],
                        result: '',
                    },
                    target: {
                        params: [],
                        result: '',
                    },
                    history: {
                        params: [],
                        result: '',
                    },
                },
                token:token,
                success: true,
            },
            stamp: tools.stamp(),
        }
        //console.log(`[ reg ] response : ${JSON.stringify(result)}\n`);
        return result;
    } catch (error) {
        output(error,"error");
        return { error: error }
    }
};