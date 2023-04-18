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
    const linker_params="anchor://entry_app/?hello=world&me=fuu";
    const linker_target="anchor://entry_app/3/?hello=world&me=fuu";
    const linker_data_caller="anchor://data_caller";
    const linker_auth_me_direct="anchor://auth_me_direct";
    const linker_hide_me_by_anchor="anchor://hide_me_by_anchor";
    const linker_complex_anchor="anchor://complex_anchor/";
    const linker_full_app="anchor://full_app/";
    const linker_full_caller="anchor://full_caller/";
    const linker_lib_caller="anchor://js_a/";
    
    easyRun(linker_lib_caller,API,(result:any)=>{
        console.log(`-----------------result-----------------`)
        //console.log(result);
        console.log(JSON.stringify(result));
        //new Function("anchorJS","error",result.raw);
        //new Function("container","API","args","from","error",res.raw);
        //if(result.app) result.app("con_id",API,{"hello":"world"});
    });
});