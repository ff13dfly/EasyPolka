// npx tsc test_easyRun.ts --skipLibCheck
// node test_easyRun.js

import { ApiPromise, WsProvider,Keyring } from '@polkadot/api';

const {anchorJS} =require("../lib/anchor");

import { easyRun } from "../src/interpreter";

const API={
    "common":{
        "latest":anchorJS.latest,
        "target":anchorJS.target,
        "history":anchorJS.history,
        "owner":anchorJS.owner,
        "subcribe":anchorJS.subcribe,
    },
}

const self={
    prepare:(node:string,ck:Function)=>{
        try {
            //console.log({node});
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
    //const linker="anchor://entry_app/?hello=world&me=fuu";
    //const linker="anchor://entry_app/3/?hello=world&me=fuu";
    //const linker="anchor://data_caller";
    //const linker="anchor://auth_me_direct";
    //const linker="anchor://hide_me_by_anchor";
    const linker="anchor://complex_anchor/";
    
    easyRun(linker,API,(result:any)=>{
        console.log(`-----------------result-----------------`)
        console.log(result);
        console.log(JSON.stringify(result.data));
        //new Function("anchorJS","error",result.raw);
        //new Function("container","API","args","from","error",res.raw);
        if(result.app) result.app("con_id",API,{"hello":"world"});
    });
});