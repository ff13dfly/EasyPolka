const {WebSocketServer} =require('ws');
const port=5566;
const wss = new WebSocketServer({port: port});
const tools = require("../ws/lib/tools");
const encry = require("../../lib/encry");

console.log(`[ WS url ] http://localhost:${port}`);


let ws=null;
const self={
    send:(obj)=>{
        //console.log(obj);
        ws.send(JSON.stringify(obj));
    },
    success:(obj)=>{
        obj.success=true;
        self.send(obj);
    },
    failed:(msg)=>{
        self.send({error:msg});
    },
};

wss.on('connection', function connection(active,request, client) {
    ws=active;
    ws.on('error', console.error);
    ws.on('message', function message(res){
        const str=res.toString();
        //console.log(str);
        if(!str) return false;

        try {
            const input=JSON.parse(str);
            switch (input.act) {

                case "encode":
                    const pass=input.pass;
                    const ctx=input.ctx;
                    
                    //1. md5 password to encry the data
                    //password abc
                    //900150983cd24fb0
                    //d6963f7d28e17f72
                    const md5=encry.md5(pass);
                    encry.setKey(md5.substring(0,16));
                    encry.setIV(md5.substring(16,32));
                    const code=encry.encrypt(ctx);

                    //2. set default IV
                    //encry.setKey(md5);
                    //encry.setIV("aaaaaa");
                    //const code=encry.encrypt(ctx);

                    const de=encry.decrypt(code);

                    self.success({act:"encode","raw":ctx,"md5":md5,"code":code,"circle":de});
                    break;

                case "decode":
                    const depass=input.pass;
                    const dectx=input.ctx;

                    break;

                default:
                    break;
            }
            
        } catch (error) {
            
        }
    });
});