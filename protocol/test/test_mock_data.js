//!important This is the file to create the mock cApp data.
//!important This JS can be run many times, the anchor data will be updated, but still can work

//#run this mock.
//node test_mock_data.js

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
    write_unexcept_data_sample,
    write_mock_normal_libs,
    write_mock_complex_libs,
];
self.auto(list);

function write_app_sample(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the demo cApp by Alice`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Alice');

    const anchor="entry_app";
    const raw="console.log(container);console.log(from);console.log(args);console.log(arguments)";
    const protocol={
        "type":"app",
        "fmt":"js",
        "ver":"1.0.0",
    };

    anchorJS.write(pair,anchor,raw,JSON.stringify(protocol),(res)=>{
        console.log(`[${index}] Processing:`);
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
        console.log(`[${index}] Processing:`);
        console.log(res);
        if(res.step==="Finalized"){
            const end=self.stamp();
            console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
            return ck && ck();
        }
    });
}

function write_unexcept_data_sample(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the unexcept data by Bob`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Bob');

    const anchor="error_caller";
    const raw={
        "content":"This is a test to call an unexsist anchor",
        "footer":"foot content",
    };
    const protocol={
        "type":"data",
        "fmt":"json",
        "call":"entry_none",
    };

    anchorJS.write(pair,anchor,JSON.stringify(raw),JSON.stringify(protocol),(res)=>{
        console.log(`[${index}] Processing:`);
        console.log(res);
        if(res.step==="Finalized"){
            const end=self.stamp();
            console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
            return ck && ck();
        }
    });
}

function write_mock_normal_libs(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the testing library by Alice.`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Alice');

    const anchor="jquery";
    const raw="This is mock JQuery library";
    const protocol={
        "type":"lib",
        "fmt":"js",
        "ver":"3.8.1",
    };

    const list=[
        {name:"jquery",raw:"This is mock JQuery library",protocol:{"type":"lib","fmt":"js","ver":"3.8.1"}},
        {name:"bootstrap",raw:"This is mock bootstrap",protocol:{"type":"lib","fmt":"js","ver":"5.2.3","lib":["bootstrap_css"]}},
        {name:"bootstrap_css",raw:"This is mock bootstrap css library",protocol:{"type":"lib","fmt":"css","ver":"3.8.1"}},
        {name:"animate",raw:"This is mock animate css library",protocol:{"type":"lib","fmt":"css","ver":"1.2.1"}},
    ];

    function auto(list,ck){
        if(list.length===0) return ck && ck();
        const row=list.pop();
        console.log(`Writing lib anchor : ${row.name}`);
        anchorJS.write(pair,row.name,row.raw,JSON.stringify(row.protocol),(res)=>{
            console.log(`[${index}] Processing:`);
            console.log(res);
            if(res.step==="Finalized"){
                auto(list,ck);
            }
        });
    }

    auto(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    });

}

function write_mock_complex_libs(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the testing library by Alice.`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Alice');

    const anchor="jquery";
    const raw="This is mock JQuery library";
    const protocol={
        "type":"lib",
        "fmt":"js",
        "ver":"3.8.1",
    };

    const list=[
        {name:"js_a",raw:"Entry lib js_a",protocol:{type:"lib",fmt:"js",ver:"1.8.1",lib:["js_a_1","js_b","js_a_2"]}},
        {name:"js_a_1",raw:"Needed lib js_a_1",protocol:{type:"lib",fmt:"js",ver:"5.2.3"}},
        {name:"js_a_2",raw:"Needed lib js_a_2",protocol:{type:"lib",fmt:"js",ver:"3.5.7"}},
        {name:"js_b",raw:"Needed lib js_b",protocol:{type:"lib",fmt:"js",ver:"1.1.0",lib:["js_b_1","js_b_2","js_b_3"],ext:["js_b_e_1"]}},
        {name:"js_b_1",raw:"Needed lib js_b_1",protocol:{type:"lib",fmt:"js",ver:"2.4.3"}},
        {name:"js_b_2",raw:"Needed lib js_b_2",protocol:{type:"lib",fmt:"js",ver:"2.2.9",lib:["js_b_2_1","js_b_2_1"]}},
        {name:"js_b_3",raw:"Needed lib js_b_3",protocol:{type:"lib",fmt:"js",ver:"2.3.1"}},
        {name:"js_b_e_1",raw:"Needed lib js_b_e_1",protocol:{type:"lib",fmt:"js",ver:"2.3.5"}},
        {name:"js_b_2_1",raw:"Needed lib js_b_2_1",protocol:{type:"lib",fmt:"js",ver:"1.2.7"}},
        {name:"js_b_2_2",raw:"Needed lib js_b_2_2",protocol:{type:"lib",fmt:"js",ver:"1.2.3"}},
    ];

    function auto(list,ck){
        if(list.length===0) return ck && ck();
        const row=list.pop();
        console.log(`Writing lib anchor : ${row.name}`);
        anchorJS.write(pair,row.name,row.raw,JSON.stringify(row.protocol),(res)=>{
            console.log(`[${index}] Processing:`);
            console.log(res);
            if(res.step==="Finalized"){
                auto(list,ck);
            }
        });
    }

    auto(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    });

}