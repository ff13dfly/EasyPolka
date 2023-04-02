"use strict";
//!important This is the library for decoding anchor link
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkDecoder = void 0;
var setting = {
    "check": false,
    "utf8": true, //auto decode parameter to UTF8
};
var decoder = function (link, cfg) {
    var res = {
        location: ["hello", 223],
        param: { "from": "cApp" },
    };
    return res;
};
exports.linkDecoder = decoder;
