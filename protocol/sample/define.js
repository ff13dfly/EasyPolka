"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultValue = void 0;
var defaultValue = {
    anchorObject: {
        age: 0,
        start: 0,
        intro: '',
        check: function (n) {
            console.log(n > 10 ? "big than 10" : "small number");
        },
    },
    marketObject: {
        price: 0,
        owner: "",
        free: true,
    },
};
exports.defaultValue = defaultValue;
