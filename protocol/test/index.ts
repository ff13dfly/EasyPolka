// npm i -D typescript
// npx tsc index.ts
// node index.js

// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { Keyring } from '@polkadot/api';

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
            const res:any=[];
            console.log(list);
            return ck && ck(res);
        },
        "owner":anchorJS.owner,
        "subcribe":anchorJS.subcribe,
    },
    //"polka":{},
    //"gateway":{}
}

// const self={
//     prepare:(node:string,ck:Function)=>{
//         try {
//             const provider = new WsProvider(node);
//             ApiPromise.create({ provider: provider }).then((api) => {
//                 if(!anchorJS.set(api)){
//                     console.log('Error anchor node.');
//                 }
//                 anchorJS.setKeyring(Keyring);
//                 return ck && ck();
//             });
//           } catch (error) {
//             return ck && ck(error);
//           }
//     },
// }

const server="ws://localhost:9944";
//self.prepare(server,()=>{
    easyRun(["hello",223],API,()=>{});
    easyRun(["你好",1234],API,()=>{});
    
    const data=easyProtocol(rawType.APP);
    console.log(data);
    
    const anchor_a="";
    linkDecoder(anchor_a,(res)=>{
        console.log(res);
    });
//});