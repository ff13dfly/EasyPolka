const { JSONRPCServer } = require("json-rpc-2.0");
const server = new JSONRPCServer();

const self={
    getToken:()=>{
        return "aaa"
    },

    curl:(heads,body,uri,ck)=>{

    },
};

console.log(server);

module.exports={
    token:self.getToken,
    fresh:()=>{},
    notice:()=>{},
};