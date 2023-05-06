//!important, Package index.html and loader.min.js together

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
};

const source='index.html';
const target='loader.html';
const source_js='loader.min.js';
const replace_js='<script src="loader.min.js">';

file.read(source,(txt)=>{
    file.read(source_js,(js)=>{
        const result=txt.replace(replace_js,'<script>'+js);
        //console.log(result);
        file.save(target,result,()=>{
            console.log('Done!');
        });
    });
});