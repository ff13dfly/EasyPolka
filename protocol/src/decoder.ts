//!important This is the library for decoding anchor link

const decoder=(link:string,ck:Function)=>{
    const res={};
    return ck && ck(res);
};

export {decoder as linkDecoder};