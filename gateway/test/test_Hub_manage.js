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

const test_list={
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

const test_apart={
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

const test_dock={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"dock",
        "params":{
            //"uri":"http://localhost:4501"
            "uri":"http://167.179.119.110:4501"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_auth={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"auth",
        "params":{
            "salt":"salt_from_hub"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_upload={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"upload",
        "params":{
            "encry":"encried_address_json_file",
            "addr":"address",                           //Hub will confirm this first
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_drop={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"drop",
        "params":{
            "addr":"encry_address"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_system={
    method: 'post',
    url: URL+"/manage",
    data: {
        "jsonrpc":"2.0",
        "method":"system",
        "params":{
            "hello":"world"
        },
        "id":self.char(16,'mock_'),
    },
    headers: {'token': token}
}

const test_error={
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
    //test_list,
    //test_apart,
    //test_dock,
    //test_error,
    test_auth,
    test_upload,
    test_drop,
    test_system,
]

self.auto(list);