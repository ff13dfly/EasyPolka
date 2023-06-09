"use strict";
//!important This is the library for creating auth data
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTrust = exports.checkAuth = exports.easyAuth = void 0;
var md5 = require("md5");
// create the anchor hiddeing default data
var creator = function (anchor, ck, isNew) {
};
exports.easyAuth = creator;
// check anchor to get auth list. 
var check = function (anchor, protocol, ck) {
    var data = {
        "list": null,
        "anchor": null, //target anchor to get result
    };
    //TODO, auto MD5 anchor function is not tested yet.
    if (protocol.auth) {
        //1.check wether target anchor 
        if (typeof protocol.auth === "string" || Array.isArray(protocol.auth)) {
            data.anchor = protocol.auth;
        }
        else {
            data.list = protocol.auth;
        }
    }
    else {
        //2.check default anchor
        if (protocol.salt) {
            data.anchor = md5(anchor + protocol.salt[0]);
        }
    }
    return ck && ck(data);
};
exports.checkAuth = check;
var trust_check = function (anchor, protocol, ck) {
    var data = {
        "list": null,
        "anchor": null, //target anchor to get result
    };
    //TODO, auto MD5 anchor function is not tested yet.
    if (protocol.trust) {
        //1.check wether target anchor 
        if (typeof protocol.trust === "string" || Array.isArray(protocol.trust)) {
            data.anchor = protocol.trust;
        }
        else {
            data.list = protocol.trust;
        }
    }
    else {
        //2.check default anchor
        if (protocol.salt) {
            data.anchor = md5(anchor + protocol.salt[0]);
        }
    }
    return ck && ck(data);
};
exports.checkTrust = trust_check;
