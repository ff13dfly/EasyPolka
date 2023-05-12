# Package

- Javacript libraries, `esbuild` is needed to package.

    ```BASH
        # install 
        yarn add esbuld
    ```

## @Polkadot/API

- Polkadot official Javascript library.

    1. Loader package

        ```BASH
            # API install
            yarn add @polkadot/api

            # change to @polkadot/api directory
            #cd node_modules/@polkadot/api

            # Polkadot API package
            node_modules/esbuild node_modules/@polkadot/api/index.js --bundle --minify --outfile=polkadot.node.js --platform=node --global-name=node_Polkadot
        ```

    2. Frontend package

        ```BASH
            #Polkadot API package
            ../node_modules/esbuild index.js --bundle --minify --outfile=polkadot.node.js --platform=node --global-name=node_Polkadot
        ```

    3. Node.js package

        ```BASH
            #Polkadot API package
            ../node_modules/esbuild index.js --bundle --minify --outfile=polkadot.node.js --platform=node --global-name=node_Polkadot
        ```

## Anchor.js

- Anchor Network access Javacript libraray.
    1. Loader package
    2. Frontend package
    3. Node.js package

    ```BASH
        #Polkadot API package
        esbuild index.js --bundle --minify --outfile=polkadot.node.js --platform=node --global-name=node_Polkadot

        #Anchor.JS package
        esbuild anchor.js --bundle --minify --outfile=anchor.node.js --platform=node --global-name=node_anchorJS
    ```

## Easy.js

- Easy Protocol ( v1.0 ) Javacript libraray.
    1. Loader package
    2. Frontend package
    3. Node.js package