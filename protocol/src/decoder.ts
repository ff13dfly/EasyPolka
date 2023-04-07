//!important This is the library for decoding anchor link

//!important 3 format of anchor linker. The "/" is optional.
//!important `anchor://${anchor}/${block}[/]`;
//!important `anchor://${anchor}[/]`;
//!important `anchor://${anchor}/${block}[/]?${key_1}=${value_1}&${key_2}=${value_2}`;

//follow the URL way to solve the sepecial characters.

import { anchorLocation }from "./protocol";

//linker decoder result
// type decoderResult={
//     location:anchorLocation;
//     param?:params;
// };
type decoderResult={
    location:[string,number];
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
    let body=str.substring(setting.pre.length,str.length);
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
    body=arr[0];

    //3. decode anchor location
    const ls=body.split("/");
    const last=[];
    for(let i=0;i<ls.length;i++){
        if(ls[i]!=='') last.push(ls[i]);
    }
    console.log(last);
    
    //4. export result
    if(last.length===1){
        res.location[0]=last[0];
        res.location[1]=0;
    }else{
        const block:any=last.pop();
        res.location[1]=parseInt(block);
        res.location[0]=last.join('/');
    }

    return res;
};

export {decoder as linkDecoder};