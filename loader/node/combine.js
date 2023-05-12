//!important, This is a application to combine the backend loader.

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
    save:(name,data,ck)=>{
        fs.writeFile(name, data,'utf8',function (err) {
            if (err) return ck && ck({error:err});
            return ck && ck(true);
        });
    },
};

const self={
    getLibs:(list,ck,map)=>{
        
        if(!map) map={};
        if(list.length===0) return ck && ck(map);
        const row=list.pop();
        //console.log(row);
        //return false;
        file.read(row.file,(res)=>{
            map[row.name]=res;
            return self.getLibs(list,ck,map);
        });
    },
}

const folder="../../package/node/";
const libs={
    "Polkadot":"polkadot.node.js",
    "anchorJS":"anchor.node.js",
    "easy":"easy.node.js",
}
const runner="runner.min.js";
const target="nodeJS_loader.min.js";

//1.get the libs code
const list=[];
for(let k in libs){
    const row=libs[k];
    list.push({file:`${folder}/${row}`,name:k});
}

self.getLibs(list,(code)=>{
    //console.log(code);
    for(var k in code){
        console.log(k);
        const row=code[k];

    }

    // require("../../package/node/anchor.node")

    // try {
    //     const fun = eval(code);
    //     console.log(fun);
    // } catch (error) {
    //     console.log(error);
    // }

    //2.get the running code
    // file.read(runner,(run)=>{
    //     const str=`;(function(){${code};${run}})()`;
    //     file.save(target,str,(res)=>{
    //         if(res!==true && res.error){
    //             return console.log(res);
    //         }
    //         console.log(`Done! The node.js loader of Anchor Network is "${target}"`);
    //         console.log(`You can run the follow command to test.\n\nnode ${target} anchor://{anchor_name}\n`);
    //     });
    // })
});

