"use strict";
// npm i -D typescript
// npx tsc index.ts
// node index.js
Object.defineProperty(exports, "__esModule", { value: true });
// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { Keyring } from '@polkadot/api';
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
            var res = [];
            console.log(list);
            return ck && ck(res);
        },
        "owner": anchor_1.anchorJS.owner,
        "subcribe": anchor_1.anchorJS.subcribe,
    },
    //"polka":{},
    //"gateway":{}
};
// const self={
//     prepare:(node:string,ck:Function)=>{
//         try {
//             const provider = new WsProvider(node);
//             ApiPromise.create({ provider: provider }).then((api) => {
//                 if(!anchorJS.set(api)){
//                     console.log('Error anchor node.');
//                 }
//                 anchorJS.setKeyring(Keyring);
//                 return ck && ck();
//             });
//           } catch (error) {
//             return ck && ck(error);
//           }
//     },
// }
var server = "ws://localhost:9944";
//self.prepare(server,()=>{
(0, interpreter_1.easyRun)(["hello", 223], API, function () { });
(0, interpreter_1.easyRun)(["你好", 1234], API, function () { });
var data = (0, format_1.easyProtocol)(protocol_1.rawType.APP);
console.log(data);
var anchor_a = "";
(0, decoder_1.linkDecoder)(anchor_a, function (res) {
    console.log(res);
});
//});
