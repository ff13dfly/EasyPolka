"use strict";
// npm i -D typescript
// npx tsc index.ts
// node index.js
Object.defineProperty(exports, "__esModule", { value: true });
var anchor_1 = require("../lib/anchor");
var format_1 = require("../src/format");
var interpreter_1 = require("../src/interpreter");
var protocol_1 = require("../src/protocol");
var decoder_1 = require("../src/decoder");
var API = {
    "common": {
        "latest": anchor_1.anchorJS.latest,
        "target": anchor_1.anchorJS.target,
        "history": anchor_1.anchorJS.history,
        "lib": function (list, ck) {
            console.log(list);
            return ck && ck();
        },
        "owner": anchor_1.anchorJS.owner,
        "subcribe": anchor_1.anchorJS.subcribe,
    },
    //"polka":{},
    //"gateway":{}
};
var address = "5CaYdQ6i2mWgHmBpQXgmVdPqvYxSwoLo4KFchFnpzn8Kbdtg";
(0, interpreter_1.easyRun)(["hello", 223], address, API, function () { });
(0, interpreter_1.easyRun)(["你好", 1234], address, API, function () { });
var data = (0, format_1.easyProtocol)(protocol_1.anchorType.APP);
console.log(data);
var anchor_a = "";
(0, decoder_1.linkDecoder)(anchor_a, function (res) {
    console.log(res);
});
// if(window!==undefined){
//     console.log("Browser");
// }else{
//     console.log("NodeJS");
// }
