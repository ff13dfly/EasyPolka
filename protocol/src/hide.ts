//!important This is the library for creating auth data
import { anchorLocation,keywords} from "./protocol";
const md5 =require("md5");

const creator=(anchor:string)=>{
    
};
export {creator as easyHide};

type result={
    'list':number[]|null;
    'anchor':anchorLocation|null;
};
// check anchor to get hide list
const check=(anchor:string,protocol:keywords,ck:Function)=>{
    const data:result={
        "list":null,      //direct result from protocol
        "anchor":null,    //target anchor to get result
    }
    
    //FIXME need to fix the checking
    if(protocol.hide){
        //1.check wether target anchor 
        if(typeof protocol.hide==="string"){
            data.anchor = protocol.hide;
        }else if(Array.isArray(protocol.hide)){
            data.list=<number[]>protocol.hide;
        }else{
            //data.list=protocol.hide;
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
