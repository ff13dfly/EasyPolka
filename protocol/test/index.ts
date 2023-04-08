// npm i -D typescript
// npx tsc index.ts --skipLibCheck
// node index.js

// declare var ApiPromise: any; 
// declare var WsProvider: any;
// declare var Keyring: any; 
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';

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
    //easyRun(["hello",223],API,()=>{});
    //easyRun(["你好",1234],API,()=>{});
    //const data=easyProtocol(rawType.APP);

    const anchor_location=[
        "anchor://hello",
        "anchor://hello/",
        "anchor://hello/128",
        "anchor://hello/128/",
        "anchor://hello?ka=333&kb=string",
        "anchor://hello/?ka=333&kb=string",
        "anchor://hello/3323?ka=333&kb=data",
        "anchor://hello/3323/?ka=333&kb=data",
        "anchor://heLLo/3323/?pa=333&pb=data",
        "anchor://heL/Lo/3323/?pa=333&pb=data",
        "anchor://hello/bbb/",
        "anchors://hello/344/",
        "anors://hello/344/",
        "hello",
    ]
    for(let i=0;i<anchor_location.length;i++){
        const row=anchor_location[i];
        const res=linkDecoder(row);
        console.log(res);
    }
});