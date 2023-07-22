# React Convertor

## Overview

- This convertor can deploy React application on Anchor Network. Then the React application can be run by Loader.

- Be careful, all resouce will be deployed on chain, your account need to have enough coins.

## Usage

- NodeJS is required, please install it first.

    ```Shell
        node converter_react_v3.js package/config_homepage.json 
    ```

## Setting

- The sample as follow.

    ```Javascript
        {  
            "name":"react_demo",                        //anchor name will deploy
            "framework":"frame_react.js",               //
            "version":"1.0.2",                          //application version.
            "related":{
                "js":"home_js",                         //Anchor name of related JS
                "css":"home_css",                       //Anchor name of related CSS
                "resource":"home_res"                   //Anchor name of related resource, controlled by `dep`
            },
            "directory":"package/homepage",             //the build react project folder path
            "asset":"asset-manifest.json",              //React asset file
            "globalVars":["Polkadot","AnchorJS","Easy"],//related on-chain libs
            "blockmax":3000000,                         //max length of dividing resource
            "ignor":{                                   //React framework files to ignore
                "files":{
                    "asset-manifest.json":true,
                    "favicon.ico":true,
                    "index.html":true,
                    "manifest.json":true,
                    "logo192.png":true,
                    "logo512.png":true,
                    "robots.txt":true,
                    ".DS_Store":true                    //Mac cache file
                },
                "folder":{
                    "js":true,
                    "css":true
                },
                "system":{
                    ".DS_Store":true                    //Mac cache file
                }
            },
            "server":"ws://127.0.0.1:9944",             //The Anchor Network node to link
            "account":{
                "seed":"Alice"                          //Seed to deploy, normally for dev network
                "password":"",                          //The password for encry JSON file 
                "file":"",                              //The encry JSON file
            }
        }
    ```

- The convertor will be out of time, if the React updated. Please check the version, be careful, or will waste your coins.
