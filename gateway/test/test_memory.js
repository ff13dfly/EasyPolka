//../node_modules/.bin/esbuild test_memory.js --bundle --minify --outfile=mndb.min.js --platform=node

const {MNDB}=require("../lib/mndb.js");


const self={
    stamp:()=>{
        return new Date().getTime();
    },
}

//1.write time test
const w_count=100000000;
const w_start=self.stamp();
for(let i=0;i<w_count;i++){
    MNDB.key_set(i,i);
}
const w_end=self.stamp();
console.log('\x1b[36m%s\x1b[0m',`\nWrite ${w_count.toLocaleString()} records cost: ${w_end-w_start} ms`);
        

//2.read time test
const r_count=100000000;
const r_start=self.stamp();
for(let i=0;i<r_count;i++){
    MNDB.key_get(i);
}
const r_end=self.stamp();
console.log('\x1b[36m%s\x1b[0m',`Read ${r_count.toLocaleString()} records cost: ${r_end-r_start} ms\n`);
        
