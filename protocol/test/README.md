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

        # run the compiled file
        node ${sample}.js
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
