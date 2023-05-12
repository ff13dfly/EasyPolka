//!important This is the file to create the mock complex data.
//!important This JS can be run many times, the anchor data will be updated, but still can work.

//#run this mock.
//node test_mock_data.js

const { ApiPromise, WsProvider } =require('@polkadot/api');
const { Keyring } =require('@polkadot/api');
const anchorJS = require('../../package/node/anchor.node');
const {easyRun} = require('../../package/node/easy.node');
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

const API={
    common:{
        "latest":anchorJS.latest,
        "target":anchorJS.target,
        "history":anchorJS.history,
        "owner":anchorJS.owner,
        "subcribe":anchorJS.subcribe,
        "block":anchorJS.block,
    }
};

const task=[
    single_full_and_hide,
];
self.auto(task);


//`hide`,`auth`,`trust` are all related to anchor.
function single_full_and_hide(index,ck){
    const start=self.stamp();
    const seed='Alice';
    const ks = new Keyring({ type: 'sr25519' });
    const pair= ks.addFromUri(`//${seed}`);

    console.log(config.color,`[${index}] ${start} Hide by protocol directly ${seed}`);

    const list=[];

    //1.related anchor names;
    const anchor_auth=`auth_${self.randomData(2)}`;
    const anchor_hide=`hide_${self.randomData(2)}`;
    const anchor_trust=`trust_${self.randomData(2)}`;

    const auth_hide=`auth_hide_${self.randomData(2)}`;
    const trust_hide=`trust_hide_${self.randomData(2)}`;

    //2.entry anchor data
    const anchor=`single_${self.randomData()}`;
    const txt=`This mock data to test extend. Anchor: ${anchor}, Random: `;
    const protocol_data={
        "type":"data",
        "fmt":"json"
    };
    const protocol_2={
        "type":"data",
        "fmt":"json",
        "auth":anchor_auth,
        "trust":anchor_trust,
    };

    const protocol_3={
        "type":"data",
        "fmt":"json",
        "auth":anchor_auth,
        "hide":anchor_hide,
        "trust":anchor_trust,
    };

    list.push({name:anchor,raw:txt+self.randomData(),protocol:protocol_data});
    list.push({name:anchor,raw:txt+self.randomData(),protocol:protocol_2});
    list.push({name:anchor,raw:txt+self.randomData(),protocol:protocol_3});
    list.push({name:anchor,raw:txt+self.randomData(),protocol:protocol_3}); //hide

    //3.auth anchor data
    const raw_auth_1={
        "5CkLxxzqKs9uHhX8EWpJJRoCTcJD6ErTyEvad8nbVsTFS6gt":0,
        "5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw":12345,
        "5CUUuCwJbXo8jVJQW21huCFWtBrg2K61wbZBiyGP3V7ZC4Ko":12345,
        "5D9wRNdJZ814ZQ3FrWJ9PXZnWQ3sDbLdbW3PT9Z3fekfi5wT":0,
        "5DAkxQvZ9JQUfZtHjYV6MbcZFvuHHBzN8HQ69xuyDUFfxwGK":0,
        "5DcpcBu1J4qpQRkeFy6Qcn9FxUm6knhvufnYpX62oHH1zWCx":0,
        "5DkpkKRiAqgrTt925fQ6jRZymhUFN52EpnskuHobaYKBqJ26":0,
    }
    const raw_auth_2={
        "5Dt3Diu9becXCqtY2nYucE7DYRaWb7a8V73xuphWeB7MbLVq":0,
        "5DtBERu7U1SwPD1iebf5zHgjRsUnrU3iQgswySXeu6PK7eL4":0,
        "5ECZb1Jmm8ACGXdXtBx9AbqspK2ECQ1QNnXqH9FiGLEEjJjV":0,
    }
    const raw_auth_3={  //hide
        "5EJ7xPwx9MGaqsuTBanT7kde6r5fJfSUenf9qFnGYkMNcyn9":0,
        "5FHKmzFC3mDwG7pJKrBZqRWscV9E8hZDfer6aAG17VhQGuXB":0,
        "5G4NYSSkwk4hk13QYa5GvxogaeNnjA8qaXBqLk9BvxYXJvaW":0,
        "5GhU2JnMPGCNnoLbZmJBvrkGcVPm9AkzFUea4f99sHNa39jm":0,
    }
    const raw_auth_4={  //hide
        "5Gk5U5qbYbMuvxttahwMQeYesfWKf9JXLzqgKuVjZHLeYP74":0,
        "5GnaMMdmqFrUWpDsiC2FXotJ4cwnQcMDKCnygo8CviDGDsHd":0,
    }
    const raw_auth_5={
        "5G4NYSSkwk4hk13QYa5GvxogaeNnjA8qaXBqLk9BvxYXJvaW":999999,
        "5GhU2JnMPGCNnoLbZmJBvrkGcVPm9AkzFUea4f99sHNa39jm":999999,
    }

    const p_hide_1={
        "type":"data",
        "fmt":"json",
        "hide":auth_hide,
    }
    

    list.push({name:anchor_auth,raw:raw_auth_1,protocol:protocol_data});
    list.push({name:anchor_auth,raw:raw_auth_2,protocol:protocol_data});
    list.push({name:anchor_auth,raw:raw_auth_3,protocol:protocol_data});    //hide
    list.push({name:anchor_auth,raw:raw_auth_4,protocol:protocol_data});    //hide
    list.push({name:anchor_auth,raw:raw_auth_5,protocol:p_hide_1});

    //4.trust anchor data
    const raw_trust_1={
        "mock_01":0,
        "mock_02":12345,
        "mock_03":12345,
        "mock_04":12345,
        "mock_05":12345,
        "mock_06":12345,
        "mock_07":12345,
    }

    const raw_trust_2={     //hide
        "really_01":0,
        "really_02":12345,
        "really_03":12345,
        "really_04":12345,
        "really_05":12345,
    }

    const raw_trust_3={
        "last_01":0,
        "last_02":12345,
        "last_03":12345,
        "last_04":12345,
        "last_05":12345,
    }

    const p_hide_2={
        "type":"data",
        "fmt":"json",
        "hide":trust_hide,
    }
    list.push({name:anchor_trust,raw:raw_trust_1,protocol:protocol_data});
    list.push({name:anchor_trust,raw:raw_trust_2,protocol:protocol_data});      //hide
    list.push({name:anchor_trust,raw:raw_trust_3,protocol:p_hide_2});

    self.multi(list,()=>{
        anchorJS.history(anchor,(history)=>{
            anchorJS.history(anchor_auth,(auth_history)=>{
                anchorJS.history(anchor_trust,(trust_history)=>{
                    const alist=[];
                    
                    //5.1. entry anchor hide list anchor.
                    const raw_hide_entry=[history[0].block];
                    alist.push({name:anchor_hide,raw:raw_hide_entry,protocol:protocol_data});

                    //5.2. auth anchor hide list anchor.
                    const raw_hide_auth=[auth_history[1].block,auth_history[2].block];
                    alist.push({name:auth_hide,raw:raw_hide_auth,protocol:protocol_data});

                    //5.3. trust anchor hide list anchor.
                    const raw_hide_trust=[trust_history[1].block];
                    alist.push({name:trust_hide,raw:raw_hide_trust,protocol:protocol_data});

                    self.multi(alist,()=>{
                        const block=history[0].block;
                        const linker=`anchor://${anchor}/${block}`;

                        easyRun(linker,API,(result)=>{
                            console.log(`-----------------result-----------------`);
                            console.log(JSON.stringify(result));

                            const end=self.stamp();
                            console.log(config.color,`[${index}] ${end}, cost: ${end-start} ms \n ------------------------------`);
                            return ck && ck();
                        });
                    },index,pair);
                });
            });
        });
    },index,pair);
}