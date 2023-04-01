//!important This is the library for Esay Protocol

import { rawType,formatType}from "./protocol";
import { dataProtocol,appProtocol,libProtocol } from "./protocol";

const format=(type:rawType,cfg?:any|undefined)=>{
    let protocol:dataProtocol|appProtocol|libProtocol;
    switch (type) {
        case rawType.APP:
            protocol={
                "type":rawType.APP,
                "fmt":formatType.JAVASCRIPT,
                "ver":"1.0.0",
            }
            if(cfg && cfg.auth) protocol.auth=cfg.auth;
            if(cfg && cfg.lib) protocol.lib=cfg.lib;
            if(cfg && cfg.ver) protocol.ver=cfg.ver;
            break;

        case rawType.DATA:
            protocol={
                "type":rawType.DATA,
                "fmt":formatType.NONE,
            }
            if(cfg && cfg.fmt) protocol.fmt=cfg.fmt;
            if(cfg && cfg.code) protocol.code=cfg.code;
            if(cfg && cfg.auth) protocol.auth=cfg.auth;
            if(cfg && cfg.call) protocol.call=cfg.call;
            break;

        case rawType.LIB:
            protocol={
                "type":rawType.LIB,
                "fmt":formatType.NONE,
                "ver":"1.0.0",
            }
            break;    

        default:
            protocol={
                "type":rawType.DATA,
                "fmt":formatType.NONE,
            } 
            break;
    }
    return protocol;
};

export {format as easyProtocol};