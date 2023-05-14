//!important, this is the demo of loading node.js lib from anchor
//!important, `module.exports` is seperated by every function calling.
const fun_raw=(name)=>{
    console.log("hello,"+name);
};

// The code string, mock the Anchor raw data. 
const code_a=';exports.hello=(name)=>{console.log("hello,"+name);}';
const code_b=';exports.more=(name)=>{console.log("more,"+name);}';
const code_c=';exports.more={"hello":()=>{},"more":()=>{}}';
// "eval" is used here, so "try".
try {
    fun_raw("raw function");

    eval(code_a);
    const fun_a = module.exports;
    console.log(fun_a);
    //fun_a("code_a");

    eval(code_b);
    const fun_b = module.exports;
    console.log(fun_b);
    //fun_b("code_b");

    eval(code_a+code_b);
    const fun_c = module.exports;
    console.log(fun_c);
    
    eval(code_c);
    const fun_d = module.exports;
    console.log(fun_d);
    
} catch (error) {
    console.log(error);
}