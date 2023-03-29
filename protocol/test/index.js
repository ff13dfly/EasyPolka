"use strict";
// npm i -D typescript
// npx tsc index.ts
// node index.js
Object.defineProperty(exports, "__esModule", { value: true });
var anchor_1 = require("../lib/anchor");
var format_1 = require("../src/format");
var interpreter_1 = require("../src/interpreter");
var protocol_1 = require("../src/protocol");
var API = {
    "common": {
        "latest": anchor_1.anchorJS.latest,
        "target": anchor_1.anchorJS.target,
        "history": anchor_1.anchorJS.history,
    },
};
(0, interpreter_1.easyRun)(["hello", 223], API, function () { });
(0, interpreter_1.easyRun)(["你好", 1234], API, function () { });
var data = (0, format_1.easyProtocol)(protocol_1.anchorType.APP);
console.log(data);
