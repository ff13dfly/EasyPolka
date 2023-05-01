"use strict";
//!important This is the library for Esay Protocol v1.0
//!important All data come from `Anchor Link`
//!important This implement extend `auth` and `hide` by salt way to load data
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyRun = void 0;
var protocol_1 = require("./protocol");
var protocol_2 = require("./protocol");
var decoder_1 = require("./decoder");
var auth_1 = require("./auth");
var hide_1 = require("./hide");
var _a = require("../lib/loader"), Loader = _a.Loader, Libs = _a.Libs;
//const {anchorJS} =require("../lib/anchor");
var API = null;
/*************************debug part****************************/
//debug data to improve the development
var debug = {
    disable: false,
    cache: true,
    search: [],
    start: 0,
    end: 0,
    stamp: function () {
        return new Date().getTime();
    },
};
//anchor cache to avoid duplicate request.
var cache = {
    data: {},
    set: function (k, b, v) {
        cache.data["".concat(k, "_").concat(b)] = v;
        return true;
    },
    get: function (k, b) {
        return cache.data["".concat(k, "_").concat(b)];
    },
    clear: function () {
        cache.data = {};
    },
};
//before: 500~700ms
/*************************debug part****************************/
var self = {
    /**************************************************************************/
    /*************************Anchor data functions****************************/
    /**************************************************************************/
    getAnchor: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var anchor = location[0], block = location[1];
        //debug hook
        if (!debug.cache) {
            var cData = cache.get(anchor, block);
            if (cData !== undefined)
                return ck && ck(cData);
        }
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
        if (!debug.disable)
            debug.search.push([anchor.name, anchor.block]); //debug hook 
        if (!debug.cache)
            cache.set(anchor.name, anchor.block, anchor); //debug hook
        if (anchor.empty)
            return ck && ck({ error: "Empty anchor.", level: protocol_1.errorLevel.ERROR });
        if (!anchor.protocol)
            return ck && ck({ error: "No-protocol anchor." });
        var protocol = anchor.protocol;
        if (!protocol.type)
            return ck && ck({ error: "Not EasyProtocol anchor." });
        return ck && ck(anchor);
    },
    /**************************************************************************/
    /************************Decode Result functions***************************/
    /**************************************************************************/
    decodeData: function (cObject, ck) {
        //console.log(`Decode data anchor`);
        //console.log(cObject);
        cObject.type = protocol_1.rawType.DATA;
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        if (protocol !== null && protocol.call) {
            cObject.call = protocol.call;
        }
        return ck && ck(cObject);
    },
    decodeApp: function (cObject, ck) {
        //console.log(`Decode app anchor`);
        cObject.type = protocol_1.rawType.APP;
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        cObject.code = data.raw;
        if (protocol !== null && protocol.lib) {
            //FIXME code should be defined clearly
            self.getLibs(protocol.lib, function (code) {
                //console.log(code);
                cObject.libs = code;
                return ck && ck(cObject);
            });
        }
        else {
            return ck && ck(cObject);
        }
    },
    decodeLib: function (cObject, ck) {
        //console.log(`Decode lib anchor`);
        cObject.type = protocol_1.rawType.LIB;
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        //1.check and get libs
        if (protocol !== null && protocol.lib) {
            self.getLibs(protocol.lib, function (code) {
                //console.log(code);
                cObject.libs = code;
                return ck && ck(cObject);
            });
        }
        else {
            return ck && ck(cObject);
        }
    },
    getLibs: function (list, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        //console.log(`Ready to get libs: ${JSON.stringify(list)}`);
        var RPC = {
            search: API.common.latest,
            target: API.common.target,
        };
        Libs(list, RPC, ck);
    },
    getHistory: function (location, ck) {
        var list = [];
        var errs = [];
        if (API === null) {
            errs.push({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
            return ck && ck(list, errs);
        }
        //if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        var anchor = location[0], block = location[1];
        API.common.history(anchor, function (res) {
            var err = res;
            if (err.error) {
                errs.push(err);
                return ck && ck(list, errs);
            }
            var alist = res;
            if (alist.length === 0) {
                errs.push({ error: "Empty history" });
                return ck && ck(list, errs);
            }
            return ck && ck(alist, errs);
        });
    },
    /**************************************************************************/
    /*************************Merge related anchors****************************/
    /**************************************************************************/
    /**
     * combine the hide and auth list to result
     * @param {string}      anchor	    //`Anchor` name
     * @param {object}      protocol    //Easy Protocol
     * @param {object}      cfg         //reversed config parameter
     * @param {function}    ck          //callback, will return the merge result, including the related `anchor`
     * */
    merge: function (anchor, protocol, cfg, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var result = {
            "hide": [],
            "auth": null,
            "trust": null,
            "error": [],
            "index": [null, null, null],
            "map": {},
        };
        //1.get hide related data and merge to result
        self.singleRule(anchor, protocol, protocol_2.relatedIndex.HIDE, function (res, map, local, errs) {
            var _a;
            if (local !== null)
                result.index[protocol_2.relatedIndex.HIDE] = local;
            for (var k in map)
                result.map[k] = map[k];
            if (errs.length !== 0)
                (_a = result.error).push.apply(_a, errs);
            result.hide = res;
            //2.get auth related data and merge to result
            self.singleRule(anchor, protocol, protocol_2.relatedIndex.AUTH, function (res, map, local, errs) {
                var _a;
                if (local !== null)
                    result.index[protocol_2.relatedIndex.AUTH] = local;
                for (var k in map)
                    result.map[k] = map[k];
                if (errs.length !== 0)
                    (_a = result.error).push.apply(_a, errs);
                result.auth = res;
                //3.get trust related data and merge to result
                self.singleRule(anchor, protocol, protocol_2.relatedIndex.TRUST, function (res, map, local, errs) {
                    var _a;
                    if (local !== null)
                        result.index[protocol_2.relatedIndex.TRUST] = local;
                    for (var k in map)
                        result.map[k] = map[k];
                    if (errs.length !== 0)
                        (_a = result.error).push.apply(_a, errs);
                    result.trust = res;
                    return ck && ck(result);
                });
            });
        });
        //const mlist:anchorLocation[]=[];
        //1. check `declared hidden` and `authority` just by protocol data.
        // checkAuth(anchor,protocol,(resAuth:authResult)=>{
        //     checkHide(anchor,protocol,(resHide:hideResult)=>{
        //         if(resAuth.anchor===null && resHide.anchor===null){
        //             if(resAuth.list) result.auth=resAuth.list;
        //             if(resHide.list) result.hide=resHide.list;
        //             return ck && ck(result);
        //         }else if(resAuth.anchor===null && resHide.anchor!==null){
        //             const hide_anchor:[string,number]=typeof resHide.anchor==="string"?[resHide.anchor,0]:[resHide.anchor[0],resHide.anchor[1]];
        //             self.getAnchor(hide_anchor,(res:anchorObject|errorObject)=>{
        //                 const errs:errorObject[]=[];
        //                 const err=<errorObject>res;
        //                 if(err.error) errs.push({error:err.error});
        //                 const data:anchorObject=<anchorObject>res;
        //                 return self.combineHide(result,data,errs,ck);
        //             });
        //         }else if(resAuth.anchor!==null && resHide.anchor===null){
        //             const auth_anchor:[string,number]=typeof resAuth.anchor==="string"?[resAuth.anchor,0]:[resAuth.anchor[0],resAuth.anchor[1]];
        //             self.getHistory(auth_anchor,(alist:anchorObject[],errsA:errorObject[])=>{
        //                 return self.combineAuth(result,alist,errsA,ck);
        //             });
        //         }else if(resAuth.anchor!==null && resHide.anchor!==null){
        //             const hide_anchor:[string,number]=typeof resHide.anchor==="string"?[resHide.anchor,0]:[resHide.anchor[0],resHide.anchor[1]];
        //             const auth_anchor:[string,number]=typeof resAuth.anchor==="string"?[resAuth.anchor,0]:[resAuth.anchor[0],resAuth.anchor[1]];    
        //             self.getAnchor(hide_anchor,(res:anchorObject|errorObject)=>{
        //                 const errs:errorObject[]=[];
        //                 const err=<errorObject>res;
        //                 if(err.error) errs.push({error:err.error});
        //                 const data:anchorObject=<anchorObject>res;
        //                 return self.combineHide(result,data,errs,(chResult:mergeResult)=>{
        //                     self.getHistory(auth_anchor,(alist:anchorObject[],errsA:errorObject[])=>{
        //                         self.combineAuth(chResult,alist,errsA,ck);
        //                     });
        //                 });
        //             });
        //         }
        //     });
        // });
    },
    //get whole related data by protocol
    singleRule: function (anchor, protocol, tag, ck) {
        var result = null;
        var map = {};
        var location = null;
        var errs = [];
        //1.decode protocol to check wether get more data
        switch (tag) {
            case protocol_2.relatedIndex.HIDE:
                (0, hide_1.checkHide)(anchor, protocol, function (resHide) {
                    if (resHide.anchor === null && resHide.list !== null) {
                        result = resHide.list;
                        return ck && ck(result, map, location, errs);
                    }
                    else if (resHide.anchor !== null && resHide.list === null) {
                        self.singleExtend(resHide.anchor, false, function () {
                            return ck && ck(result, map, location, errs);
                        });
                    }
                    else if (resHide.anchor !== null && resHide.list !== null) {
                        errs.push({ error: "Format error." });
                        return ck && ck(result, map, location, errs);
                    }
                    else {
                        return ck && ck(result, map, location, errs);
                    }
                });
                break;
            case protocol_2.relatedIndex.AUTH:
                (0, auth_1.checkAuth)(anchor, protocol, function (resAuth) {
                    if (resAuth.anchor === null && resAuth.list !== null) {
                        result = resAuth.list;
                        return ck && ck(result, map, location, errs);
                    }
                    else if (resAuth.anchor !== null && resAuth.list === null) {
                        self.singleExtend(resAuth.anchor, true, function () {
                            return ck && ck(result, map, location, errs);
                        });
                    }
                    else if (resAuth.anchor !== null && resAuth.list !== null) {
                        errs.push({ error: "Format error." });
                        return ck && ck(result, map, location, errs);
                    }
                    else {
                        return ck && ck(result, map, location, errs);
                    }
                });
                break;
            case protocol_2.relatedIndex.TRUST:
                (0, auth_1.checkTrust)(anchor, protocol, function (resTrust) {
                    if (resTrust.anchor === null && resTrust.list !== null) {
                        result = resTrust.list;
                        return ck && ck(result, map, location, errs);
                    }
                    else if (resTrust.anchor !== null && resTrust.list === null) {
                        self.singleExtend(resTrust.anchor, true, function () {
                            return ck && ck(result, map, location, errs);
                        });
                    }
                    else if (resTrust.anchor !== null && resTrust.list !== null) {
                        errs.push({ error: "Format error." });
                        return ck && ck(result, map, location, errs);
                    }
                    else {
                        return ck && ck(result, map, location, errs);
                    }
                });
                break;
            default:
                errs.push({ error: "unknow related index." });
                ck && ck(result, map, location, errs);
                break;
        }
    },
    //get anchor extend data, two parts: 1.extend anchor itself; 2.declared hidden anchor
    singleExtend: function (name, history, ck, hlist) {
        console.log("".concat(name, ":").concat(history));
        //1.get the latest extend anchor;
        if (hlist === undefined) {
        }
        //2.get the hidden list if there is. then recall function itself
        //3.combine different way data
    },
    // combineHide:(result:mergeResult,anchor:anchorObject,errs:errorObject[],ck:Function)=>{
    //     if(errs.length!==0){
    //         //FIXME change to simple way to combine the errors.
    //         for(let i=0;i<errs.length;i++) result.error.push(errs[i]);
    //     }
    //     result.map[`${anchor.name}_${anchor.block}`]=anchor;
    //     result.index[relatedIndex.HIDE]=[anchor.name,anchor.block];
    //     const dhide=self.decodeHideAnchor(anchor);
    //     if(!Array.isArray(dhide)){
    //         result.error.push(dhide);
    //     }else{
    //         result.hide=dhide;
    //     }
    //     return ck && ck(result);
    // },
    // combineAuth:(result:mergeResult,list:anchorObject[],errs:errorObject[],ck:Function)=>{
    //     if(errs.length!==0){
    //         for(let i=0;i<errs.length;i++) result.error.push(errs[i]);
    //     }
    //     for(let i=0;i<list.length;i++){
    //         const row:anchorObject=list[i];
    //         result.map[`${row.name}_${row.block}`]=row;
    //     }
    //     const last:anchorObject=list[0];
    //     const hlist:number[]=[];            //get latest auth anchor hide list.
    //     self.decodeAuthAnchor(<anchorObject[]>list,hlist,(map:authAddress,tmap:authTrust,amap:anchorMap,errs:errorObject[])=>{
    //         for(let k in amap) result.map[k]=amap[k];  //if hide anchor data, merge to result
    //         for(let i=0;i<errs.length;i++) result.error.push(errs[i]);
    //         result.index[relatedIndex.AUTH]=[last.name,0];
    //         result.auth=<authAddress>map;
    //         result.index[relatedIndex.TRUST]=["good",112233];
    //         result.trust=<authAddress>map;
    //         //TODO, add trust decoder entry
    //         self.decodeTrustAnchor(<anchorObject[]>list,hlist,(map:authTrust,amap:anchorMap,errs:errorObject[])=>{
    //             console.log(`Got the trust result`);
    //             result.index[relatedIndex.TRUST]=["good",112233];
    //             result.trust=<authAddress>map;
    //             return ck && ck(result);
    //         });
    //     });
    // },
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
    // //!important, by using the history of anchor, `hide` keyword is still support
    // //!important, checking the latest anchor data, using the `hide` feild to get data.
    // decodeAuthAnchor:(list:anchorObject[],hlist:number[],ck:(res: authAddress,tmap:authTrust,amap:anchorMap,errs:errorObject[])=>void)=>{
    //     const map:authAddress={};
    //     const tmap:authTrust={};
    //     const amap:anchorMap={};
    //     const errs:errorObject[]=[];
    //     //FIXME, if the latest auth anchor is hidden,need to check next one.
    //     const last:anchorObject=list[0];
    //     if(last.protocol===null){
    //         errs.push({error:"Not valid anchor"});
    //         return ck && ck(map,tmap,amap,errs);
    //     }
    //     const protocol=<keywords>last.protocol;
    //     self.declaredHideList(protocol,(hlist:number[],resMap:anchorMap,herrs:errorObject[])=>{
    //         errs.push(...herrs);
    //         for(let k in resMap){
    //             amap[k]=resMap[k]
    //         }
    //         let hmap:any={};
    //         for(let i=0;i<hlist.length;i++){
    //             hmap[hlist[i].toString()]=true;
    //         }
    //         for(let i=0;i<list.length;i++){
    //             const row:anchorObject=list[i];
    //             if(hmap[row.block.toString()]) continue;
    //             if(!row.protocol || row.protocol.fmt!==formatType.JSON || row.raw===null) continue;
    //             try {
    //                 const tmap=JSON.parse(row.raw);
    //                 for(let k in tmap) map[k]=tmap[k];
    //             } catch (error) {
    //                 errs.push(<errorObject>{error:error});
    //             }
    //         }
    //         return ck && ck(map,tmap,amap,errs);
    //     });
    // },
    // //TODO, decode trust data here
    // decodeTrustAnchor:(list:anchorObject[],hlist:number[],ck:(res: authTrust,amap:anchorMap,errs:errorObject[])=>void)=>{
    //     const map:authTrust={};
    //     const amap:anchorMap={};
    //     const errs:errorObject[]=[];
    //     map["good"]=0;
    //     map["world"]=455667
    //     return ck && ck(map,amap,errs);
    // },
    //check auth anchor's hide list
    //check trust anchor's hide list.
    // declaredHideList:(protocol:keywords,ck:(res: number[],map:anchorMap,error:errorObject[])=>void)=>{
    //     const map:anchorMap={};
    //     const errs:errorObject[]=[];
    //     const list:number[]=[];
    //     if(!protocol.hide) return ck && ck(list,map,errs);
    //     if(Array.isArray(protocol.hide)) return ck && ck(<number[]>protocol.hide,map,errs);
    //     self.getAnchor([<string>protocol.hide,0],(anchorH:anchorObject|errorObject)=>{
    //         const err=<errorObject>anchorH;
    //         if(err.error){
    //             errs.push(err);
    //             return ck && ck(list,map,errs);
    //         }
    //         const hlist=self.decodeHideAnchor(<anchorObject>anchorH);
    //         const errH=<errorObject>hlist;
    //         if(errH.error)errs.push(errH);
    //         const anchor=<anchorObject>anchorH;
    //         //console.log(anchor);
    //         map[`${anchor.name}_${anchor.block}`]=<anchorObject>anchor;
    //         return ck && ck(<number[]>hlist,map,errs);
    //     });
    // },
    // checkLast:(name:string,block:number,ck:Function)=>{
    //     API?.common.owner(name,(owner:string,last:number)=>{
    //         return ck && ck(block===last?true:false);
    //     });
    // },
    //check the authority between anchors
    // checkTrust:(caller:easyResult,app:easyResult,ck:Function)=>{
    // },
    //check the authority to account address
    checkAuthority: function (caller, app, ck) {
        //1.check the called anchor type.
        if (app.type !== protocol_1.rawType.APP) {
            caller.error.push({ error: "Answer is not cApp." });
            return ck && ck(caller);
        }
        //2.check the authority
        var from = caller.data["".concat(caller.location[0], "_").concat(caller.location[1])];
        var signer = from.signer;
        var auths = app.auth;
        //2.1. no authority data, can 
        if (auths === undefined) {
            caller.app = app;
            return ck && ck(caller);
        }
        else {
            if (self.empty(auths)) {
                caller.app = app;
                return ck && ck(caller);
            }
            else {
                if (auths[signer] === undefined) {
                    caller.error.push({ error: "No authority of caller." });
                    return ck && ck(caller);
                }
                else {
                    if (auths[signer] === 0) {
                        caller.app = app;
                        return ck && ck(caller);
                    }
                    else {
                        API === null || API === void 0 ? void 0 : API.common.block(function (block, hash) {
                            console.log(block);
                            if (block > auths[signer]) {
                                caller.error.push({ error: "Authority out of time." });
                                return ck && ck(caller);
                            }
                            else {
                                caller.app = app;
                                return ck && ck(caller);
                            }
                        });
                    }
                }
            }
        }
    },
    //get the latest decared hide anchor list.
    getLatestDeclaredHidden: function (location, ck) {
        self.getAnchor([location[0], 0], function (resLatest) {
            //1. failde to get the hide anchor.
            var err = resLatest;
            //if(err.error) return ck && ck(err);
            if (err.error)
                return ck && ck([]);
            var data = resLatest;
            var protocol = data.protocol;
            if (protocol === null || !protocol.hide)
                return ck && ck([]);
            if (Array.isArray(protocol.hide))
                return ck && ck(protocol.hide);
            self.getAnchor([protocol.hide, 0], function (resHide) {
                var err = resLatest;
                //if(err.error) return ck && ck(err);
                if (err.error)
                    return ck && ck([]);
                var data = resHide;
                if (data === null || !data.raw)
                    return ck && ck([]);
                try {
                    var list = JSON.parse(data.raw);
                    return ck && ck(list);
                }
                catch (error) {
                    return ck && ck({ error: error });
                }
            });
        });
    },
    /**************************************************************************/
    /*************************Declared anchor check****************************/
    /**************************************************************************/
    //check wether current anchor is in the hide list
    isValidAnchor: function (hide, data, ck, params) {
        //console.log(params);
        var errs = [];
        var cur = data.block;
        var overload = false; //wether to the end of `Anchor` history
        if (Array.isArray(hide)) {
            //1.if the hide is array, check directly
            var hlist = hide;
            for (var i = 0; i < hlist.length; i++) {
                if (cur === hlist[i]) {
                    if (data.pre === 0) {
                        errs.push({ error: "Out of ".concat(data.name, " limited") });
                        overload = true;
                        return ck && ck(null, errs, overload);
                    }
                    var new_link = (0, decoder_1.linkCreator)([data.name, data.pre], params);
                    return ck && ck(new_link, errs, overload);
                }
            }
            return ck && ck(null, errs);
        }
        else {
            //2.get the latest hide anchor data
            var h_location = [hide, 0];
            self.getAnchor(h_location, function (hdata) {
                var res = self.decodeHideAnchor(hdata);
                var err = res;
                if (err.error)
                    errs.push(err);
                var hlist = res;
                for (var i = 0; i < hlist.length; i++) {
                    if (cur === hlist[i]) {
                        if (data.pre === 0) {
                            errs.push({ error: "Out of ".concat(data.name, " limited") });
                            overload = true;
                            return ck && ck(null, errs, overload);
                        }
                        var new_link = (0, decoder_1.linkCreator)([data.name, data.pre], params);
                        return ck && ck(new_link, errs, overload);
                    }
                }
                return ck && ck(null, errs, overload);
            });
        }
    },
    /**************************************************************************/
    /****************************Basic functions*******************************/
    /**************************************************************************/
    /**
     * get params from string
     * @param {string}      args	    //String such as `key_a=val&key_b=val&key_c=val`
     * */
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
    /**
     * check wether object empty
     * @param {object}      obj	    //normal object
     * */
    empty: function (obj) {
        for (var k in obj)
            return false;
        return true;
    },
};
var decoder = {};
decoder[protocol_1.rawType.APP] = self.decodeApp;
decoder[protocol_1.rawType.DATA] = self.decodeData;
decoder[protocol_1.rawType.LIB] = self.decodeLib;
//!important, as support `declared hidden`, this function may redirect many times, be careful.
/**
 * Exposed method of Easy Protocol implement
 * @param {string}      linker	    //Anchor linker, such as `anchor://hello/`
 * @param {object}      inputAPI    //the API needed to access Anchor network, `anchorJS` mainly
 * @param {function}    ck          //callback, will return the decoded result
 * @param {boolean}     [fence]     //if true, treat the run result as cApp. Then end of the loop.
 * */
var run = function (linker, inputAPI, ck, hlist, fence) {
    if (API === null && inputAPI !== null)
        API = inputAPI;
    var target = (0, decoder_1.linkDecoder)(linker);
    if (target.error)
        return ck && ck(target);
    //0.get the latest declared hidden list
    if (hlist === undefined) {
        return self.getLatestDeclaredHidden(target.location, function (lastHide) {
            var cObject = {
                type: protocol_1.rawType.NONE,
                location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
                error: [],
                data: {},
                index: [null, null, null],
            };
            var res = lastHide;
            if (res.error) {
                cObject.error.push(res);
                return ck && ck(cObject);
            }
            var hResult = lastHide;
            return run(linker, API, ck, hResult);
        });
    }
    //1.decode the `Anchor Link`, prepare the result object.
    var cObject = {
        type: protocol_1.rawType.NONE,
        location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
        error: [],
        data: {},
        index: [null, null, null],
        hide: hlist,
        //trust:{},
    };
    if (target.param)
        cObject.parameter = target.param;
    //2.Try to get the target `Anchor` data.
    self.getAnchor(target.location, function (resAnchor) {
        //2.1.error handle.
        var err = resAnchor;
        if (err.error) {
            cObject.error.push(err);
            return ck && ck(cObject);
        }
        var data = resAnchor;
        if (cObject.location[1] === 0)
            cObject.location[1] = data.block;
        cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])] = data;
        //2.2.Wether JSON protocol
        if (data.protocol === null) {
            cObject.error.push({ error: "No valid protocol" });
            return ck && ck(cObject);
        }
        //2.3.Wether Easy Protocol
        var type = !data.protocol.type ? "" : data.protocol.type;
        if (!decoder[type]) {
            cObject.error.push({ error: "Not easy protocol type" });
            return ck && ck(cObject);
        }
        //3. check wether the latest anchor. If not, need to get latest hide data.
        if (data.protocol) {
            self.isValidAnchor(hlist, data, function (validLink, errs, overload) {
                var _a;
                (_a = cObject.error).push.apply(_a, errs);
                if (overload)
                    return ck && ck(cObject);
                if (validLink !== null)
                    return run(validLink, API, ck, hlist);
                return getResult(type);
            }, cObject.parameter === undefined ? {} : cObject.parameter);
        }
        else {
            return getResult(type);
        }
        //inline function to avoid the repetitive code.
        function getResult(type) {
            self.merge(data.name, data.protocol, {}, function (mergeResult) {
                var _a;
                if (mergeResult.auth !== null)
                    cObject.auth = mergeResult.auth;
                if (mergeResult.trust !== null)
                    cObject.trust = mergeResult.trust;
                if (mergeResult.hide != null && mergeResult.hide.length !== 0) {
                    cObject.hide = mergeResult.hide;
                }
                if (mergeResult.error.length !== 0) {
                    (_a = cObject.error).push.apply(_a, mergeResult.error);
                }
                if (mergeResult.index[protocol_2.relatedIndex.AUTH] !== null && cObject.index) {
                    cObject.index[protocol_2.relatedIndex.AUTH] = mergeResult.index[protocol_2.relatedIndex.AUTH];
                }
                if (mergeResult.index[protocol_2.relatedIndex.HIDE] !== null && cObject.index) {
                    cObject.index[protocol_2.relatedIndex.HIDE] = mergeResult.index[protocol_2.relatedIndex.HIDE];
                }
                if (mergeResult.index[protocol_2.relatedIndex.TRUST] !== null && cObject.index) {
                    cObject.index[protocol_2.relatedIndex.TRUST] = mergeResult.index[protocol_2.relatedIndex.TRUST];
                }
                for (var k in mergeResult.map) {
                    cObject.data[k] = mergeResult.map[k];
                }
                return decoder[type](cObject, function (resFirst) {
                    if (resFirst.call && !fence) {
                        var app_link = (0, decoder_1.linkCreator)(resFirst.call, resFirst.parameter === undefined ? {} : resFirst.parameter);
                        return run(app_link, API, function (resApp) {
                            return self.checkAuthority(resFirst, resApp, ck);
                        }, hlist, true);
                    }
                    else {
                        return ck && ck(resFirst);
                    }
                });
            });
        }
    });
};
//Debug part to get more details of process.
var debug_run = function (linker, inputAPI, ck) {
    debug.search = [];
    debug.start = debug.stamp();
    run(linker, inputAPI, function (resRun) {
        if (!debug.disable)
            resRun.debug = debug; //add debug information
        debug.end = debug.stamp();
        cache.clear();
        return ck && ck(resRun);
    });
};
var final_run = (debug.disable ? run : debug_run);
exports.easyRun = final_run;
