//!important This is the library for creating auth data

const md5 =require("md5");

const creator=(anchor:string)=>{
    
};
export {creator as easyHide};


// check anchor to get hide list
const check=(anchor:string, salt:string,ck:Function,hide?:string)=>{
    const dkey=!hide?(anchor+salt):hide;
    const hash=md5(dkey);
    console.log(`Check hide anchor:${anchor}, hash : ${hash}`);
};
export {check as checkHide};
