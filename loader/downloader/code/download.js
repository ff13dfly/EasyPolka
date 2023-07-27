//!important, This is the loader of launcher such as `Plinth`.
//!important, Need to build, the index.html not support hight version JS

//########## USEAGE ##########
//Can load from local file.
//file:///Users/fuzhongqiang/Desktop/loader.html#ppp@ws://127.0.0.1:9944

//########## BUILD ##########
// https://esbuild.github.io/api/
// ../node_modules/.bin/esbuild react_loader.js --bundle --minify --outfile=loader.min.js

const config = {
    error: '\x1b[36m%s\x1b[0m',
    success: '\x1b[36m%s\x1b[0m',
    anchor: 'plinth',
    server: 'ws://127.0.0.1:9944',
    version: '1.0.2',
    step: 300,
};

//get the global
const Polkadot = LP, ApiPromise = Polkadot.ApiPromise, WsProvider = Polkadot.WsProvider;
const anchorJS = LA;
const easyRun = LE.easyRun;

//websocket link to server
let websocket = null;
const self = {
    auto: (server,ck) => {
        if (websocket !== null) return ck && ck();
        $("#output").html("Linked to websocket.");
        ApiPromise.create({ provider: new WsProvider(server) }).then((api) => {
            websocket = api;
            anchorJS.set(api);
            return ck && ck();
        });
    },
    stamp: () => {
        return new Date().toLocaleString();
    },
    getServer: () => {
        return config.server;
    },
    clear:()=>{
        $("#output").html("");
        $("#list").html("");
    },
    easyAnchor:(linker,ck)=>{
        const SDK = {
            common: {
                "latest": anchorJS.latest,
                "target": anchorJS.target,
                "history": anchorJS.history,
                "owner": anchorJS.owner,
                "subcribe": anchorJS.subcribe,
                "multi":anchorJS.multi,
                "block": anchorJS.block,
            }
        };
        easyRun(linker,SDK,ck);
    },
    decodeHash:(hash)=>{
        const data={anchor:"",server:""}
        if(!hash || hash.length===1) return data;
        const arr=hash.split("@");
        if(arr.length>2) return data;
        if(arr.length===2){
            data.server=arr[1];
            data.anchor=arr[0].substring(1);
        }
        if(arr.length===1){
            data.anchor=arr[0].substring(1);
        }
        return data;
    },
    downloadData:(easy)=>{
        const down = document.createElement("a");
        down.href = easy.code;
        down.download =`${easy.location[0]}.html`;
        down.click();
    },
    getHistory:(name,ck)=>{
        anchorJS.history(name,(list)=>{
            if(list===false) return ck && ck(list);
            let dom="<ul>";
            const cls="down_row";
            for(let i=0;i<list.length;i++){
                const row=list[i];
                const details=row.raw.length<500?`<tr>
                    <td>Raw Data</td>
                    <td>${row.raw}</td>
                </tr>`:"";
                dom+=`<li>
                    [${row.protocol.type}] <a href="#" class="${cls}" data="anchor://${row.name}/${row.block}">
                        anchor://${row.name}/${row.block}
                    </a>
                    <table class="details">
                        <tr>
                            <td>Date</td>
                            <td>${new Date(row.stamp).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Signer</td>
                            <td>${row.signer}</td>
                        </tr>
                        <tr>
                            <td>Row length</td>
                            <td>${row.raw.length.toLocaleString()} bytes</td>
                        </tr>
                        ${details}
                        <tr>
                            <td>Protocol</td>
                            <td>${JSON.stringify(row.protocol)}</td>
                        </tr>
                    </table>
                    <p></p>
                </li>`;
            }
            dom+="</ul>";
            const fun=function(){
                $(`.${cls}`).off("click").on("click",function(){
                    const k=$(this).attr("data");
                    self.easyAnchor(k,(res)=>{
                        self.downloadData(res);
                    });
                });
            }
            ck && ck({dom:dom,fun:fun})
        });
    },
}