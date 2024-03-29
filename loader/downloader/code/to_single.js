//!important, Package index.html and loader.min.js together

//########## USEAGE ##########
//node to_single.js

const fs=require('fs');
const file={
    read:(target,ck,toJSON)=>{
        fs.stat(target,(err,stats)=>{
            if (err) return ck && ck({error:err});
            if(!stats.isFile()) return ck && ck(false);
            fs.readFile(target,(err,data)=>{
                if (err) return ck && ck({error:err});
                const str=data.toString();
                if(!toJSON) return ck && ck(str);
                try {
                    const json=JSON.parse(str);
                    return ck && ck(json);
                } catch (error) {
                    return ck && ck({error:'Invalid JSON file.'});
                }
            });
        });
    },
    save:(name,data,ck)=>{
        const target=`./${name}`;
        fs.writeFile(target, data,'utf8',function (err) {
            if (err) return ck && ck({error:err});
            return ck && ck();
        });
        
    },

    libs:(list,ck,txt)=>{
        if(list.length===0) return ck && ck(txt);
        if(!txt) txt=";";
        const row=list.pop();
        //console.log(row);
        file.read(row,(js)=>{
            //if(row==="code/jquery.min.js") console.log(js);
            txt+=js;
            return file.libs(list,ck,txt);
        });
    },
};

const source='code/index.html';
const target='down.html';
const source_js='code/download.min.js';
const replace_js='<script src="loader.min.js"></script>';

const ls={
    "anchorJS":"../../package/loader/anchor.loader.js",
    "Polkadot":"../../package/loader/polkadot.loader.js",
    "Easy":"../../package/loader/easy.loader.js",
}


file.read(source,(txt)=>{
    txt=txt.replace(replace_js,"");
    //txt=txt.replace('</html>',"");
    for(var k in ls){
        var row=`<script src="../${ls[k]}"></script>`;
        txt=txt.replace(row,"");
    }
    
    const list=[];
    for(var k in ls)list.push(ls[k]);

    //deal with jquery
    txt=txt.replace(`<script src="jquery.min.js"></script>`,"");
    list.push('code/jquery.min.js');
    txt=txt.replace(`<script src="download.min.js"></script>`,"");

    file.libs(list,(code)=>{
        file.read(source_js,(js)=>{
            //const result=`${txt}<script>${code}${js}</script>`;
            const result=txt.replace("</style>",`</style><script>${code}${js}</script>`);
            file.save(target,result,()=>{
                console.log('\x1b[36m%s\x1b[0m',`\nDone! Minified file is "${target}"\n`);
            });
        });
    });
    
});