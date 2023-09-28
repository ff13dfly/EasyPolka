const {WebSocketServer} =require('ws');
const {output}=require("./output");

const clients={};
const amap={},bmap={};

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
    rand:(m,n)=>{return Math.round(Math.random() * (m-n) + n);},
    char:(n,pre)=>{
        n=n||7;pre=pre||'';
        for(let i=0;i<n;i++)pre+=i%2?String.fromCharCode(self.rand(65,90)):String.fromCharCode(self.rand(97,122));
        return pre;
    },
};

module.exports={
    init:(port)=>{
        const wss = new WebSocketServer({port: port});
        output(`Websocket server start on ${port}.`,"dark",true);
        output(`ws://127.0.0.1:${port}`,"primary",true);
        wss.on('connection', (ws,request, client)=>{
            const uid=self.char(12);
            clients[uid]=ws;

            ws.send(JSON.stringify({"spam":uid,"act":"init"}));
            ws.on('error', console.error);
            ws.on('message', function message(res){
                const str=res.toString();
                console.log(str);
                if(!str) return false;

                try {
                    const input=JSON.parse(str);
                    switch (input.act) {
                        case "reg":
                            amap[input.acc]=input.spam;
                            bmap[input.spam]=input.acc;
                            self.success(input.spam,input.order);
                            break;
                        case "chat":
                            const to=input.to;
                            console.log(amap[to]);
                            if(!clients[amap[to]]){
                                return  self.failed(input.spam,input.order);
                            }
                            self.send({act:"chat",msg:input.msg,from:bmap[input.spam]},amap[to],input.order);
                            self.success(input.spam,input.order);

                            break;
                        default:
                            break;
                    }
                    
                } catch (error) {
                    
                }
            });
        });
    },
    cached:(address)=>{

    },
}