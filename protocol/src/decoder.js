"use strict";
//!important This is the library for decoding anchor link
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkDecoder = exports.linkCreator = void 0;
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
    combineParams: function (obj) {
        if (!obj)
            return "";
        var list = [];
        for (var k in obj) {
            list.push("".concat(k, "=").concat(obj[k]));
        }
        if (list.length === 0)
            return '';
        return list.join("&");
    },
};
var creator = function (local, params) {
    var str = self.combineParams(params);
    if (Array.isArray(local)) {
        if (local[1] !== 0) {
            return "".concat(setting.pre).concat(local[0], "/").concat(local[1]).concat(!str ? str : "?" + str);
        }
        else {
            return "".concat(setting.pre).concat(local[0]).concat(!str ? str : "?" + str);
        }
    }
    else {
        return "".concat(setting.pre).concat(local).concat(!str ? str : "?" + str);
    }
};
exports.linkCreator = creator;
var decoder = function (link, cfg) {
    var res = {
        location: ["", 0],
    };
    var str = link.toLocaleLowerCase();
    var pre = setting.pre;
    //0. format check
    if (str.length <= pre.length + 1)
        return { error: "invalid string" };
    var head = str.substring(0, pre.length);
    if (head !== pre)
        return { error: "invalid protocol" };
    //1. remove prefix `anchor://`
    var body = str.substring(pre.length, str.length);
    //2. check parameter
    var arr = body.split("?");
    if (arr.length > 2)
        return { error: "error request, please check anchor name" };
    var isParam = arr.length === 1 ? false : true;
    if (isParam) {
        var ps = self.getParams(arr[1]);
        if (ps.error) {
            return ps;
        }
        res.param = self.getParams(arr[1]);
    }
    body = arr[0];
    //3. decode anchor location
    var ls = body.split("/");
    var last = [];
    for (var i = 0; i < ls.length; i++) {
        if (ls[i] !== '')
            last.push(ls[i]);
    }
    //4. export result
    if (last.length === 1) {
        res.location[0] = last[0];
        res.location[1] = 0;
    }
    else {
        var ele = last.pop();
        var block = parseInt(ele);
        if (isNaN(block))
            return { error: "block number error" };
        res.location[1] = block;
        res.location[0] = last.join('/');
    }
    return res;
};
exports.linkDecoder = decoder;
