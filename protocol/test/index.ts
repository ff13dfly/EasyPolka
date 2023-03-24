// npm i -D typescript
// npx tsc index.ts
// node index.js

import { easyProtocol } from "../src/interpreter";

easyProtocol.check(["hello",223]);
easyProtocol.check(["你好",1234]);