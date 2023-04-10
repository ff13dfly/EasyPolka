"use strict";
//!important This is the library for creating auth data
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = exports.easyAuth = void 0;
var md5 = require("md5");
// create the anchor hiddeing default data
var creator = function (anchor, ck, isNew) {
};
exports.easyAuth = creator;
var check = function (anchor, salt, cfg, ck, auth) {
    var dkey = !auth ? (anchor + salt) : auth;
    console.log(dkey);
    var hash = md5(dkey);
    console.log("Check hide anchor:".concat(anchor, ", hash : ").concat(hash));
};
exports.checkAuth = check;
