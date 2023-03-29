"use strict";
//!important This is the definition of Esay Protocol.
//!important Easy Protocol is a simple protocol to launch cApp via Anchor network.
//!important Easy Protocol version 1.0 supported.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValue = exports.codeType = exports.formatType = exports.anchorType = void 0;
var errorLevel;
(function (errorLevel) {
    errorLevel["ERROR"] = "error";
    errorLevel["WARN"] = "warning";
    errorLevel["UNEXCEPT"] = "unexcept";
})(errorLevel || (errorLevel = {}));
/********************************/
/***********format part**********/
/********************************/
var anchorType;
(function (anchorType) {
    anchorType["DATA"] = "data";
    anchorType["APP"] = "app";
})(anchorType = exports.anchorType || (exports.anchorType = {}));
var formatType;
(function (formatType) {
    formatType["JAVASCRIPT"] = "js";
    formatType["CSS"] = "css";
    formatType["MARKDOWN"] = "md";
    formatType["JSON"] = "json";
    formatType["NONE"] = "";
})(formatType = exports.formatType || (exports.formatType = {}));
var codeType;
(function (codeType) {
    codeType["ASCII"] = "ascii";
    codeType["UTF8"] = "utf8";
    codeType["HEX"] = "hex";
    codeType["NONE"] = "";
})(codeType = exports.codeType || (exports.codeType = {}));
/********************************/
/******** default value *********/
/********************************/
//default value object
var defaultValue = {
    //cApp resutl object, if the anchor is empty
    cAppResult: {
        API: null,
        error: [],
        app: null,
        raw: null,
        parameter: [],
        nodeJS: false,
        from: "",
        back: [],
    },
};
exports.defaultValue = defaultValue;
