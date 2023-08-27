# Anchor Network Loader

## Overview

- Loader is the entry application to load data or application on `Anchor Network`. It is the off-chain part, can run from local. You can treat is as BIOS to the computer.

- Requirement. These libraries is packaged to the release files.

    1. @polkadot/api, the officail API lib to access substrate node.
    2. anchor.js, the officail API to access Anchor node.
    3. easy.js, the implement of Easy Protocol ( v1 ).

- Loader is minified to avoid modifying easily. It can accept limied parameters.

    1. Frontend, decode location *hash* and *search* to load target Anchor.
    2. Node.JS, node.js call the loader and the called **Anchor Link**.

## Frontend

- This implement of loader is to load applications which can run on browser enviment. The latest version is [release/loader.web.html](release/loader.web.html).

- Frontend loader decodes URL hash to get the `Anchor` name and node to link. By defalt, the Anchor is "plinth" and the node is "ws://127.0.0.1:9944".

    ```SHELL
        # way 1: wrapper the "Anchor Name" with "#"
        loader.web.html#anchor_name#

        # way 2: use "Anchor Link" as hash
        loader.web.html#anchor://anchor_name
        loader.web.html#anchor://anchor_name/3334|good@wss://dev.metanchor.net

        # way 3: decode html search
        loader.web.html?anchor=anchor_name&block=3334&key=good&node=wss://dev.metanchor.net&network=anchor
    ```

- Parameters, which can be sent to application. The applications can decode the location themselves to act properly.

## Backend

- This implement of loader is to load applications which can run on `node.js` enviment. The latest version is [release/loader.nodejs.js](release/loader.nodejs.js).

- Backend loader relies on `node` to input the parameters.

    ```BASH
        # node loader_nodejs.min.js [anchor link]
        node loader.nodejs.js anchor://node_me/
    ```

- Run Gateway system

    ```BASH
        # node loader_nodejs.min.js [anchor link] [node]
        node loader.nodejs.js anchor://gateway_hub/ 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw 8001
        node loader.nodejs.js anchor://vs_test/ 5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw 4405
    ```

## Downloader

- **Downloader** is an application which can combine the Anchor data to be a single file by following **Easy Protocol**.

- **Downloader** treats the locaction hash as **Anchor Name**. The sample as follow.

    ```Shell
        # hash as the Anchor name
        downloader.html#anchor_name
    ```
