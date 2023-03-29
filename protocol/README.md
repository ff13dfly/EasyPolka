# Easy Protocol

## Overview

Recommand cApp protocol. It is a JSON based protocol, now `version 1.0`.

## Details

### Protocol Check

The reversed keyword `type` is treated as the start of `Easy Protocol`, when the `protocol` data is a JSON string and the keyword is one of the JSON key. Then it is a `Easy Protocol` anchor.

![Easy Protocol Decode Map](../images/on_chain_linked_list.png)

### Anchor link

### Reversed Keywords

### cApp Lancher

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

### Anchor Link Decode

### Chain Application Launch

```javascript
    const cApp = new Function("agent", "con", "error", raw);
    cApp(RPC, "container", code.failed ? code.failed : null);
```
