const fs=require('fs');
const file={
    read:(target,ck,toJSON,toBase64)=>{
        fs.stat(target,(err,stats)=>{
            if (err) return ck && ck({error:err});
            if(!stats.isFile()) return ck && ck(false);
            fs.readFile(target,(err,data)=>{
                if (err) return ck && ck({error:err});
                if(toBase64) return ck && ck(data.toString("base64"));
                if(!toJSON) return ck && ck(data.toString());
                try {
                    const str=data.toString();
                    const json=JSON.parse(str);
                    return ck && ck(json);
                } catch (error) {
                    return ck && ck({error:'Invalid JSON file.'});
                }
            });
        });
    },
};

const target='demo/hub.min.js';
//const target='demo/koa.min.js';
file.read(target,(code)=>{
    //way 1, eval the code
    const str=`(function(){${code};return module.exports;})()`;
    eval(str);

    //way 2, convert to a function
    // const cApp = new Function(str);
    // cApp();
});