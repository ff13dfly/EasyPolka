//!important This is the file to create the mock cApp data.

//node test_mock_data.js

// import { ApiPromise, WsProvider } from '@polkadot/api';
// import { Keyring } from '@polkadot/api';
// import { anchorJS } from "../lib/anchor";

const { ApiPromise, WsProvider } =require('@polkadot/api');
const { Keyring } =require('@polkadot/api');
const {anchorJS} = require('../lib/anchor.js');

const config={
    color:'\x1b[36m%s\x1b[0m',
    endpoint:"ws://127.0.0.1:9944"
};

let websocket=null;

let test_start=0;
let test_end=0;
const self={
    run:(list,count)=>{
        if(list.length===0){
            test_end=self.stamp();
            console.log(`\nStart from ${test_start}, end at ${test_end}, total cost : ${((test_end-test_start)*0.001).toFixed(3)} s.`);
            //self.report();
            console.log(`\n********************End of Writing Mock Data********************`);
            return true;
        } 
        const fun=list.shift();
        fun(count-list.length,()=>{
            if(list.length!==0) console.log(`Done, ready for next one.\n\n`);
            setTimeout(()=>{
                self.run(list,count);
            },1500);
        });
    },
    prework:(ck)=>{
        return ck && ck();
    },
    auto:(list)=>{
        ApiPromise.create({ provider: new WsProvider(config.endpoint) }).then((api) => {
            console.log('Linker to substrate node created...');
            websocket=api;

            anchorJS.set(api);
            anchorJS.setKeyring(Keyring);
            self.prework(()=>{
                test_start=self.stamp();
                console.log(`\n********************Start of Writing Mock Data********************\n`);
                self.run(list,list.length);
            });
        });
    },
    stamp:()=>{
        return new Date().getTime();
    },
};

const list=[
    write_app_sample,
    write_data_sample,
];
self.auto(list);

function write_app_sample(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the demo cApp by Alice`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Alice');

    const anchor="entry_app";
    const raw="console.log(container);console.log(from);console.log(args);";
    const protocol={
        "type":"app",
        "fmt":"js",
        "ver":"1.0.0",
    };

    anchorJS.write(pair,anchor,raw,JSON.stringify(protocol),(res)=>{
        console.log(`[${index}] Result:`);
        console.log(res);
        if(res.step==="Finalized"){
            const end=self.stamp();
            console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
            return ck && ck();
        }
    });
}

function write_data_sample(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the caller data by Bob`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Bob');

    const anchor="data_caller";
    const raw={
        "content":"this is from key raw",
        "footer":"foot content",
    };
    const protocol={
        "type":"data",
        "fmt":"json",
        "call":"entry_app",
        "args":"id=12&title=hello",
    };

    anchorJS.write(pair,anchor,JSON.stringify(raw),JSON.stringify(protocol),(res)=>{
        console.log(`[${index}] Result:`);
        console.log(res);
        if(res.step==="Finalized"){
            const end=self.stamp();
            console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
            return ck && ck();
        }
    });
}