const {WebSocketServer} =require('ws');
const port=8000;
const wss = new WebSocketServer({port: port});
const axios= require("axios").default;
const tools = require("./lib/tools");
console.log(`[ WS url ] http://localhost:${port}`);

const clients={};
wss.on('connection', function connection(ws,request, client) {
    const uid=tools.char(12);
    clients[uid]=ws;

    ws.send(JSON.stringify({"spam":uid}));
    ws.on('error', console.error);
    ws.on('message', function message(res) {
        //console.log(res);
        const str=res.toString();
        const input=JSON.parse(str);
        const active=clients[input.spam];
        console.log(`Request[${input.index}]:${tools.stamp()}`)
        try {
            const cfg={
                method: 'post',
                url: "http://localhost:4444",
                data:{"index":input.index},
            }
            axios(cfg).then((res)=>{
                const data=res.data;
                data.stamp=tools.stamp();
                console.log(`Response[${data.index}]:${tools.stamp()}`);
                active.send(JSON.stringify(data));
            }).catch((err)=>{
               console.log(err);
            });

        } catch (error) {
            console.log(error);
            console.log("not json data");
        }
    });
});