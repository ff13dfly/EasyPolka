//!important, This is a application to combine the backend loader.

//########## USEAGE ##########
//node combine.js

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
        file.read(row.file,(res)=>{
            map[row.name]=res;
            return self.getLibs(list,ck,map);
        });
    },
}

const folder="../../package/node/";
const libs={
    "easy":"easy.node.js",
    "anchor":"anchor.node.js", 
    "polkadot":"polkadot.node.js",
}
const runner="runner.min.js";
const target="loader.nodejs.min.js";

//1.get the libs code
const list=[];
for(let k in libs){
    const row=libs[k];
    list.push({file:`${folder}/${row}`,name:k});
}

file.read(runner,(run)=>{
    self.getLibs(list,(codes)=>{
        let final=run.replaceAll("../../../package/node/","");
        //console.log(final);
        const pre='whynodejs',suffix='nodeme';
        for(var k in codes){
            final=final.replace(`require("${k}.node.js")`,`${pre}${k}${suffix}`);
            const str=`(function(){${codes[k]};return module.exports;})()`;
            
            const replace=`${pre}${k}${suffix}`;
            console.log(replace);
            console.log(str.length);
            final=final.replaceAll(replace,str);

            // const reg=new RegExp(`${pre}${k}${suffix}`,"g");
            // console.log(reg);
            // final.replace(reg,str);
        }
        //console.log(final);
        file.save(target,final,(res)=>{
            console.log(`Done! The node.js loader of Anchor Network is "${target}"`);
            console.log(`You can run the follow command to test.\n\nnode ${target} anchor://{anchor_name}\n`);
        });
    });
});