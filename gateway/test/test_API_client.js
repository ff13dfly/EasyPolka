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
//const URL="http://167.179.119.110:8001";
const data={
    "jsonrpc":"2.0",
    "method":"echo",
    "params":{
        "name":"node_me"
    },
    "id":"2223344"
};

const self={
    test:(config,count)=>{
        const n=!count?1:parseInt(count);
        for(let i=0;i<n;i++){
            config.data.params.name="node_me_"+i;
            axios(config).then((result)=>{
                console.log(result.data);
            }).catch((err)=>{
                console.log(err);
            });
        }
    },
};

const config={
    method: 'post',
    url: URL+"/service",
    data: data,
    headers: {'token': token}
}
self.test(config,1000);
