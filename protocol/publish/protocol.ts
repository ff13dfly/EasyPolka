//!important This is the library for Esay Protocol

var hello : string = "Hello World!"
console.log(hello);

var sites:string[]; 
sites = ["Google","Runoob","Taobao"]


console.log(sites);

var Preter:any ={
    run: function(anchor:string,ck:Function){
        console.log(anchor);
        return ck && ck(true);
    },
};

Preter.run(hello,function(res:boolean){
    console.log(res);
});