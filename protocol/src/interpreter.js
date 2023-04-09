"use strict";
//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyRun = void 0;
var decoder_1 = require("./decoder");
var API = null;
var self = {
    check: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data." });
        var anchor = location[0], block = location[1];
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
    var target = (0, decoder_1.linkDecoder)(linker);
    if (target.error)
        return ck && ck(target);
    var cObject = {
        raw: null,
        error: [],
    };
    if (target.param)
        cObject.parameter = target.param;
    self.check(target.location, function (res) {
        if (res.error)
            return ck && ck(res);
        cObject.raw = res.raw;
        try {
            cObject.app = new Function("container", "API", "args", "from", "error", res.raw);
        }
        catch (error) {
            cObject.error.push({ error: "Failed to get function" });
        }
        return ck && ck(cObject);
    });
};
exports.easyRun = run;
