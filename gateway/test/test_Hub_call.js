const json={
    cat:"vhistory",
    name:"vh-001",
}
const jsonwebtoken = require('jsonwebtoken');
const secret="abc";
const cfg={
    expiresIn: '3h'
}
const token = jsonwebtoken.sign(json, secret, cfg);


//root@167.179.119.110
//curl "http://localhost:8001" -d '{"jsonrpc":"2.0","method":"echo","params":{"text":"hello world"},"id":3334}'

const axios = require('axios').default;
const URL="http://localhost:8001";

const self={
    auto:(list)=>{
        for(let i=0;i<list.length;i++){
            const row=list[i];
            axios(row).then((result)=>{
                console.log(result.data);
            }).catch((err)=>{
                console.log(err);
            });
        }
    }
}

const test_a={
    method: 'post',
    url: URL,
    data: {
        "jsonrpc":"2.0",
        "method":"spam",
        "params":{
            "name":"node_me"
        },
        "id":"2223344"
    },
    headers: {'token': token}
}

const test_b={
    method: 'post',
    url: URL,
    data: {
        "jsonrpc":"2.0",
        "method":"auto",
        "params":{
            "name":"node_me"
        },
        "id":"2223344"
    },
    headers: {'token': token}
}

const test_c={
    method: 'post',
    url: URL,
    data: {
        "jsonrpc":"2.0",
        "method":"none",
        "params":{
            "name":"node_me"
        },
        "id":"2223344"
    },
    headers: {'token': token}
}

const list=[
    test_a,
    test_b,
    test_c,
]

self.auto(list);