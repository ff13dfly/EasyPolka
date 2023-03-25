// npm i -D typescript
// npx tsc index.ts
// node index.js

import { anchorObject,marketObject,defaultValue } from "./define";

const self={
    check:(name:string|number,obj:anchorObject|null)=>{        
        console.log(`${name}:${JSON.stringify(obj)}`);
        const cc:marketObject={
            ...defaultValue.marketObject,
            price:100,
            owner:"5Ga3bDD7U33...AbcT",
        }
        console.log(`${JSON.stringify(cc)}`);

        obj?.check(cc.price);
    },
}

const obj={
    ...defaultValue.anchorObject,
    age:null,
    intro:"good to join",
};

self.check(123,obj);


//format of return Array
type testFun=(str:string) => string[];

const aaa:testFun=(a:string)=>{
    return [a,a,a];
};

const res=aaa("hello");
console.log(res);