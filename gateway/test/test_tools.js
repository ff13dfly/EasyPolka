const tools=require("../lib/tools");

const min=65;
const max=90;
const count=100000;

const list=[];
for(let i=0;i<count;i++){
    list.push(tools.rand(min,max));
}
console.log(JSON.stringify(list));