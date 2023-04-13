//!important This is the library for creating auth data

import { anchorLocation, anchorObject,authMap,keywords} from "./protocol";
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
    'anchor':anchorLocation|null;
};

type APIs={
    "latest"?:Function;
    "histor"?:Function;
}

const check=(anchor:string,protocol:keywords,cfg:cfgAuth,ck:Function)=>{
    const data:result={
        "list":null,
        "anchor":null,
    }
    
    if(protocol.auth){
        //1.check wether target anchor 
        if(typeof protocol.auth==="string" || Array.isArray(protocol.auth)){
            data.anchor=protocol.auth;
        }else{
            data.list=protocol.auth;
        }
    }else{
        //2.check default anchor
        if(protocol.salt){
            data.anchor=md5(anchor+protocol.salt[0])
        }
    }

    return ck && ck(data);
};

export {check as checkAuth};


