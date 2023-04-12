//!important This is the library for creating auth data
import { anchorObject} from "./protocol";
const md5 =require("md5");

const creator=(anchor:string)=>{
    
};
export {creator as easyHide};

type cfgAuth={
    "history"?:boolean;     //wether using the history data as auth list
}

type result={
    'list':object|null;
    'anchor':anchorObject|null;
};

// check anchor to get hide list
const check=(anchor:string,protocol:object,cfg:cfgAuth,ck:Function)=>{
    // const dkey=!hide?(anchor+salt):hide;
    // const hash=md5(dkey);
    // console.log(`Check hide anchor:${anchor}, hash : ${hash}`);
    
    console.log(anchor);
    console.log(protocol);
    const data:result={
        "list":null,
        "anchor":null,
    }
    return ck && ck(data);
};
export {check as checkHide};
