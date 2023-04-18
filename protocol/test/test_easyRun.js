"use strict";
// npx tsc test_easyRun.ts --skipLibCheck
// node test_easyRun.js
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("@polkadot/api");
var interpreter_1 = require("../src/interpreter");
var anchorJS = require("../lib/anchor").anchorJS;
var API = {
    "common": {
        "latest": anchorJS.latest,
        "target": anchorJS.target,
        "history": anchorJS.history,
        "owner": anchorJS.owner,
        "subcribe": anchorJS.subcribe,
        "block": anchorJS.block,
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
    auto: function (list) {
        // ApiPromise.create({ provider: new WsProvider(config.endpoint) }).then((api) => {
        //     console.log('Linker to substrate node created...');
        //     websocket=api;
        //     anchorJS.set(api);
        //     anchorJS.setKeyring(Keyring);
        //     self.prework(()=>{
        //         test_start=self.stamp();
        //         console.log(`\n********************Start of Writing Mock Data********************\n`);
        //         self.run(list,list.length);
        //     });
        // });
    },
};
var server = "ws://127.0.0.1:9944";
self.prepare(server, function () {
    var linker_params = "anchor://entry_app/?hello=world&me=fuu";
    var linker_target = "anchor://entry_app/3/?hello=world&me=fuu";
    var linker_data_caller = "anchor://data_caller";
    var linker_auth_me_direct = "anchor://auth_me_direct";
    var linker_hide_me_by_anchor = "anchor://hide_me_by_anchor";
    var linker_complex_anchor = "anchor://complex_anchor/";
    var linker_full_app = "anchor://full_app/";
    var linker_full_caller = "anchor://full_caller/?hello=world&me=fuu";
    var linker_lib_caller = "anchor://js_a/";
    (0, interpreter_1.easyRun)(linker_full_caller, API, function (result) {
        console.log("-----------------result-----------------");
        console.log(JSON.stringify(result));
    });
});
var task = [];
self.auto(task);
