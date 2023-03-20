//!important This is the library for Esay Protocol
var hello = "Hello World!";
console.log(hello);
var sites;
sites = ["Google", "Runoob", "Taobao"];
console.log(sites);
var Preter = {
    run: function (anchor, ck) {
        console.log(anchor);
        return ck && ck(true);
    },
};
Preter.run(hello, function (res) {
    console.log(res);
});
