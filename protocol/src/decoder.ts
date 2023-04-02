//!important This is the library for decoding anchor link

import { anchorLocation}from "./protocol";

type decoderResult={
    location:anchorLocation;
    param?:params;
};

interface params {
    [anchor: string]: any;
}

const setting={
    "check":false,      //auto check the anchor exsist
    "utf8":true,        //auto decode parameter to UTF8
};


const decoder=(link:string,cfg?:any,ck?:Function)=>{
    let res:decoderResult={
        location:["hello",223],

    };

    return ck && ck(res);
};

export {decoder as linkDecoder};