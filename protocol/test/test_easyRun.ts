// npm i -D typescript
// npx tsc index.ts --skipLibCheck
// node index.js

// declare var ApiPromise: any; 
// declare var WsProvider: any;
// declare var Keyring: any; 
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';

import { anchorJS } from "../lib/anchor";
import { anchorLocation } from "../src/protocol";
import { easyRun } from "../src/interpreter";

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
}

const self={
    prepare:(node:string,ck:Function)=>{
        try {
            console.log({node});
            const provider = new WsProvider(node);
            ApiPromise.create({ provider: provider }).then((api) => {
                if(!anchorJS.set(api)){
                    console.log('Error anchor node.');
                }
                anchorJS.setKeyring(Keyring);
                return ck && ck();
            });
          } catch (error) {
            return ck && ck(error);
          }
    },
}

const server="ws://127.0.0.1:9944";
self.prepare(server,()=>{
    easyRun(["hello",223],API,()=>{});
    
});