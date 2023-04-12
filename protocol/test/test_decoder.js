"use strict";
// npx tsc test_decoder.ts --skipLibCheck
// node test_decoder.js
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("@polkadot/api");
var api_2 = require("@polkadot/api");
var anchorJS = require("../lib/anchor").anchorJS;
var decoder_1 = require("../src/decoder");
var API = {
    "common": {
        "latest": anchorJS.latest,
        "target": anchorJS.target,
        "history": anchorJS.history,
        "lib": function (list, ck) {
            var res = [];
            console.log(list);
            return ck && ck(res);
        },
        "owner": anchorJS.owner,
        "subcribe": anchorJS.subcribe,
    },
};
var self = {
    prepare: function (node, ck) {
        try {
            console.log({ node: node });
            var provider = new api_1.WsProvider(node);
            api_1.ApiPromise.create({ provider: provider }).then(function (api) {
                if (!anchorJS.set(api)) {
                    console.log('Error anchor node.');
                }
                anchorJS.setKeyring(api_2.Keyring);
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
    //easyRun(["hello",223],API,()=>{});
    //easyRun(["你好",1234],API,()=>{});
    //const data=easyProtocol(rawType.APP);
    var anchor_location = [
        "anchor://hello",
        "anchor://hello/",
        "anchor://hello/128",
        "anchor://hello/128/",
        "anchor://hello?ka=333&kb=string",
        "anchor://hello/?ka=333&kb=string",
        "anchor://hello/3323?ka=333&kb=data",
        "anchor://hello/3323/?ka=333&kb=data",
        "anchor://heLLo/3323/?pa=333&pb=data",
        "anchor://heL/Lo/3323/?pa=333&pb=data",
        "anchor://hello/bbb/",
        "anchors://hello/344/",
        "anors://hello/344/",
        "hello",
    ];
    for (var i = 0; i < anchor_location.length; i++) {
        var row = anchor_location[i];
        var res = (0, decoder_1.linkDecoder)(row);
        console.log(res);
    }
});
