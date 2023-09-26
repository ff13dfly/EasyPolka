const {WebSocketServer} =require('ws');
const port=5566;
const wss = new WebSocketServer({port: port});
const tools = require("../ws/lib/tools");
console.log(`[ WS url ] http://localhost:${port}`);

const self={
    send:(obj,spam,order)=>{
        if(!clients[spam]) return false;
        obj.order=order;
        clients[spam].send(JSON.stringify(obj));
    },
    success:(spam,order)=>{
        self.send({status:1},spam,order);
    },
    failed:(spam,order)=>{
        self.send({status:0},spam,order);
    },
};

wss.on('connection', function connection(ws,request, client) {

    //ws.send(JSON.stringify({"spam":uid,"act":"init"}));
    ws.on('error', console.error);
    ws.on('message', function message(res){
        const str=res.toString();
        console.log(str);
        if(!str) return false;

        try {
            const input=JSON.parse(str);
            
            
        } catch (error) {
            
        }
    });
});