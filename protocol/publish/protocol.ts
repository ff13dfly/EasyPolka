//!important This is the library for Esay Protocol

// import anchorJS, need to confirm and get libs
import {anchorJS} from '../lib/anchor.js';

// npx tsc protocol.ts
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
    //check
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