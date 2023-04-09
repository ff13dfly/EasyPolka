"use strict";
// npm i -D typescript
// npx tsc index.ts --skipLibCheck
// node index.js
Object.defineProperty(exports, "__esModule", { value: true });
// declare var ApiPromise: any; 
// declare var WsProvider: any;
// declare var Keyring: any; 
var api_1 = require("@polkadot/api");
var api_2 = require("@polkadot/api");
var anchor_1 = require("../lib/anchor");
var interpreter_1 = require("../src/interpreter");
var API = {
    "common": {
        "latest": anchor_1.anchorJS.latest,
        "target": anchor_1.anchorJS.target,
        "history": anchor_1.anchorJS.history,
        "lib": function (list, ck) {
            var res = [];
            console.log(list);
            return ck && ck(res);
        },
        "owner": anchor_1.anchorJS.owner,
        "subcribe": anchor_1.anchorJS.subcribe,
    },
};
var self = {
    prepare: function (node, ck) {
        try {
            console.log({ node: node });
            var provider = new api_1.WsProvider(node);
            api_1.ApiPromise.create({ provider: provider }).then(function (api) {
                if (!anchor_1.anchorJS.set(api)) {
                    console.log('Error anchor node.');
                }
                anchor_1.anchorJS.setKeyring(api_2.Keyring);
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
    var linker = "anchor://hello/";
    (0, interpreter_1.easyRun)(linker, API, function (res) {
        console.log(res);
    });
});
