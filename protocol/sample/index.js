"use strict";
// npm i -D typescript
// npx tsc index.ts
// node index.js
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var define_1 = require("./define");
var self = {
    check: function (name, obj) {
        console.log("".concat(name, ":").concat(JSON.stringify(obj)));
        var cc = __assign(__assign({}, define_1.defaultValue.marketObject), { price: 100, owner: "5Ga3bDD7U33...AbcT" });
        console.log("".concat(JSON.stringify(cc)));
        obj === null || obj === void 0 ? void 0 : obj.check(cc.price);
    },
};
var obj = __assign(__assign({}, define_1.defaultValue.anchorObject), { age: null, intro: "good to join" });
self.check(123, obj);
