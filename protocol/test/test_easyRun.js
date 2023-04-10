"use strict";
// npx tsc test_easyRun.ts --skipLibCheck
// node test_easyRun.js
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("@polkadot/api");
var anchor_1 = require("../lib/anchor");
//import { anchorLocation } from "../src/protocol";
var interpreter_1 = require("../src/interpreter");
var API = {
    "common": {
        "latest": anchor_1.anchorJS.latest,
        "target": anchor_1.anchorJS.target,
        "history": anchor_1.anchorJS.history,
        "owner": anchor_1.anchorJS.owner,
        "subcribe": anchor_1.anchorJS.subcribe,
    },
};
var self = {
    prepare: function (node, ck) {
        try {
            //console.log({node});
            var provider = new api_1.WsProvider(node);
            api_1.ApiPromise.create({ provider: provider }).then(function (api) {
                if (!anchor_1.anchorJS.set(api)) {
                    console.log('Error anchor node.');
                }
                anchor_1.anchorJS.setKeyring(api_1.Keyring);
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
    var linker = "anchor://data_caller";
    (0, interpreter_1.easyRun)(linker, API, function (result) {
        console.log(result);
        //new Function("anchorJS","error",result.raw);
        //new Function("container","API","args","from","error",res.raw);
        if (result.app)
            result.app("con_id", API, { "hello": "world" });
    });
});
