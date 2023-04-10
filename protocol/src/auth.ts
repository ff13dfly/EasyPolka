//!important This is the library for creating auth data

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

const check=(anchor:string, salt:string,cfg:cfgAuth,ck:Function,auth?:string)=>{
    const dkey=!auth?(anchor+salt):auth;
    console.log(dkey);
    const hash=md5(dkey);
    console.log(`Check hide anchor:${anchor}, hash : ${hash}`);
};

export {check as checkAuth};


