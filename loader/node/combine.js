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
    getLibs:(list,ck,code)=>{
        if(!code) code="";
        if(list.length===0) return ck && ck(code);
        const row=list.pop();
        file.read(row,(res)=>{
            code+=res;
            return self.getLibs(list,ck,code);
        });
    },
}

const folder="lib";
const libs=[
    "polkadot.min.js",
    "anchor.min.js",
    "easy.min.js",
];
const runner="runner.min.js";
const target="nodeJS_loader.min.js";

//1.get the libs code
const list=[];
for(let i=0;i<libs.length;i++){
    const row=libs[i];
    list.push(`${folder}/${row}`);
}
self.getLibs(list,(code)=>{
    
    //2.get the running code
    file.read(runner,(run)=>{
        //console.log(run);

        const str=`;(function(){${code};${run}})()`;
        file.save(target,str,(res)=>{
            if(res!==true && res.error){
                return console.log(res);
            }
            console.log(`Done! The node.js loader of Anchor Network is "${target}"`);
            console.log(`You can run the follow command to test.\n\nnode ${target} anchor://{anchor_name}\n`);
        });
    })
});

