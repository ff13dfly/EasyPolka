"use strict";
/********************************/
/***********Anchor part**********/
/********************************/
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValue = exports.formatType = exports.anchorType = void 0;
/********************************/
/************cApp part***********/
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
/********************************/
/************ result ************/
/********************************/
var errorLevel;
(function (errorLevel) {
    errorLevel["ERROR"] = "error";
    errorLevel["WARN"] = "warning";
})(errorLevel || (errorLevel = {}));
//default value object
var defaultValue = {
    dataObject: {},
    cAppObject: {},
};
exports.defaultValue = defaultValue;
