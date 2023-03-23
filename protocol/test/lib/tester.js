const { ApiPromise, WsProvider } =require('@polkadot/api');
const { Keyring } =require('@polkadot/api');
const {anchorJS} = require('./anchor.js');

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
    //auto run entry
    auto:(list,preWorks)=>{
        self.run(list,list.length);
    },
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

    //report part
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
    prework:(list,ck)=>{
        console.log('Ready to prepare the env for testing ...');
        self.initAccounts(accounts,()=>{
            console.log('Accounts ready.');
            return ck && ck();
        });
    },
    setSummary:(name,test,intro)=>{
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
};