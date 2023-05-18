# Package

- Javacript libraries, `esbuild` is needed to package.

    ```BASH
        # install 
        yarn add esbuld
    ```

## Loader

- JS package for loader, the global name is different from library on chain.

    1. @Polkadot/API, only `ApiPromise` and `WsProvider` are needed.

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

    1. @polkadot/api, official JS SDK for Substrate node.

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

    3. Easy Protocol ( v1 ). For the `Typescript` is not compiled to `modules.exports`, need to modify the compiled JS file.

        ```JAVASCRIPT
            //This is the exports, so can not rewrite the module.exports
            exports.easyRun = final_run;

            //modify the above line as follow
            module.exports={easyRun:final_run};
        ```

        ```BASH
            # Easy Protocol ( v1 ) package
            ./node_modules/esbuild/bin/esbuild ../protocol/src/interpreter.js --bundle --minify --outfile=./node/easy.node.js --platform=node
        ```

    4. koa.js, http server framework.

        ```BASH
            #insatll needed package
            npm install koa
            npm install koa-router
            npm install koa-jwt
            npm install koa-helmet

            # koa package
            ./node_modules/esbuild/bin/esbuild node_modules/koa/lib/application.js --bundle --minify --outfile=./node/koa.node.js --platform=node

            # koa-router package
            ./node_modules/esbuild/bin/esbuild node_modules/koa-router/lib/router.js --bundle --minify --outfile=./node/koa-router.node.js --platform=node

            # koa-jwt package
            ./node_modules/esbuild/bin/esbuild node_modules/koa-jwt/lib/index.js --bundle --minify --outfile=./node/koa-jwt.node.js --platform=node

            # koa-helmet package
            #./node_modules/esbuild/bin/esbuild node_modules/koa-jwt/lib/index.js --bundle --minify --outfile=./node/koa-jwt.node.js --platform=node
        ```

    5. Moleculer. Mircoservice framework. ( Remove, not pure JS, need bin support event_loop_stats )

        ```BASH
            # Get moleculer resource
            git clone https://github.com/moleculerjs/moleculer
            cd moleculer

            # install the necessary library
            yarn install

            # install the Esbuild
            yarn add esbuild

            # minify the package
            node_modules/esbuild/bin/esbuild index.js --bundle --minify --outfile=./node/moleculer.node.js --platform=node
        ```

- How to load from Anchor. Copy the code to run, or get it [demo_require.js](test/demo_require.js) here directly.

    ```Javascript
        //This `module.exports` will return from the function, isolate the different modules
        const obj=(function(){
            /* Minified module code here */
            return module.exports;
        })();
    ```