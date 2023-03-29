// npm i -D typescript
// npx tsc index.ts
// node index.js

import { anchorJS } from "../lib/anchor";
import { easyProtocol } from "../src/format";
import { easyRun } from "../src/interpreter";
import { anchorType } from "../src/protocol";

const API={
    "common":{
        "latest":anchorJS.latest,
        "target":anchorJS.target,
        "history":anchorJS.history,
    },
}

easyRun(["hello",223],API,()=>{});
easyRun(["你好",1234],API,()=>{});

const data=easyProtocol(anchorType.APP);
console.log(data);
