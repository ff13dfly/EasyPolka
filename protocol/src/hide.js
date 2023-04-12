"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHide = exports.easyHide = void 0;
var md5 = require("md5");
var creator = function (anchor) {
};
exports.easyHide = creator;
// check anchor to get hide list
var check = function (anchor, protocol, cfg, ck) {
    // const dkey=!hide?(anchor+salt):hide;
    // const hash=md5(dkey);
    // console.log(`Check hide anchor:${anchor}, hash : ${hash}`);
    console.log(anchor);
    console.log(protocol);
    var data = {
        "list": null,
        "anchor": null,
    };
    return ck && ck(data);
};
exports.checkHide = check;
