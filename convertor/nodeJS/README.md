# NodeJS Application Convertor

## Overview

- A tool to convert `NodeJS` application to `Anchor Application`.


## Requirement

- NodeJS
- Esbuild
- Anchor Network

## How To

- Two steps to create `Anchor Application` from normal NodeJS application.
    1. Compile the code to sinlge file by `Esbuild`.
    2. Run `Convertor` to deal with the code and write to `Anchor Network`.

### Config

    ```Javascript
    {
        "name":"node_test",
        "version":"1.0.0",
        "autowrite":true,
        "libs":{
            "koa":{
                "file":"../../../package/node/koa.node", 
                "anchor":"node_koa"
            },
            "koa-router":{
                "file":"../../../package/node/koa-router.node",
                "anchor":"node_koa_router"
            }
        },
        "account":{
            "seed":"",
            "address":"",
            "password":""
        }
    }
    ```

### Library

## Parameteres
