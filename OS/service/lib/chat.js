const {WebSocketServer} =require('ws');
const {output}=require("./output");

const clients={};
const amap={},bmap={};
const agent={
    reg:null,
    live:null,
    offline:null,
};

const self={
    send:(obj,spam,order)=>{
        if(!clients[spam]) return false;
        obj.order=order;
        clients[spam].websocket.send(JSON.stringify(obj));
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
    stamp:()=>{return new Date().getTime();},
};

module.exports={
    init:(port,funs)=>{
        if(funs && funs.live) agent.live=funs.live;
        if(funs && funs.offline) agent.offline=funs.offline;

        const wss = new WebSocketServer({port: port});
        output(`Websocket server start on ${port}.`,"dark",true);
        output(`ws://127.0.0.1:${port}`,"primary",true);
        wss.on('connection', (ws,request, client)=>{

            const uid=self.char(12);
            clients[uid]={
                websocket:ws,
                stamp:self.stamp(),
                status:1,
                IP:"",
            }
            
            output(`Client linked, uid: ${uid} at ${new Date(clients[uid].stamp)}`,"success");
            ws.send(JSON.stringify({"spam":uid,"act":"init"}));

            ws.on('close',(res)=>{
                delete clients[uid];
                output(`Client removed, uid: ${uid}`,"error");
            });
            ws.on('error', (err)=>{
                output(`Error: ${err}`,"error");
            });
            ws.on('message', (res)=>{
                const str=res.toString();
                output(`Request:${str}`)
                if(!str) return output(`Empty request.`,"error")

                try {
                    const input=JSON.parse(str);
                    switch (input.act){
                        case "reg":     //

                            break;

                        case "active":     //live on the server
                            amap[input.acc]=input.spam;
                            bmap[input.spam]=input.acc;
                            self.success(input.spam,input.order);
                            break;

                        case "chat":
                            if(!bmap[input.spam]){

                            };

                            const to=input.to;
                            if(!clients[amap[to]]){
                                output(`User ${to} is not active`,"error");
                                if(agent.offline){
                                    const from=bmap[input.spam];
                                    agent.offline(from,to,input.msg);
                                }
                                return  self.failed(input.spam,input.order);
                            }
                            self.send({act:"chat",msg:input.msg,from:bmap[input.spam]},amap[to],input.order);
                            self.success(input.spam,input.order);

                            break;
                        default:
                            break;
                    }
                    
                } catch (error) {
                    output(`Error: ${error}`,"error");
                }
            });
        });
    },
    cached:(address)=>{

    },
}