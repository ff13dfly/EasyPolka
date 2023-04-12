"use strict";
//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`
Object.defineProperty(exports, "__esModule", { value: true });
exports.easyRun = void 0;
var protocol_1 = require("./protocol");
var decoder_1 = require("./decoder");
var auth_1 = require("./auth");
var hide_1 = require("./hide");
var loader_1 = require("../lib/loader");
var anchor_1 = require("../lib/anchor");
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
        if (data.error)
            return ck && ck({ error: data.error, level: protocol_1.errorLevel.ERROR });
        if (data.empty)
            return ck && ck({ error: "Empty anchor.", level: protocol_1.errorLevel.ERROR });
        if (!data.protocol)
            return ck && ck({ error: "No-protocol anchor." });
        var protocol = data.protocol;
        if (!protocol.type)
            return ck && ck({ error: "Not EasyProtocol anchor." });
        return ck && ck(data);
    },
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
    decodeData: function (obj, ck) {
        console.log("Decode data anchor");
    },
    decodeApp: function (obj, ck) {
        console.log("Decode app anchor");
    },
    decodeLib: function (obj, ck) {
        console.log("Decode lib anchor");
    },
    getLibs: function (list, ck) {
        console.log("Ready to get libs: ".concat(JSON.stringify(list)));
        var API = {
            search: anchor_1.anchorJS.search,
            target: anchor_1.anchorJS.target,
        };
        //Loader(list,API,ck);
        (0, loader_1.Libs)(list, API, ck);
    },
    more: function () {
    },
    // check the authority of anchor if launch from data
    authorize: function () {
    },
    hide: function () {
    },
    // check running enviment (window or node.js)
    env: function () {
    },
};
var decoder = {};
decoder[protocol_1.rawType.APP] = self.decodeApp;
decoder[protocol_1.rawType.DATA] = self.decodeData;
decoder[protocol_1.rawType.LIB] = self.decodeLib;
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
        (0, auth_1.checkAuth)(data.name, data.protocol, {}, function (authObject) {
            //if(authObject!==null) cObject.hide=authObject;
            (0, hide_1.checkHide)(data.name, data.protocol, {}, function (hideObject) {
                return decoder[type](cObject, ck);
            });
        });
    });
    // self.getAnchor(target.location,(res:any)=>{
    //     if(res.error) return ck && ck(res);
    //     if(cObject.location[1]===0)cObject.location[1]=res.block;
    //     cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=res;
    //     checkAuth(res.name,res.protocol,{},(alist:object|null)=>{
    //         console.log(alist);
    //     });
    //     // checkAuth(target.location[0],'ab',{},()=>{
    //     // });
    //     // checkHide(target.location[0],'cc',{},()=>{
    //     // });
    //     // self.getLibs(["js_a"],(map:any,order:[])=>{
    //     //     console.log(map);
    //     //     console.log(order);
    //     // });
    //     // 1.check anchor data
    //     switch (res.protocol.type) {
    //         case "app":
    //             console.log(`App type anchor`);
    //             try {
    //                 cObject.app = new Function("container","API","args","from","error",res.raw);
    //             } catch (error) {
    //                 cObject.error.push({error:"Failed to get function"});
    //             }
    //             if(res.protocol.lib){
    //                 self.getLibs(res.protocol.lib,(map:any,order:[])=>{
    //                     //console.log(map);
    //                     //console.log(order);
    //                     ck && ck(cObject);
    //                 })
    //             }else{
    //                 ck && ck(cObject);
    //             }
    //             break;
    //         case "data":
    //             console.log(`Data type anchor`);
    //             if(res.protocol.call){
    //                 const app_answer=Array.isArray(res.protocol.call)?res.protocol.call:[res.protocol.call,0];
    //                 return self.getAnchor(app_answer,(answer:any)=>{
    //                     if(answer.error || answer.empty){
    //                         cObject.error.push({error:"Failed to load answer anchor"});
    //                         return ck && ck(cObject);
    //                     }
    //                     if(!answer.protocol || !answer.protocol.type){
    //                         cObject.error.push({error:"Called Not-EasyProtocol anchor."});
    //                         return ck && ck(cObject);
    //                     }
    //                     cObject.from=cObject.location;
    //                     cObject.location=[app_answer[0],answer.block];
    //                     cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=answer;
    //                     try {
    //                         cObject.app = new Function("container","API","args","from","error",answer.raw);
    //                     } catch (error) {
    //                         cObject.error.push({error:"Failed to get function"});
    //                     }
    //                     if(res.protocol.args){
    //                         const args=self.getParams(res.protocol.args);
    //                         if(!args.error) cObject.parameter=args;
    //                         else cObject.error.push(args);
    //                     }
    //                     ck && ck(cObject);
    //                 });
    //             }
    //             ck && ck(cObject);
    //             break;
    //         case "lib":
    //             console.log(`Lib type anchor`);
    //             break;
    //         default:
    //             console.log(`Unexcept type anchor`);
    //             ck && ck(cObject);
    //             break;
    //     }
    // });
};
exports.easyRun = run;
