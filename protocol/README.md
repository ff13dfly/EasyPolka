# Easy Protocol

## Overview

* `Easy Protocol` is teh recommend `cApp` ( Chain Application ) protocol. It is a JSON based protocol, now `version 1.0`.

* You can get all details via the [Easy Protocol](Easy_Protocol_v1.0.md).

## Test

* TS file need to compile to JS file, then run via Node.js.

    ```SHELL
        # install TS support
        npm i -D typescript

        # compile ts file by skipping the library
        npx tsc ${sample}.ts --skipLibCheck

        # run the compiled file
        node ${sample}.js

        # types error command
        npm i --save-dev @types/node
    ```

### Anchor Link Decode

### Chain Application Launch

```javascript
    const cApp = new Function("agent", "con", "error", raw);
    cApp(RPC, "container", code.failed ? code.failed : null);
```

### Sample

* Basic cApp code

    ```JAVASCRIPT
        new Function(
            "container",    //container dom ID
            "API",          //API can be used by cApp
            "args",         //arguments from raw anchor|anchor linker
            "from",         //if is called, the origin call anchor linker
            "error",        //error message need to sent to cApp
            code,           //cApp code string
        );

        //definition to check
        export type easyResult={
            app:Function|null;      //cApp function, if from the data type anchor, will load target cApp
            raw:String|null;        //if cApp is not JS, leave the raw data here.
            parameter:string[];     //running parameters, from anchor link parameter
            error:errorObject[];    //errors when loading cApp
            from?:anchorObject;     //if the cApp is called from a data anchor

            //parameters from launcher
            API:APIObject;          //APIs can be sent to cApp
            nodeJS:boolean;         //wether the nodeJS
            back?:string[];         //parameter when callback
        }
    ```

* Demo cApp code.

    ```JSON
        {
            "name":"entry_app",
            "raw":"console.log(container);console.log(from);console.log(args);console.log(arguments);",
            "protocol":{
                "type":"app",
                "fmt":"js",
                "ver":"1.0.0",
            }
        }
    ```

* Launch from `data` type anchor.

    ```JSON
        {
            "name":"data_caller",
            "raw":{
                "content":"this is from key raw",
                "footer":"foot content",
            },
            "protocol":{
                "type":"data",
                "fmt":"json",
                "call":"entry_app",
                "args":"id=12&title=hello",
            }
        }
    ```
