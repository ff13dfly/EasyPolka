//!important This is the library for Esay Protocol

import { anchorType,formatType}from "./protocol";
import { dataProtocol,appProtocol } from "./protocol";

const format=(type:anchorType,cfg?:any|undefined)=>{
    let protocol:dataProtocol|appProtocol;
    switch (type) {
        case anchorType.APP:
            protocol={
                "type":anchorType.APP,
                "fmt":formatType.JAVASCRIPT,
                "ver":"1.0.0",
            }
            if(cfg && cfg.auth) protocol.auth=cfg.auth;
            if(cfg && cfg.lib) protocol.lib=cfg.lib;
            break;

        case anchorType.DATA:
            protocol={
                "type":anchorType.DATA,
                "fmt":formatType.NONE,
            }
            if(cfg && cfg.fmt) protocol.fmt=cfg.fmt;
            if(cfg && cfg.code) protocol.code=cfg.code;
            if(cfg && cfg.auth) protocol.auth=cfg.auth;
            if(cfg && cfg.call) protocol.call=cfg.call;
            break;

        default:
            protocol={
                "type":anchorType.DATA,
                "fmt":formatType.NONE,
            } 
            break;
    }
    return protocol;
};

export {format as easyProtocol};