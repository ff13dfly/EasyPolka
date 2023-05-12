# Package

- Javacript libraries, `esbuild` is needed to package.

    ```BASH
        # install 
        yarn add esbuld
    ```

## Loader

- JS package for loader, the global name is different from library on chain.

    1. @Polkadot/API

        ```BASH
            # API install, if not exsist
            yarn add @polkadot/api

            # Polkadot API package
            ./node_modules/esbuild/bin/esbuild node_modules/@polkadot/api/index.js --bundle --minify --outfile=./loader/polkadot.loader.js --global-name=LP
        ```

    2. anchor.js

        ```BASH
            # Anchor.js SDK package
            ./node_modules/esbuild/bin/esbuild ../anchorJS/publish/anchor.js --bundle --minify --outfile=./loader/anchor.loader.js --global-name=LA
        ```

    3. Easy Protocol ( v1 )

        ```BASH
            # Easy Protocol ( v1 ) package
            ./node_modules/esbuild/bin/esbuild ../protocol/src/interpreter.js --bundle --minify --outfile=./loader/easy.loader.js --global-name=LE
        ```

## Frontend

- JS package for frontend, this package is the on-chain one.

    1. @Polkadot/API

        ```BASH
            # API install, if not exsist
            yarn add @polkadot/api

            # Polkadot API package
            ./node_modules/esbuild/bin/esbuild node_modules/@polkadot/api/index.js --bundle --minify --outfile=./frontend/polkadot.min.js --global-name=Polkadot
        ```

    2. anchor.js

        ```BASH
            # Anchor.js SDK package
            ./node_modules/esbuild/bin/esbuild ../anchorJS/publish/anchor.js --bundle --minify --outfile=./frontend/anchor.min.js --global-name=AnchorJS
        ```

    3. Easy Protocol ( v1 )

        ```BASH
            # Easy Protocol ( v1 ) package
            ./node_modules/esbuild/bin/esbuild ../protocol/src/interpreter.js --bundle --minify --outfile=./frontend/easy.min.js --global-name=Easy
        ```

## Node.js

- JS package for node.js, this package is the on-chain one.

    1. @polkadot/api

        ```BASH
            # API install, if not exsist
            yarn add @polkadot/api

            # Polkadot API package
            ./node_modules/esbuild/bin/esbuild node_modules/@polkadot/api/index.js --bundle --minify --outfile=./node/polkadot.node.js --platform=node
        ```

    2. anchor.js

        ```BASH
            # anchor.js package
            ./node_modules/esbuild/bin/esbuild ../anchorJS/publish/anchor.js --bundle --minify --outfile=./node/anchor.node.js --platform=node
        ```

    3. Easy Protocol ( v1 )

        ```BASH
            # Easy Protocol ( v1 ) package
            ./node_modules/esbuild/bin/esbuild ../protocol/src/interpreter.js --bundle --minify --outfile=./node/easy.node.js --platform=node
        ```

- How to load from Anchor. Copy the code to run, or get it [demo_require.js](test/demo_require.js) here directly.

    ```Javascript
        //!important This is a demo to show how to load node.js lib via string way.

        // The mock function
        const fun_mock=(name)=>{
            console.log("hello,"+name);
        };

        // The code string, mock the Anchor raw data. 
        const code='exports.hello=(name)=>{console.log("hello,"+name);}';

        // "eval" is used here, so "try".
        try {
            const fun = eval(code);
            fun_mock("raw function");
            fun("require function");
            
        } catch (error) {
            console.log(error);
        }

        //run by node.js, the result should be.
        /*
        Bash> hello,raw function
        Bash> hello,require function
        */
    ```
