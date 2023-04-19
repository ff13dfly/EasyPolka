# Easy Protocol

## Overview

Recommand cApp protocol.

## Details

### Anchor link

### Reversed Keywords

### cApp Lanch

## Test

- TS file need to compile to JS file, then run via Node.js.

    ```SHELL
        # install TS support
        npm i -D typescript

        # compile ts file
        npx tsc ${sample}.ts

        # ignore the lib check, or you will get a lot of message
        # npx tsc index.ts --skipLibCheck
        npx tsc ${sample}.ts --skipLibCheck

        # run the compiled file
        node ${sample}.js
    ```

- Webpack to `easy.js`, and how to use in another project.

    ```SHELL
        # install webpack support
        # https://dev.to/silvenleaf/simplest-way-to-compile-all-typescript-into-one-single-js-file-19bj
        npm i -D webpack webpack-cli typescript ts-loader

        # package to a single file
        npx webpack
    ```

    ```JSON
        //tsconfig.json, need to ignor `sample` and `test`. Or will lead to errors.
        {
            "compilerOptions": {
                "strict":true,
                "forceConsistentCasingInFileNames":true,
                "removeComments": true,
                "preserveConstEnums": true,
                "module": "AMD",
                "lib": ["es5", "es6", "dom"],
                "rootDir": "./src",
                "outFile": "./build/build.js",
            },
            "exclude": [
                "node_modules",
                "./node_modules",
                "./node_modules/*",
                "./node_modules/@types/node/index.d.ts",
                "./sample",
                "./test",
            ]
        }
    ```

    ```Javascript
        const path = require('path');
        module.exports = {
            mode: "development",
            devtool: "inline-source-map",
            entry: {
                main: "./src/interpreter.ts",
            },
            output: {
                path: path.resolve(__dirname, './dist'),
                filename: "easy.js"     // <--- Will be compiled to this single file
            },
            resolve: {
                extensions: [".ts", ".tsx", ".js"],
            },
            module: {
                rules: [
                    { 
                        test: /\.tsx?$/,
                        loader: "ts-loader",
                    }
                ]
            }
        };
    ```

- The test case overview of Easy Protocol as follow. The entry anchor lis `mock_a`, it will call anchor `mock_b`, then `mock_b` will run and search `mock_c` as template resource. You will find that, the different roles just need to update their own anchor and do their export job.

    | Role | Anchor | Type | Owner |Fake Code Sample |
    | -----: | ----------- | ------------- |------------- | ------------- |
    | Customer | mock_a | DATA | Owner_A | `{"title":"This is a mock title"}` |
    | Developer | mock_b | APP | Owner_B |`(function(){})()` |
    | Supplier | mock_c | DATA | Owner_C | `{"tpl":"Template string","keys":{}}` |

### Anchor Link Decoder

### Chain Application Launcher

### Protocol Creater
