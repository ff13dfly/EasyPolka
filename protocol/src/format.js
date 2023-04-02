"use strict";
//!important This is the library for Esay Protocol
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyProtocol = void 0;
var protocol_1 = require("./protocol");
var format = function (type, cfg) {
    var protocol;
    switch (type) {
        case protocol_1.rawType.APP:
            protocol = {
                "type": protocol_1.rawType.APP,
                "fmt": protocol_1.formatType.JAVASCRIPT,
                "ver": "1.0.0",
            };
            if (cfg && cfg.auth)
                protocol.auth = cfg.auth;
            if (cfg && cfg.lib)
                protocol.lib = cfg.lib;
            if (cfg && cfg.ver)
                protocol.ver = cfg.ver;
            break;
        case protocol_1.rawType.DATA:
            protocol = {
                "type": protocol_1.rawType.DATA,
                "fmt": protocol_1.formatType.NONE,
            };
            if (cfg && cfg.fmt)
                protocol.fmt = cfg.fmt;
            if (cfg && cfg.code)
                protocol.code = cfg.code;
            if (cfg && cfg.auth)
                protocol.auth = cfg.auth;
            if (cfg && cfg.call)
                protocol.call = cfg.call;
            break;
        case protocol_1.rawType.LIB:
            protocol = {
                "type": protocol_1.rawType.LIB,
                "fmt": protocol_1.formatType.NONE,
                "ver": "1.0.0",
            };
            break;
        default:
            protocol = {
                "type": protocol_1.rawType.DATA,
                "fmt": protocol_1.formatType.NONE,
            };
            break;
    }
    return protocol;
};
exports.easyProtocol = format;
