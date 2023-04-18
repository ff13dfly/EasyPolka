//!important This is the library for decoding anchor link

//!important 3 format of anchor linker. The "/" is optional.
//!important `anchor://${anchor}/${block}[/]`;
//!important `anchor://${anchor}[/]`;
//!important `anchor://${anchor}/${block}[/]?${key_1}=${value_1}&${key_2}=${value_2}`;

//follow the URL way to solve the sepecial characters.

import { anchorLocation, errorObject }from "./protocol";

type decoderResult={
    location:[string,number];
    param?:params;
};

interface params {
    [anchor: string]: string;
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

const creator=(local:anchorLocation)=>{
    if(Array.isArray(local)){
        if(local[1]!==0){
            return `${setting.pre}${local[0]}/${local[1]}`;
        }else{
            return `${setting.pre}${local[0]}`;
        }
    }else{
        return `${setting.pre}${local}`;
    }
}
export {creator as linkCreator};


const decoder=(link:string,cfg?:any)=>{
    let res:decoderResult={
        location:["",0],
    };
    const str=link.toLocaleLowerCase();
    const pre=setting.pre;

    //0. format check
    if(str.length <= pre.length+1) return {error:"invalid string"};
    const head=str.substring(0,pre.length);
    if(head!==pre) return {error:"invalid protocol"};

    //1. remove prefix `anchor://`
    let body=str.substring(pre.length,str.length);

    //2. check parameter
    const arr=body.split("?");
    if(arr.length > 2) return { error: "error request, please check anchor name" };
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
    const ls:string[]=body.split("/");
    const last:string[]=[];
    for(let i=0;i<ls.length;i++){
        if(ls[i]!=='') last.push(ls[i]);
    }
    
    //4. export result
    if(last.length===1){
        res.location[0]=last[0];
        res.location[1]=0;
    }else{
        const ele:any=last.pop();
        const block=parseInt(ele);
        if(isNaN(block)) return {error:"block number error"}
        res.location[1]=block;
        res.location[0]=last.join('/');
    }

    return res;
};

export {decoder as linkDecoder};