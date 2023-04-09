"use strict";
//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyRun = void 0;
var decoder_1 = require("./decoder");
var API = null;
var self = {
    check: function (linker, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data." });
        var target = (0, decoder_1.linkDecoder)(linker);
        if (target.error)
            return ck && ck(target);
        var _a = target.location, anchor = _a[0], block = _a[1];
        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if (block !== 0) {
            API.common.target(anchor, block, function (data) {
                if (!data)
                    return ck && ck({ error: "No such anchor." });
                if (data.error)
                    return ck && ck({ error: data.error });
                if (data.empty)
                    return ck && ck({ error: "Empty anchor." });
                return ck && ck(data);
            });
        }
        else {
            API.common.latest(anchor, function (data) {
                if (!data)
                    return ck && ck({ error: "No such anchor." });
                if (data.error)
                    return ck && ck({ error: data.error });
                if (data.empty)
                    return ck && ck({ error: "Empty anchor." });
                return ck && ck(data);
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
var run = function (linker, inputAPI, ck) {
    if (API === null && inputAPI !== null)
        API = inputAPI;
    self.check(linker, function (res) {
        if (res.error)
            return ck && ck(res);
        //console.log(res);
        //return ck && ck(res);
    });
};
exports.easyRun = run;
