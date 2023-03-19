const { ApiPromise, WsProvider } =require('@polkadot/api');
const { Keyring } =require('@polkadot/api');
const {anchorJS} = require('../publish/anchor.js');

const config={
    color:'\x1b[36m%s\x1b[0m',
    endpoint:"ws://127.0.0.1:9944"
};

let websocket=null;
const cache={};
const pairs=[];
const accounts=[];

let test_start=0;
let test_end=0;
const funs={};

const self={
    run:(list,count)=>{
        if(list.length===0){
            test_end=self.stamp();
            console.log(`\nStart from ${test_start}, end at ${test_end}, total cost : ${((test_end-test_start)*0.001).toFixed(3)} s.`);
            self.report();
            console.log(`\n********************End of test********************`);
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
    report:()=>{
        console.log(`\nTested Function Overview.`);
        for(let fun in funs){
            console.log(`${fun}:`);
            const list=funs[fun];
            for(let i=0;i<list.length;i++){
                const row=list[i];
                console.log(`    ${row[0]} : ${row[1]}`);
            }
        }
    },
    prework:(ck)=>{
        console.log('Ready to prepare the env for testing ...');
        self.initAccounts(accounts,()=>{
            console.log('Accounts ready.');
            return ck && ck();
        });
    },
    initAccounts:(accs,ck)=>{
        if(accs.length===0) return ck && ck();
        const account=accs.shift();
        anchorJS.load(account.encry,account.password,(res)=>{
            console.log(`Get pair from JSON encry account data. Account : ${account.encry.address}`);
            pairs.push(res);
            return self.initAccounts(accs,ck);
        });
    },
    pushFun:(name,test,intro)=>{
        if(!funs[name]) funs[name]=[];
        funs[name].push([test,intro===undefined?'':intro]);
    },
    setKV:(k,v)=>{
        cache[k]=v;
    },
    getKV:(k)=>{
        return cache[k]===undefined?null:cache[k];
    },
    stamp:()=>{
        return new Date().getTime();
    },
    getPair:(id)=>{
        if(!pairs[id]) return false;
        return pairs[id];
    },
    random:function(min, max){
        return Math.round(Math.random() * (max - min)) + min;
      },
    randomData:(len)=>{
        let str='';
        for(let i=0;i<len;i++){
            str+=Math.ceil(Math.random() * 10)-1;
        }
        return str;
    },
    auto:(list)=>{
        ApiPromise.create({ provider: new WsProvider(config.endpoint) }).then((api) => {
            console.log('Linker to substrate node created...');
            websocket=api;

            anchorJS.set(api);
            anchorJS.setKeyring(Keyring);
            self.prework(()=>{
                test_start=self.stamp();
                console.log(`\n********************Start of test********************\n`);
                self.run(list,list.length);
            });
        });
    },
};