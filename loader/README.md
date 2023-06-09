# Anchor Network Loader

## Overview

- Loader is the entry application to load data or application on `Anchor Network`. It is the off-chain part, can run from local.

- Requirement. These libraries is packaged to the release files.

    1. @polkadot/api, the officail API lib to access substrate node.
    2. anchor.js, the officail API to access Anchor node.
    3. easy.js, the implement of Easy Protocol ( v1 ).

- Loader is minified to avoid modifying easily. It can accept limied parameters.

    1. Anchor name
    2. Node

## Frontend

- This implement of loader is to load applications which can run on browser enviment. The latest version is [release/loader_web.min.js](release/loader_web.min.js).

- Frontend loader decodes URL hash to get the `Anchor` name and node to link. By defalt, the Anchor is "plinth" and the node is "ws://127.0.0.1:9944".

    ```TEXT
        loader_web.min.js#ppp@ws://127.0.0.1:9944
    ```

## Backend

- This implement of loader is to load applications which can run on `node.js` enviment. The latest version is [release/loader.nodejs.js](release/loader.nodejs.js).

- Backend loader relies on `node` to input the parameters.

    ```BASH
        # node loader_nodejs.min.js [anchor link] [node]
        node loader.nodejs.js anchor://node_me/ ws://127.0.0.1:9944
    ```

- Run Gateway system

    ```BASH
        # node loader_nodejs.min.js [anchor link] [node]
        node loader.nodejs.js anchor://gateway_hub/ 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw 8001
        node loader.nodejs.js anchor://vs_test/ 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw 4405
    ```

## Converter

### React

- React is public framework to create complex application. The converter is also a bit complex, need config file to setup the details. Requirement as follow.

    1. node.js, basic enviment to run the converter.
    2. xconfig.json, the config file for React project.

- How to convert

    1. Build the react project and copy the built files to target directory, such as `package`.
    2. Run the converter. The converter will write the Anchor automatelly.

- Parameters

    ```Javascript
    {  
        "name":"plinth",                        //app name
        "version":"0.1.2",                      //app version
        "related":{                             //related anchors, will create automatelay
            "js":"p_js",
            "css":"p_css",
            "resource":"p_res"
        },
        "libs":["polkadot","anchorjs","easy"],  //support libs on chain
        "account":{

        },
        "password":"",
        "seed":""
    }
    ```

### Native
