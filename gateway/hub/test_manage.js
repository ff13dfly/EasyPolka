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
const URL="http://127.0.0.1:8001";

const self={
    auto:(list)=>{
        for(let i=0;i<list.length;i++){
            const row=list[i];
            console.log(`\nRequest : ${JSON.stringify(row)}`);
            axios(row).then((result)=>{
                console.log(result.data);
            }).catch((err)=>{
                console.log(err);
            });
        }
    },
    rand:(m,n)=>{return Math.floor(Math.random() * (m-n+1) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
    },
}

const test_a={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"list",
        "params":{
            "name":"node_me"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_b={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"apart",
        "params":{
            "name":"node_me"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_c={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"dock",
        "params":{
            "uri":"http://localhost:4501"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_d={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"none",
        "params":{
            "name":"node_me"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}


const list=[
    //test_a,
    //test_b,
    test_c,
    //test_d,
]

self.auto(list);