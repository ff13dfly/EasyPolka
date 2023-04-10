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
    decoder: function (args) {
        var map = {};
        var arr = args.split("&");
        for (var i = 0; i < arr.length; i++) {
            var row = arr[i];
            var kv = row.split("=");
            if (kv.length !== 2)
                return { error: "error parameter" };
            map[kv[0]] = kv[1];
        }
        return map;
    },
    getApp: function () {
    },
    getData: function () {
    },
    getLibs: function () {
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
        location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
        error: [],
        data: {},
    };
    if (target.param)
        cObject.parameter = target.param;
    self.check(target.location, function (res) {
        if (res.error || res.empty)
            return ck && ck(res);
        if (!res.protocol || !res.protocol.type)
            return ck && ck({ error: "Not EasyProtocol anchor." });
        if (cObject.location[1] === 0)
            cObject.location[1] = res.block;
        cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])] = res;
        // 1.check anchor data
        switch (res.protocol.type) {
            case "app":
                console.log("App type anchor");
                try {
                    cObject.app = new Function("container", "API", "args", "from", "error", res.raw);
                }
                catch (error) {
                    cObject.error.push({ error: "Failed to get function" });
                }
                ck && ck(cObject);
                break;
            case "data":
                console.log("Data type anchor");
                //console.log(res);
                if (res.protocol && res.protocol.call) {
                    var app_answer_1 = Array.isArray(res.protocol.call) ? res.protocol.call : [res.protocol.call, 0];
                    return self.check(app_answer_1, function (answer) {
                        if (res.error || res.empty)
                            return ck && ck(res);
                        if (!res.protocol || !res.protocol.type)
                            return ck && ck({ error: "Called Not-EasyProtocol anchor." });
                        cObject.from = cObject.location;
                        cObject.location = [app_answer_1[0], answer.block];
                        cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])] = answer;
                        try {
                            cObject.app = new Function("container", "API", "args", "from", "error", answer.raw);
                        }
                        catch (error) {
                            cObject.error.push({ error: "Failed to get function" });
                        }
                        if (res.protocol && res.protocol.args) {
                            var args = self.decoder(res.protocol.args);
                            if (!args.error)
                                cObject.parameter = args;
                            else
                                cObject.error.push(args);
                        }
                        ck && ck(cObject);
                    });
                }
                ck && ck(cObject);
                break;
            case "lib":
                console.log("Lib type anchor");
                break;
            default:
                console.log("Unexcept type anchor");
                ck && ck(cObject);
                break;
        }
    });
};
exports.easyRun = run;
