"use strict";
//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyRun = void 0;
var protocol_1 = require("./protocol");
var decoder_1 = require("./decoder");
var auth_1 = require("./auth");
var hide_1 = require("./hide");
var _a = require("../lib/loader"), Loader = _a.Loader, Libs = _a.Libs;
var API = null;
var self = {
    getAnchor: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var anchor = location[0], block = location[1];
        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if (block !== 0) {
            API.common.target(anchor, block, function (data) {
                self.filterAnchor(data, ck);
            });
        }
        else {
            API.common.latest(anchor, function (data) {
                self.filterAnchor(data, ck);
            });
        }
    },
    filterAnchor: function (data, ck) {
        if (!data)
            return ck && ck({ error: "No such anchor.", level: protocol_1.errorLevel.ERROR });
        var err = data;
        if (err.error)
            return ck && ck({ error: err.error, level: protocol_1.errorLevel.ERROR });
        var anchor = data;
        if (anchor.empty)
            return ck && ck({ error: "Empty anchor.", level: protocol_1.errorLevel.ERROR });
        if (!anchor.protocol)
            return ck && ck({ error: "No-protocol anchor." });
        var protocol = anchor.protocol;
        if (!protocol.type)
            return ck && ck({ error: "Not EasyProtocol anchor." });
        return ck && ck(anchor);
    },
    decodeData: function (cObject, ck) {
        console.log("Decode data anchor");
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        if (protocol !== null && protocol.call) {
            var app_answer_1 = [
                Array.isArray(protocol.call) ? protocol.call[0] : protocol.call,
                Array.isArray(protocol.call) ? protocol.call[1] : 0
            ];
            self.getAnchor(app_answer_1, function (answer) {
                if (answer.error) {
                    cObject.error.push({ error: "Failed to load answer anchor" });
                    return ck && ck(cObject);
                }
                cObject.from = cObject.location;
                cObject.location = [app_answer_1[0], answer.block];
                if (protocol.args) {
                }
            });
        }
        else {
            return ck && ck(cObject);
        }
    },
    decodeApp: function (cObject, ck) {
        console.log("Decode app anchor");
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        //1.try to decode and get application
        try {
            cObject.app = new Function("container", "API", "args", "from", "error", data.raw === null ? "" : data.raw);
        }
        catch (error) {
            cObject.error.push({ error: "Failed to get function" });
        }
        //2.check and get libs
        if (protocol !== null && protocol.lib) {
        }
        return ck && ck(cObject);
    },
    decodeLib: function (cObject, ck) {
        console.log("Decode lib anchor");
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        //1.check and get libs
        if (protocol !== null && protocol.lib) {
        }
    },
    getLibs: function (list, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        console.log("Ready to get libs: ".concat(JSON.stringify(list)));
        var RPC = {
            search: API.common.latest,
            target: API.common.target,
        };
        Libs(list, API, ck);
    },
    getHistory: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var anchor = location[0], block = location[1];
        API.common.history(anchor, function (list) {
            console.log(list);
            //self.filterAnchor(data,ck); 
        });
    },
    //combine the hide and auth list to result
    merge: function (anchor, protocol, cfg, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var result = {
            "hide": [],
            "auth": null,
            "error": [],
            "index": [null, null],
            "map": {}, //map anchor data here
        };
        var mlist = [];
        (0, auth_1.checkAuth)(anchor, protocol, function (authObject) {
            (0, hide_1.checkHide)(anchor, protocol, function (hideObject) {
                console.log(hideObject);
                if (authObject.anchor === null && hideObject.anchor === null) {
                    if (authObject.list)
                        result.auth = authObject.list;
                    if (hideObject.list)
                        result.hide = hideObject.list;
                    return ck && ck(result);
                }
                else if (authObject.anchor === null && hideObject.anchor !== null) {
                    var hide_anchor_1 = typeof hideObject.anchor === "string" ? [hideObject.anchor, 0] : [hideObject.anchor[0], hideObject.anchor[1]];
                    self.getAnchor(hide_anchor_1, function (hdata) {
                        var err = hdata;
                        if (err.error) {
                            result.error.push({ error: err.error });
                        }
                        //if(hdata.error) return ck && ck(hdata);
                        var data = hdata;
                        result.map["".concat(hide_anchor_1[protocol_1.relatedIndex.NAME], "_").concat(data.block)] = hdata;
                        result.index[protocol_1.relatedIndex.HIDE] = [hide_anchor_1[protocol_1.relatedIndex.NAME], data.block];
                        var dhide = self.decodeHideAnchor(hdata);
                        if (!Array.isArray(dhide)) {
                            result.error.push(dhide);
                        }
                        else {
                            result.hide = dhide;
                        }
                        return ck && ck(result);
                    });
                }
                else if (authObject.anchor !== null && hideObject.anchor === null) {
                    var auth_anchor = typeof authObject.anchor === "string" ? [authObject.anchor, 0] : [authObject.anchor[0], authObject.anchor[1]];
                    self.getHistory(auth_anchor, function (alist) {
                        //result.auth=self.decodeAuthAnchor(<anchorObject[]>adata);
                        // if(<errorObject>alist.error){
                        //     result.error.push({error:alist.error});
                        // }
                        self.decodeAuthAnchor(alist, function () {
                        });
                        return ck && ck(result);
                    });
                }
                else if (authObject.anchor !== null && hideObject.anchor !== null) {
                    var hide_anchor = typeof hideObject.anchor === "string" ? [hideObject.anchor, 0] : [hideObject.anchor[0], hideObject.anchor[1]];
                    var auth_anchor_1 = typeof authObject.anchor === "string" ? [authObject.anchor, 0] : [authObject.anchor[0], authObject.anchor[1]];
                    self.getAnchor(hide_anchor, function (hdata) {
                        self.getHistory(auth_anchor_1, function (adata) {
                            //result.hide=self.decodeHideAnchor(<anchorObject>hdata);
                            //result.auth=self.decodeAuthAnchor(<anchorObject[]>adata);
                            return ck && ck(result);
                        });
                    });
                }
            });
        });
    },
    decodeHideAnchor: function (obj) {
        var list = [];
        var protocol = obj.protocol;
        if ((protocol === null || protocol === void 0 ? void 0 : protocol.fmt) === 'json') {
            try {
                var raw = JSON.parse(obj.raw);
                if (Array.isArray(raw)) {
                    for (var i = 0; i < raw.length; i++) {
                        var n = parseInt(raw[i]);
                        if (!isNaN(n))
                            list.push(n);
                    }
                }
            }
            catch (error) {
                return { error: 'failed to parse JSON' };
            }
        }
        return list;
    },
    //!important, by using the history of anchor, `hide` keyword is still support
    //!important, checking the latest anchor data, using the `hide` feild to get data.
    decodeAuthAnchor: function (list, ck) {
        var map = {};
        return map;
    },
    //get params from string such as `key_a=val&key_b=val&key_c=val`
    getParams: function (args) {
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
};
var decoder = {};
decoder[protocol_1.rawType.APP] = self.decodeApp;
decoder[protocol_1.rawType.DATA] = self.decodeData;
decoder[protocol_1.rawType.LIB] = self.decodeLib;
// type dataMap={
//     [index: string]: anchorObject;
// }
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
        index: [null, null],
    };
    if (target.param)
        cObject.parameter = target.param;
    self.getAnchor(target.location, function (data) {
        //1.return error if anchor is not support Easy Protocol
        if (data.error)
            return ck && ck(data);
        if (cObject.location[1] === 0)
            cObject.location[1] = data.block;
        cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])] = data;
        var type = data.protocol.type;
        if (!decoder[type])
            return ck && ck(data);
        self.merge(data.name, data.protocol, {}, function (mergeResult) {
            console.log(mergeResult);
            if (mergeResult.auth !== null)
                cObject.auth = mergeResult.auth;
            if (mergeResult.hide.length !== 0)
                cObject.hide = mergeResult.hide;
            if (mergeResult.error.length !== 0) {
            }
            for (var k in mergeResult.map) {
                cObject.data[k] = mergeResult.map[k];
            }
            if (mergeResult.index[protocol_1.relatedIndex.AUTH] !== null && cObject.index) {
                cObject.index[protocol_1.relatedIndex.AUTH] = mergeResult.index[protocol_1.relatedIndex.AUTH];
            }
            if (mergeResult.index[protocol_1.relatedIndex.HIDE] !== null && cObject.index) {
                cObject.index[protocol_1.relatedIndex.HIDE] = mergeResult.index[protocol_1.relatedIndex.HIDE];
            }
            return decoder[type](cObject, ck);
        });
    });
};
exports.easyRun = run;
