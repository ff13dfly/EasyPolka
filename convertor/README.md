# Convertor

## Overview

- Convertor tools can help you to deploy the project without coding, just modify the config file.

- It is follow the Easy Protocol.

## Front-end

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

    ```Shell
        node converter_react_v3.js package/config_homepage.json
    ```

### Vue

### Normal Web Application

## Back-end

### Node.js
