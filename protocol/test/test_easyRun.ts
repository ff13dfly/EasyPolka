// npx tsc test_easyRun.ts --skipLibCheck
// node test_easyRun.js

import { ApiPromise, WsProvider,Keyring } from '@polkadot/api';
import { easyRun } from "../src/interpreter";
const anchorJS =require("../../anchorJS/publish/anchor");

const API={
    "common":{
        "latest":anchorJS.latest,
        "target":anchorJS.target,
        "history":anchorJS.history,
        "owner":anchorJS.owner,
        "subcribe":anchorJS.subcribe,
        "block":anchorJS.block,
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
    auto:(list:Function[])=>{
        // ApiPromise.create({ provider: new WsProvider(config.endpoint) }).then((api) => {
        //     console.log('Linker to substrate node created...');
        //     websocket=api;

        //     anchorJS.set(api);
        //     anchorJS.setKeyring(Keyring);
        //     self.prework(()=>{
        //         test_start=self.stamp();
        //         console.log(`\n********************Start of Writing Mock Data********************\n`);
        //         self.run(list,list.length);
        //     });
        // });
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
    const linker_full_caller="anchor://full_caller/?hello=world&me=fuu";
    const linker_lib_caller="anchor://js_a/";
    const linker_declared_hide="anchor://hide_last_9627/"   //right result is block 20682
    const linker_declared_hide_complex="anchor://hide_last_9627/20685/"
    const linker_node_hello="anchor://node_hello/"

    console.log(`\n`);
    easyRun(linker_node_hello,API,(result:any)=>{
        console.log(`\n-----------------result of ${linker_full_caller}-----------------`);
        console.log(result.libs);
        //console.log(JSON.stringify(result));
        console.log(`\n\n`);

        // easyRun(linker_declared_hide_complex,API,(result:any)=>{
        //     console.log(`\n-----------------result of ${linker_declared_hide_complex}-----------------`);
        //     console.log(JSON.stringify(result));
        //     console.log(`\n\n`);
        // });
    });
});

const task:Function[]=[

];
self.auto(task);

