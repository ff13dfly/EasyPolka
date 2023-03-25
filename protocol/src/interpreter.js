"use strict";
//!important This is the library for Esay Protocol
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyProtocol = void 0;
var API = null;
var self = {
    run: function (location, inputAPI, ck) {
        if (API === null && inputAPI !== null)
            API = inputAPI;
        self.check(location, function (res) {
        });
    },
    check: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data." });
        console.log("Checking : ".concat(JSON.stringify(location)));
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
};
var run = self.run;
exports.easyProtocol = run;
