"use strict";
// npm i -D typescript
// npx tsc index.ts
// node index.js
Object.defineProperty(exports, "__esModule", { value: true });
var interpreter_1 = require("../src/interpreter");
interpreter_1.easyProtocol.check(["hello", 223]);
interpreter_1.easyProtocol.check(["你好", 1234]);
