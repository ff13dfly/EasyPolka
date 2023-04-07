"use strict";
//!important This is the library for decoding anchor link
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkDecoder = void 0;
var setting = {
    "check": false,
    "utf8": true,
    "pre": "anchor://", //protocol prefix
};
var self = {
    getParams: function (str) {
        var map = {};
        var arr = str.split("&");
        for (var i = 0; i < arr.length; i++) {
            var row = arr[i];
            var kv = row.split("=");
            if (kv.length !== 2)
                return { error: "error parameter" };
            map[kv[0]] = kv[1];
        }
        return map;
    },
};
var decoder = function (link, cfg) {
    var res = {
        location: ["", 0],
    };
    //1. remove prefix `anchor://`
    var str = link.toLocaleLowerCase();
    var body = str.substring(setting.pre.length, str.length);
    console.log("Need decode link:".concat(str, ",body:").concat(body));
    //2. check parameter
    var arr = body.split("?");
    var isParam = arr.length === 1 ? false : true;
    if (isParam) {
        var ps = self.getParams(arr[1]);
        if (ps.error) {
        }
        res.param = self.getParams(arr[1]);
    }
    //3. decode anchor location
    return res;
};
exports.linkDecoder = decoder;
