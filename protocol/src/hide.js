"use strict";
//!important This is the library for creating auth data
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHide = exports.easyHide = void 0;
var md5 = require("md5");
var creator = function (anchor) {
};
exports.easyHide = creator;
// check anchor to get hide list
var check = function (anchor, salt, cfg, ck, hide) {
    var dkey = !hide ? (anchor + salt) : hide;
    var hash = md5(dkey);
    console.log("Check hide anchor:".concat(anchor, ", hash : ").concat(hash));
};
exports.checkHide = check;
