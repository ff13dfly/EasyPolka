//!important This is the library for creating auth data
import { anchorLocation,authMap,keywords} from "./protocol";
const md5 =require("md5");

const creator=(anchor:string)=>{
    
};
export {creator as easyHide};

type result={
    'list':authMap[]|null;
    'anchor':anchorLocation|null;
};
// check anchor to get hide list
const check=(anchor:string,protocol:keywords,ck:Function)=>{
    const data:result={
        "list":null,      //direct result from protocol
        "anchor":null,    //target anchor to get result
    }
    
    if(protocol.hide){
        //1.check wether target anchor 
        if(typeof protocol.hide==="string" || Array.isArray(protocol.hide)){
            data.anchor = protocol.hide;
        }else{
            data.list=protocol.hide;
        }
    }else{
        //2.check default anchor
        if(protocol.salt){
            data.anchor=md5(anchor+protocol.salt[1])
        }
    }

    return ck && ck(data); 
};
export {check as checkHide};
