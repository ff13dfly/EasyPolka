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
    "pre":"anchor://",  //protocol prefix
};

const self={
    getParams:(str:string)=>{
        let map:any={};
        const arr=str.split("&");
        for(let i=0;i<arr.length;i++){
            const row=arr[i];
            const kv=row.split("=");
            if(kv.length!==2) return {error:"error parameter"}
            map[kv[0]]=kv[1];
        }
        return map;
    },
}

const decoder=(link:string,cfg?:any)=>{
    let res:decoderResult={
        location:["",0],
    };

    //1. remove prefix `anchor://`
    const str=link.toLocaleLowerCase();
    const body=str.substring(setting.pre.length,str.length);
    console.log(`Need decode link:${str},body:${body}`);

    //2. check parameter
    const arr=body.split("?");
    const isParam=arr.length===1?false:true;
    if(isParam){
        const ps=self.getParams(arr[1]);
        if(ps.error){
            return ps;
        }
        res.param=self.getParams(arr[1]);
    }

    //3. decode anchor location
    
    

    return res;
};

export {decoder as linkDecoder};