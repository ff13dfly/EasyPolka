//!important, This is the transformer of React object.
//!important, By dealing with the built package, React project can be deployed to Anchor Network

//node transform_react.js demo_anchor ws://127.0.0.1:9944 build
//node transform_react.js demo_anchor ws://127.0.0.1:9944 
//node transform_react.js demo_anchor

//node transform_react.js xconfig.json package password_for_account
//node transform_react.js xconfig.json package
//node transform_react.js xconfig.json

//!important, React Setting Needed.

const fs=require('fs');

//basic config for Loader
const config = {
    error:      '\x1b[36m%s\x1b[0m',
    success:    '\x1b[36m%s\x1b[0m',
    setting:    'xconfig.json',
    folder:     'package',                //default project folder
};

//arguments
const args = process.argv.slice(2);
const cfgFile=!args[0]?config.setting:args[0];
const folder=!args[1]?config.folder:args[1];

//const folder=!args[2]?config.target:args[2];
//const server=!args[1]?"ws://127.0.0.1:9944":args[1];

// file reader
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
}

file.read(cfgFile,(config)=>{
    console.log(config);
    const target=`${folder}/asset-manifest.json`;
    file.read(target,(react)=>{
        if(react.error) return console.log(`Can not load "asset-manifest.json".`);
        console.log(react);
        
        //1.treated the main.********.js as lib
        const js_lib=``;
        const protocol_js={
            "type": "lib",
            "fmt": "js",
            "ver":"0.0.1",
        }
        //2.treated the main.********.css as lib
        const css_lib=``;
        const protocol_css={
            "type": "lib",
            "fmt": "css",
            "ver":"0.0.1",
        }

        //3.create the load cApp
        const protocol={
            "type": "app",
            "fmt": "js",
            "lib":[js_lib,css_lib],
            "ver":"0.0.1",
        }
    },true);
},true);
