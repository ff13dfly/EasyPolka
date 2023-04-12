//!important This is the library for creating auth data

import { anchorObject,authMap} from "./protocol";
const md5 =require("md5");

// create the anchor hiddeing default data
const creator=(anchor:string,ck:Function,isNew?:boolean)=>{
    
};
export {creator as easyAuth};

// check anchor to get auth list. 
// if the anchor exsist, as white list
type cfgAuth={
    "history"?:boolean;     //wether using the history data as auth list
}

type result={
    'list':authMap[]|null;
    'anchor':anchorObject|null;
};

type APIs={
    "latest"?:Function;
    "histor"?:Function;
}

const check=(anchor:string,protocol:object,funs:APIs,cfg:cfgAuth,ck:Function)=>{
    console.log(anchor);
    console.log(protocol);
    console.log(funs);
    //const dkey=!protocol.auth?(anchor+salt):auth;

    const data:result={
        "list":null,
        "anchor":null,
    }

    console.log(md5("hello"))

    // const dkey=!auth?(anchor+salt):auth;
    // console.log(dkey);
    // const hash=md5(dkey);
    // console.log(`Check hide anchor:${anchor}, hash : ${hash}`);
    return ck && ck(data);
};

export {check as checkAuth};


