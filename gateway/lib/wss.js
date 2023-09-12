const {WebSocketServer} =require('ws');
const tools = require("./tools");
const {output}=require("./output");

const cfg={
    port:8866,
};

const agent={
    fetch:null,
}

const clients={};
let wss=null;
const self={
    auto:(params,agent)=>{
        self.setParams(params);
        self.setAgent(agent);
    },
    setParams:(obj)=>{
        for(var k in cfg){
            if(obj[k]) cfg[k]=obj[k];
        }
        return true;
    },
    setAgent:(obj)=>{
        for(var k in agent){
            if(obj[k]) agent[k]=obj[k];
        }
        return true;
    },
    init:(ck)=>{
        wss = new WebSocketServer({port: cfg.port});
        output(`Websocket started successful, port:${cfg.port}`,"success",true);
        return ck && ck();
    },
    start:()=>{
        if(wss==null) return self.init(()=>{
            self.start();
        });
        wss.on('connection', function connection(ws,request, client) {
            
            const wid=tools.char(12);
            clients[wid]=ws;
            output(`New connection created: ${wid}`);
            ws.send(JSON.stringify({"spam":wid}));
            ws.on('error', console.error);
            ws.on('message',(res)=>{
                const str=res.toString();
                try {
                    const input=JSON.parse(str);
                    if(!input.spam){
                        return output(`Unrecongnize request, input: ${str}`,"error");
                    }
                    const active=clients[input.spam];
                    if(agent.fetch===null){
                        active.send(JSON.stringify({error:"No data fetch function."}));
                    }else{
                        agent.fetch(input,(data)=>{
                            active.send(JSON.stringify(data));
                        });
                    }
                } catch (error) {
                    output(`Failed to decode input params.`,"error");
                }
            });
        })
    },
}

module.exports = self;