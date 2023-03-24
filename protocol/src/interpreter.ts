//!important This is the library for Esay Protocol
import { localtionObject } from "./protocol";
import { anchorJS } from "../lib/anchor";

const self={
    check:(location:localtionObject|string)=>{
        console.log(`Checking : ${JSON.stringify(location)}`);
    },
}

export {self as easyProtocol};