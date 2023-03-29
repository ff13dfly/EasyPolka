"use strict";
//!important This is the library for decoding anchor link
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkDecoder = void 0;
var decoder = function (link, ck) {
    var res = {};
    return ck && ck(res);
};
exports.linkDecoder = decoder;
