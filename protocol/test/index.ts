// npm i -D typescript
// npx tsc index.ts
// node index.js

import { easyProtocol } from "../src/interpreter";
import { anchorJS } from "../lib/anchor";

const API={
    "common":{
        "latest":anchorJS.latest,
        "target":anchorJS.target,
        "history":anchorJS.history,
    },
}

easyProtocol(["hello",223],API);
easyProtocol(["你好",1234],API);
