# Easy Protocol

## Overview

Recommand cApp protocol. It is a JSON based protocol, now `version 1.0`.

## Details

### Anchor link

### Protocol Check

The reversed keyword `type` is treated as the start of `Easy Protocol`, when the `protocol` data is a JSON string and the keyword is one of the JSON key. Then it is a `Easy Protocol` anchor.

![Easy Protocol Decode Map](../images/on_chain_linked_list.png)

### Reversed Keywords List

### cApp Lancher

## Test

- TS file need to compile to JS file, then run via Node.js.

    ```SHELL
        # install TS support
        npm i -D typescript

        # compile ts file
        npx tsc ${sample}.ts

        # run the compiled file
        node ${sample}.js
    ```

### Anchor Link Decode

### Chain Application Launch

```javascript
    const cApp = new Function("agent", "con", "error", raw);
    cApp(RPC, "container", code.failed ? code.failed : null);
```

### Hide Target Anchor History

- If there is `hide` keyword in protocol, will check the target anchor `hide`.
- If theer is `salt` keyword in protocol, will check the target `md5( anchor + salt[1] )` to check hide block list.
- No special setting, will check the default hide anchor `md5(anchor)`.

### Authrity of Anchor

- If there is `auth` keyword in protocol, will check the target anchor `auth`.
- If theer is `salt` keyword in protocol, will check the target `md5( anchor + salt[0] )` to check authority list.
- No special setting, will check the default authority anchor `md5(anchor)`.

### Sample

- Basic cApp code

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
        export type cAppResult={
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

- Demo cApp code.

    ```JSON
        {
            "name":"entry_app",
            "raw":"console.log(container);console.log(from);console.log(args);",
            "protocol":{
                "type":"app",
                "fmt":"js",
                "ver":"1.0.0",
            }
        }
    ```

- Launch from `data` type anchor.

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
