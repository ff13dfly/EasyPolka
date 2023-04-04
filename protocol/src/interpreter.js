"use strict";
//!important This is the library for Esay Protocol
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyRun = void 0;
var API = null;
var self = {
    check: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data." });
        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if (Array.isArray(location)) {
            var anchor = location[0], block = location[1];
            API.common.target(anchor, block, function (data) {
                console.log(data);
            });
        }
        else {
            API.common.latest(location, function (data) {
                console.log(data);
            });
        }
    },
    // check the authority of anchor if launch from data
    authorize: function () {
    },
    // check running enviment (window or node.js)
    env: function () {
    },
};
var run = function (location, inputAPI, ck) {
    if (API === null && inputAPI !== null)
        API = inputAPI;
    self.check(location, function (res) {
        return ck && ck(res);
    });
};
exports.easyRun = run;
