function rand(m,n){return Math.round(Math.random() * (m-n) + n);}

//http://localhost/Easypolka/gateway/test/ws/client.html

function WebSocketTest(url) {
    var spam="";
    if ("WebSocket" in window) {
        //console.log("WebSocket supported!");
        var uid=rand(10000,20000);
        var ws = new WebSocket(url);
        
        ws.onopen = function (ev) {
            console.log(ev.data);
            console.log(ws.readyState);
        };

        ws.onmessage = function (ev) {
            var received_msg = ev.data;
            console.log(received_msg);
            try {
                const json=JSON.parse(received_msg);
                if(json.spam) spam=json.spam;
            } catch (err) {
                
            }
            
        };

        ws.onclose = function () {
            console.log(ws.readyState);
            console.log("Websocket link closed...");
        };

        setInterval(function(){
            console.log(ws.readyState);
            if(ws.readyState!==1 || !spam) return false;
            var obj={
                id:uid,
                method:"auto",
                params:{
                    svc:"vHistory",
                    act:"view",
                    name:"hello_"+uid,
                    spam:spam,
                }
            }
            ws.send(JSON.stringify(obj));
        },5000);
    }else{
        console.log("No WebSocket Support from Browser!");
    }
}
