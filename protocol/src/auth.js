"use strict";
//!important This is the library for creating auth data
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = exports.easyAuth = void 0;
var md5 = require("md5");
var creator = function (anchor) {
};
exports.easyAuth = creator;
// check anchor to get auth list. 
// if the anchor exsist, as white list
var check = function (anchor, salt, ck, auth) {
    var dkey = !auth ? (anchor + salt) : auth;
    console.log(dkey);
    var hash = md5(dkey);
    console.log("Check hide anchor:".concat(anchor, ", hash : ").concat(hash));
};
exports.checkAuth = check;
