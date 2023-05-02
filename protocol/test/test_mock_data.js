//!important This is the file to create the mock cApp data.
//!important This JS can be run many times, the anchor data will be updated, but still can work

//#run this mock.
//node test_mock_data.js

const { ApiPromise, WsProvider } =require('@polkadot/api');
const { Keyring } =require('@polkadot/api');
const {anchorJS} = require('../lib/anchor.js');
const md5 =require("md5");

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
    accounts:(ck)=>{

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
    multi:(list,ck,index,pair)=>{
        if(list.length===0) return ck && ck();
        const row=list.shift();
        console.log(`\nWriting lib anchor : ${row.name}`);
        const strProto=typeof(row.protocol)=='string'?row.protocol:JSON.stringify(row.protocol);
        const raw=typeof(row.raw)=='string'?row.raw:JSON.stringify(row.raw);
        anchorJS.write(pair,row.name,raw,strProto,(res)=>{
            console.log(`[${index}] Processing : ${row.name}, protocol ( ${strProto.length} bytes ) :${strProto}`);
            console.log(res);
            if(res.step==="Finalized"){
                self.multi(list,ck,index,pair);
            }
        });
    },
    stamp:()=>{
        return new Date().getTime();
    },
    randomData:(len)=>{
        let str='';
        const max=len===undefined?4:len;
        for(let i=0;i<max;i++){
            str+=Math.ceil(Math.random() * 10)-1;
        }
        return str;
    },
};

const task=[
    //write_app_sample,
    // write_data_sample,
    // write_unexcept_data_sample,
    // write_mock_normal_libs,
    // write_mock_complex_libs,
    // write_salt_hide_sample,
    // write_anchor_hide_sample,
    // write_anchor_auth_sample,
    // write_anchor_auth_and_hide_sample,
    // write_full_parameters_anchor_sample,
    write_full_parameters_caller_sample,
];
self.auto(task);

function write_app_sample(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the demo cApp by Alice`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Alice');

    const anchor="entry_app";
    const raw="console.log(container);console.log(from);console.log(args);console.log(arguments)";
    const protocol={"type":"app","fmt":"js","ver":"1.0.0"};
    const list=[{name:anchor,raw:raw,protocol:protocol}];

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}

function write_data_sample(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the caller data by Bob`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Bob');

    const anchor="data_caller";
    const raw={
        "content":"this is from key raw "+self.randomData(),
        "footer":"foot content",
    };
    const protocol={
        "type":"data",
        "fmt":"json",
        "call":"entry_app",
        "args":"id=12&title=hello",
    };

    const list=[{name:anchor,raw:raw,protocol:protocol}];

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}

function write_unexcept_data_sample(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the unexcept data by Bob`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Bob');

    const anchor="error_caller";
    const raw={
        "content":"This is a test to call an unexsist anchor "+self.randomData(),
        "footer":"foot content "+self.randomData(),
    };
    const protocol={"type":"data","fmt":"json","call":"entry_none"};

    const list=[{name:anchor,raw:raw,protocol:protocol}];

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}

function write_mock_normal_libs(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the testing library by Alice.`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Alice');

    const anchor="jquery";
    const raw="This is mock JQuery library "+self.randomData();
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

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);

}

