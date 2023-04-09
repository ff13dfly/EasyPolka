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
        var location = target.location;
        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if (Array.isArray(location)) {
            var anchor = location[0], block = location[1];
            API.common.target(anchor, block, function (data) {
                //if(data.error) return ck && ck({error:data.error});
                //if(data.empty) return ck && ck({error:"Empty anchor."});
                //console.log(data);
            });
        }
        else {
            API.common.latest(location, function (data) {
                //console.log(data);
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
        return ck && ck(res);
    });
};
exports.easyRun = run;
