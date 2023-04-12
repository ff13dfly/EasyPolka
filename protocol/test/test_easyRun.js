"use strict";
// npx tsc test_easyRun.ts --skipLibCheck
// node test_easyRun.js
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("@polkadot/api");
var anchorJS = require("../lib/anchor").anchorJS;
var interpreter_1 = require("../src/interpreter");
var API = {
    "common": {
        "latest": anchorJS.latest,
        "target": anchorJS.target,
        "history": anchorJS.history,
        "owner": anchorJS.owner,
        "subcribe": anchorJS.subcribe,
    },
};
var self = {
    prepare: function (node, ck) {
        try {
            //console.log({node});
            var provider = new api_1.WsProvider(node);
            api_1.ApiPromise.create({ provider: provider }).then(function (api) {
                if (!anchorJS.set(api)) {
                    console.log('Error anchor node.');
                }
                anchorJS.setKeyring(api_1.Keyring);
                return ck && ck();
            });
        }
        catch (error) {
            return ck && ck(error);
        }
    },
};
var server = "ws://127.0.0.1:9944";
self.prepare(server, function () {
    //const linker="anchor://entry_app/?hello=world&me=fuu";
    //const linker="anchor://entry_app/3/?hello=world&me=fuu";
    //const linker="anchor://data_caller";
    //const linker="anchor://auth_me_direct";
    var linker = "anchor://auth_me_by_anchor";
    (0, interpreter_1.easyRun)(linker, API, function (result) {
        console.log("-----------------result-----------------");
        console.log(result);
        console.log(JSON.stringify(result.data));
        //new Function("anchorJS","error",result.raw);
        //new Function("container","API","args","from","error",res.raw);
        if (result.app)
            result.app("con_id", API, { "hello": "world" });
    });
});