function write_mock_complex_libs(index,ck){
    const start=self.stamp();
    console.log(config.color,`[${index}] ${start} Write the testing library by Alice.`);
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri('//Alice');

    const anchor="jquery";
    const raw="This is mock JQuery library "+self.randomData();
    const protocol={
        "type":"lib",
        "fmt":"js",
        "ver":"3.8.1",
    };

    const list=[
        {name:"js_a",raw:';(function(){console.log("js_a mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"1.8.1",lib:["js_a_1","js_b","js_a_2"]}},
        {name:"js_a_1",raw:';(function(){console.log("js_a_1 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"5.2.3"}},
        {name:"js_a_2",raw:';(function(){console.log("js_a_2 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"3.5.7"}},
        {name:"js_b",raw:';(function(){console.log("js_b mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"1.1.0",lib:["js_b_1","js_b_2","js_b_3"],ext:["js_b_e_1"]}},
        {name:"js_b_1",raw:';(function(){console.log("js_b_1 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"2.4.3"}},
        {name:"js_b_2",raw:';(function(){console.log("js_b_2 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"2.2.9",lib:["js_b_2_1","js_b_2_1"]}},
        {name:"js_b_3",raw:';(function(){console.log("js_b_3 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"2.3.1"}},
        {name:"js_b_e_1",raw:';(function(){console.log("js_b_e_1 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"2.3.5"}},
        {name:"js_b_2_1",raw:';(function(){console.log("js_b_2_1 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"1.2.7"}},
        {name:"js_b_2_2",raw:';(function(){console.log("js_b_2_2 mock lib")})()',protocol:{type:"lib",fmt:"js",ver:"1.2.3"}},
    ];

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}

function write_salt_hide_sample(index,ck){
    const start=self.stamp();
    const seed='Bob';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Write the salt hide data by ${seed}`);

    const list=[];
    const anchor="hideme";
    const raw="This is mock data to test hide function "+self.randomData();
    const protocol={"type":"data","fmt":"json","call":"entry_app","salt":["authacc","cda"]};
    list.push({name:anchor,raw:raw,protocol:protocol});

    const hide_name=md5(anchor+protocol.salt[1]);
    const hide_raw=[23,33];
    const hide_protocol={"type":"data","fmt":"json"};
    list.push({name:hide_name,raw:JSON.stringify(hide_raw),protocol:hide_protocol});


    const auth_name=md5(anchor+protocol.salt[0]);
    const auth_raw={
        "5DtBERu7U1SwPD1iebf5zHgjRsUnrU3iQgswySXeu6PK7eL4":0,
        "5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9":8900,
        "5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":32334,
    };
    const auth_protocol={"type":"data","fmt":"json"};
    list.push({name:auth_name,raw:JSON.stringify(auth_raw),protocol:auth_protocol});

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}

function write_anchor_hide_sample(index,ck){
    const start=self.stamp();
    const seed='Alice';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Write the target hide data by ${seed}`);

    const list=[];

    const direct_anchor="hide_me_direct";
    const direct_raw=[34,2234];
    const direct_protocol={"type":"data","fmt":"json","hide":[3456,23890]};
    list.push({name:direct_anchor,raw:direct_raw,protocol:direct_protocol});

    const anchor="hide_me_by_anchor";
    const raw="This is mock data to test hide function "+self.randomData();
    const protocol={"type":"data","fmt":"json","hide":"hbyanchor"};
    list.push({name:anchor,raw:raw,protocol:protocol});

    const target_anchor="hbyanchor";
    const target_raw=[22,5666];
    const target_protocol={"type":"data","fmt":"json",};
    list.push({name:target_anchor,raw:target_raw,protocol:target_protocol});

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}

function write_anchor_auth_sample(index,ck){
    const start=self.stamp();
    const seed='Bob';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Write the target hide data by ${seed}`);

    const list=[];

    const direct_anchor="auth_me_direct";
    const direct_raw="fake data for auth direct "+self.randomData();
    const direct_protocol={"type":"data","fmt":"json","auth":{"5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":0}};
    list.push({name:direct_anchor,raw:direct_raw,protocol:direct_protocol});

    const anchor="auth_me_by_anchor";
    const raw="This is mock data to test auth function "+self.randomData();
    const protocol={"type":"data","fmt":"json","auth":"abyanchor"};
    list.push({name:anchor,raw:raw,protocol:protocol});

    const target_anchor="abyanchor";
    const target_raw={
        "5DtBERu7U1SwPD1iebf5zHgjRsUnrU3iQgswySXeu6PK7eL4":0,
        "5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9":38900,
        "5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":12334,
        "5CUUuCwJbXo8jVJQW21huCFWtBrg2K61wbZBiyGP3V7ZC4Ko":0,
    };;
    const target_protocol={"type":"data","fmt":"json",};
    list.push({name:target_anchor,raw:target_raw,protocol:target_protocol});

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}

function write_anchor_auth_and_hide_sample(index,ck){
    const start=self.stamp();
    const seed='Bob';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Write the target hide data by ${seed}`);

    const list=[];
    const txt="This is a complex anchor";
    const basic_anchor="complex_anchor";
    const basic_raw={"tips":txt+self.stamp()};
    const basic_protocol={"type":"data","fmt":"json","auth":"cpx_auth","hide":"cpx_hide"};
    list.push({name:basic_anchor,raw:basic_raw,protocol:basic_protocol});
    // basic_raw.tips=txt+" last one";
    // list.push({name:basic_anchor,raw:basic_raw,protocol:basic_protocol});

    const auth_anchor="cpx_auth";
    const auth_raw={
        "5DtBERu7U1SwPD1iebf5zHgjRsUnrU3iQgswySXeu6PK7eL4":0,
        "5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9":38900,
        "5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":12334,
        "5CUUuCwJbXo8jVJQW21huCFWtBrg2K61wbZBiyGP3V7ZC4Ko":0,
    };
    const auth_protocol={"type":"data","fmt":"json"};
    list.push({name:auth_anchor,raw:auth_raw,protocol:auth_protocol});

    //const auth_anchor_2="cpx_auth";
    const auth_raw_2={
        "5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":0,
    };
    const auth_protocol_2={"type":"data","fmt":"json"};
    list.push({name:auth_anchor,raw:auth_raw_2,protocol:auth_protocol_2});


    const hide_anchor="cpx_hide";
    const hide_raw=[33,44];
    const hide_protocol={"type":"data","fmt":"json"};
    list.push({name:hide_anchor,raw:hide_raw,protocol:hide_protocol});

    
    self.multi(list,()=>{
        anchorJS.owner(basic_anchor,(owner,block)=>{
            const alist=[];

            const hide_anchor="cpx_hide";
            const hide_raw=[block];
            const hide_protocol={"type":"data","fmt":"json"};
            alist.push({name:hide_anchor,raw:hide_raw,protocol:hide_protocol});

            self.multi(alist,()=>{
                const end=self.stamp();
                console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
                return ck && ck();
            },index,pair);
        });
        
    },index,pair);
}


function write_full_parameters_anchor_sample(index,ck){
    const start=self.stamp();
    const seed='Dave';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Write the target hide data by ${seed}`);

    const list=[];

    //logical
    //1.write `full_app` twice
    //2.hide anchor `full_hide` to hide the latest `full_app`, ver '1.0.8' will be loaded.
    //3.auth anchor `full_auth` write three times, and set hide anchor `auth_hide` to hide the second `full_auth`
    //4.complex lib ref.

    //1.write app twice
    const anchor="full_app";
    const raw="This is a complex cApp anchor "+self.randomData();
    const protocol={
        "type":"app",
        "fmt":"js",
        "auth":"full_auth",
        "hide":"full_hide",
        "lib":["js_a","jquery"],
        "ver":"1.0.8",
    };
    list.push({name:anchor,raw:raw,protocol:protocol});

    const protocol_2={
        "type":"app",
        "fmt":"js",
        "auth":"full_auth",
        "hide":"full_hide",
        "lib":["js_a","jquery"],
        "ver":"1.1.0",
    };
    list.push({name:anchor,raw:raw,protocol:protocol_2});

    //2.write auth anchor three times.
    const auth_anchor="full_auth";
    const auth_protocol={"type":"data","fmt":"json"};
    const auth_raw_1={
        "5DtBERu7U1SwPD1iebf5zHgjRsUnrU3iQgswySXeu6PK7eL4":0,
    };
    const auth_raw_2={
        "5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":0,
        "5CUUuCwJbXo8jVJQW21huCFWtBrg2K61wbZBiyGP3V7ZC4Ko":0,
    };
    const auth_raw_3={
        "5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9":0,
    };
    list.push({name:auth_anchor,raw:auth_raw_1,protocol:auth_protocol});
    list.push({name:auth_anchor,raw:auth_raw_2,protocol:auth_protocol});
    const auth_protocol_1={"type":"data","fmt":"json","hide":"auth_hide"};
    list.push({name:auth_anchor,raw:auth_raw_3,protocol:auth_protocol_1});


    self.multi(list,()=>{
        anchorJS.history(auth_anchor,(history_auth)=>{
            anchorJS.history(anchor,(history_app)=>{
                const alist=[];

                //3.hide the latest app anchor
                const block=history_app[0].block;
                const hide_anchor="full_hide";
                const hide_raw=[block];
                const hide_protocol={"type":"data","fmt":"json"};
                alist.push({name:hide_anchor,raw:hide_raw,protocol:hide_protocol});

                //4.hide the second auth anchor
                const auth_block=history_auth[1].block;
                const h_anchor="auth_hide";
                const h_raw=[auth_block];
                const h_protocol={"type":"data","fmt":"json"};
                alist.push({name:h_anchor,raw:h_raw,protocol:h_protocol});


                self.multi(alist,()=>{
                    const end=self.stamp();
                    console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
                    return ck && ck();
                },index,pair);
            });
        });
    },index,pair);
}

function write_full_parameters_caller_sample(index,ck){
    const start=self.stamp();
    const seed='Charlie';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Write the target hide data by ${seed}`);

    const list=[];

    //1.write `full_caller` three times
    //2.hide anchor `call_hide` to hide the latest and second `full_caller` 
    //3.auth anchor `call_auth` write three times, and set hide anchor `call_auth_hide` to hide the second `call_auth`
    //4.call the complex cApp `full_anchor`

    //1.write `full_caller` three times
    const anchor="full_caller";
    const txt="This is a complex data anchor call `full_anchor` ";
    const protocol={
        "type":"data",
        "fmt":"json",
        "auth":"call_auth",
        "hide":"call_hide",
        "trust":"call_trust",
        "call":"full_app",
        "args":"page=3&cat=6&tpl=dark",
    };
    list.push({name:anchor,raw:txt+self.randomData(),protocol:protocol});
    list.push({name:anchor,raw:txt+self.randomData(),protocol:protocol});
    list.push({name:anchor,raw:txt+self.randomData(),protocol:protocol});

    const auth_anchor="call_auth";
    const auth_protocol={"type":"data","fmt":"json"};
    const auth_raw_1={
        "5CUUuCwJbXo8jVJQW21huCFWtBrg2K61wbZBiyGP3V7ZC4Ko":34567,
        "5DtBERu7U1SwPD1iebf5zHgjRsUnrU3iQgswySXeu6PK7eL4":34568,
    };
    const auth_raw_2={
        "5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":0,
        "5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9":3456,
    };
    const auth_raw_3={
        "5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9":0,
        "5CUUuCwJbXo8jVJQW21huCFWtBrg2K61wbZBiyGP3V7ZC4Ko":0,
        "5DtBERu7U1SwPD1iebf5zHgjRsUnrU3iQgswySXeu6PK7eL4":0,
    };
    list.push({name:auth_anchor,raw:auth_raw_1,protocol:auth_protocol});
    list.push({name:auth_anchor,raw:auth_raw_2,protocol:auth_protocol});
    const auth_protocol_1={"type":"data","fmt":"json","hide":"call_auth_hide"};
    list.push({name:auth_anchor,raw:auth_raw_3,protocol:auth_protocol_1});

    const trust_anchor="call_trust";
    const trust_raw={
        "hello":0,
        "world":355667,
        "cycle":678776,
    };
    const trust_protocol={"type":"data","fmt":"json"};
    list.push({name:trust_anchor,raw:trust_raw,protocol:trust_protocol});

    self.multi(list,()=>{
        anchorJS.history(auth_anchor,(history_auth)=>{
            anchorJS.history(anchor,(history_app)=>{
                const alist=[];

                //3.hide the latest app anchor
                const block_1=history_app[0].block;
                const block_2=history_app[1].block;
                const hide_anchor="call_hide";
                const hide_raw=[block_1,block_2];
                const hide_protocol={"type":"data","fmt":"json"};
                alist.push({name:hide_anchor,raw:hide_raw,protocol:hide_protocol});

                //4.hide the second auth anchor
                const auth_block=history_auth[1].block;
                const h_anchor="call_auth_hide";
                const h_raw=[auth_block];
                const h_protocol={"type":"data","fmt":"json"};
                alist.push({name:h_anchor,raw:h_raw,protocol:h_protocol});

                self.multi(alist,()=>{
                    const end=self.stamp();
                    console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
                    return ck && ck();
                },index,pair);
            });
        });
    },index,pair);
}

function framework(index,ck){
    const start=self.stamp();
    const seed='Charlie';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Write the target hide data by ${seed}`);

    const list=[];
    const direct_anchor="full_param";
    const direct_raw="This is the complext cApp anchor "+self.randomData();
    const direct_protocol={"type":"app","fmt":"json","auth":{"5GWBZheNpuLXoJh3UxXwm5TFrGL2EHHusv33VwsYnmULdDHm":0}};
    list.push({name:direct_anchor,raw:direct_raw,protocol:direct_protocol});

    self.multi(list,()=>{
        const end=self.stamp();
        console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
        return ck && ck();
    },index,pair);
}