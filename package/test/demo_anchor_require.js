//!important, this is the demo of loading node.js lib from anchor

const fs=require('fs');
const file={
    read:(target,ck,)=>{
        fs.stat(target,(err,stats)=>{
            if (err) return ck && ck({error:err});
            if(!stats.isFile()) return ck && ck(false);
            fs.readFile(target,(err,data)=>{
                if (err) return ck && ck({error:err});
                return ck && ck(data.toString());
            });
        });
    },
};

const str=`const SDK=require('../node/anchor.node.js')`;

const target='../node/anchor.node.js';
//const target='../node/polkadot.node.js';
//const target='../node/easy.node.js';
file.read(target,(code)=>{
    //const res=eval(code);
    //console.log(res);
    eval(code);
    const fun=module.exports;
    console.log(fun);

    // const final=str.replace("require('../node/anchor.node.js')",'eval(`'+code+'`)')
    // console.log(final);
    // eval(final);
    // console.log(SDK);
});