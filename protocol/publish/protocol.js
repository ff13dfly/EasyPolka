"use strict";
//!important This is the library for Esay Protocol
Object.defineProperty(exports, "__esModule", { value: true });
// npx tsc protocol.ts
var proto = {
    "data": {
        "fmt": "string",
        "code": "string",
    },
    "app": {
        "lib": "localtion",
        "ver": "version",
    }
};
var check = {
    string: function (str) {
    },
    version: function (str) {
    },
};
var funs = {
    init: function (protocol, raw, name, ck) {
    },
    isEasy: function (protocol) {
    },
};

exports.default = {
    init: funs.init,
};
