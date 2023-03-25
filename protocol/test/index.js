"use strict";
// npm i -D typescript
// npx tsc index.ts
// node index.js
Object.defineProperty(exports, "__esModule", { value: true });
var interpreter_1 = require("../src/interpreter");
var anchor_1 = require("../lib/anchor");
var API = {
    "common": {
        "latest": anchor_1.anchorJS.latest,
        "target": anchor_1.anchorJS.target,
        "history": anchor_1.anchorJS.history,
    },
};
(0, interpreter_1.easyProtocol)(["hello", 223], API);
(0, interpreter_1.easyProtocol)(["你好", 1234], API);
var aaa = function (a) {
    return [a, a, a];
};
var res = aaa("hello");
console.log(res);
