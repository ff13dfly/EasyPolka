//!important This is the library for creating auth data

import { anchorLocation,authAddress,keywords} from "./protocol";
const md5 =require("md5");

// create the anchor hiddeing default data
const creator=(anchor:string,ck:Function,isNew?:boolean)=>{
    
};
export {creator as easyAuth};

// check anchor to get auth list. 
const check=(anchor:string,protocol:keywords,ck:Function)=>{
    const data={
        "list":<authAddress|null>null,      //direct result from protocol
        "anchor":<anchorLocation|null>null,    //target anchor to get result
    }
    
    //TODO, auto MD5 anchor function is not tested yet.
    if(protocol.auth){
        //1.check wether target anchor 
        if(typeof protocol.auth==="string" || Array.isArray(protocol.auth)){
            data.anchor = protocol.auth;
        }else{
            data.list=<authAddress>protocol.auth;
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


const trust_check=(anchor:string,protocol:keywords,ck:Function)=>{
    const data={
        "list":<authAddress|null>null,      //direct result from protocol
        "anchor":<anchorLocation|null>null,    //target anchor to get result
    }
    
    //TODO, auto MD5 anchor function is not tested yet.
    if(protocol.trust){
        //1.check wether target anchor 
        if(typeof protocol.trust==="string" || Array.isArray(protocol.trust)){
            data.anchor = protocol.trust;
        }else{
            data.list=<authAddress>protocol.trust;
        }
    }else{
        //2.check default anchor
        if(protocol.salt){
            data.anchor=md5(anchor+protocol.salt[0])
        }
    }

    return ck && ck(data);
};

export {trust_check as checkTrust};


