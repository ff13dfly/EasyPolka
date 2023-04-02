//!important This is the library for decoding anchor link

//!important 3 format of anchor linker. The "/" is optional.
//!important `anchor://${anchor}/${block}[/]`;
//!important `anchor://${anchor}[/]`;
//!important `anchor://${anchor}/${block}[/]?${key_1}=${value_1}&${key_2}=${value_2}`;

//follow the URL way to solve the sepecial characters.

import { anchorLocation }from "./protocol";

//linker decoder result
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


const decoder=(link:string,cfg?:any)=>{
    let res:decoderResult={
        location:["hello",223],
        param:{"from":"cApp"},
    };

    return res;
};

export {decoder as linkDecoder};