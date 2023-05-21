const axios = require('axios').default;

//root@167.179.119.110
//curl "http://localhost:8001" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'

//const URL="http://localhost:8001";
const URL="http://167.179.119.110:8001";
const data={
    "jsonrpc":"2.0",
    "method":"echo",
    "params":{
        "text":"hello axios"
    },
    "id":"2223344"
};

axios.post(URL,data).then((result)=>{
    console.log(result.data);
}).catch((err)=>{
    console.log(err);
});
