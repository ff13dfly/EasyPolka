// npm i -D typescript
// npx tsc index.ts
// node index.js

import { anchorJS } from "../lib/anchor";
import { easyProtocol } from "../src/format";
import { easyRun } from "../src/interpreter";
import { anchorLocation,rawType } from "../src/protocol";
import { linkDecoder } from "../src/decoder";

const API={
    "common":{
        "latest":anchorJS.latest,
        "target":anchorJS.target,
        "history":anchorJS.history,
        "lib":(list:anchorLocation[],ck:Function)=>{
            const res=[];
            console.log(list);
            return ck && ck(res);
        },
        "owner":anchorJS.owner,
        "subcribe":anchorJS.subcribe,
    },
    //"polka":{},
    //"gateway":{}
}

const address="5CaYdQ6i2mWgHmBpQXgmVdPqvYxSwoLo4KFchFnpzn8Kbdtg";

easyRun(["hello",223],address,API,()=>{});
easyRun(["你好",1234],address,API,()=>{});

const data=easyProtocol(rawType.APP);
console.log(data);

const anchor_a="";
linkDecoder(anchor_a,(res)=>{
    console.log(res);
});

// if(window!==undefined){
//     console.log("Browser");
// }else{
//     console.log("NodeJS");
// }