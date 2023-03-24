//!important This is the implement of Esay Protocol

// TS 学习资料
// https://blog.csdn.net/jiang_ziY/article/details/124072737

// complile TS to JS
// npx tsc protocol.ts

// import anchorJS, need to confirm and get libs
import {anchorJS} from '../lib/anchor.js';


const proto={
    "data":{
        "fmt":"string",
        "code":"string",
    },
    "app":{

        "lib":"localtion",
        "ver":"version",
    }
};

enum easyType{APP='app', DATA='data'};

const check={
    auto:(proto:object)=>{

    },
    string:(str:string)=>{

    },
    version:(str:string)=>{

    },
};

type cAppObject={

}
type dataObject={

}

type anchorObject={
    "name":string,
    "protocol":object,
    "raw":object|string,
    "block":number,
    "stamp":number,
    "pre":number,
    "signer":string,
    "empty":boolean,
    "owner":string,
    "sell":boolean,
    "cost":number,
    "target":string,
};

const funs={
    init:(name:string,ck:any)=>{
        anchorJS.search(name,(data:anchorObject)=>{
            console.log(data);
        });
    },

    //decode the cApp data
    decode:(protocol:object,raw:string|object)=>{

    },
}

export default {
	init:funs.init,
};