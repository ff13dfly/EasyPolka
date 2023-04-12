"use strict";
//!important This is the library for creating auth data
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = exports.easyAuth = void 0;
var md5 = require("md5");
// create the anchor hiddeing default data
var creator = function (anchor, ck, isNew) {
};
exports.easyAuth = creator;
var check = function (anchor, protocol, funs, cfg, ck) {
    console.log(anchor);
    console.log(protocol);
    console.log(funs);
    //const dkey=!protocol.auth?(anchor+salt):auth;
    var data = {
        "list": null,
        "anchor": null,
    };
    console.log(md5("hello"));
    // const dkey=!auth?(anchor+salt):auth;
    // console.log(dkey);
    // const hash=md5(dkey);
    // console.log(`Check hide anchor:${anchor}, hash : ${hash}`);
    return ck && ck(data);
};
exports.checkAuth = check;
