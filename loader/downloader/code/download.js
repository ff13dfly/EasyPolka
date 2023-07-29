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
    groupResource:(list)=>{
        const raw={},group={},divide={}
        for(let i=0;i<list.length;i++){
            const row=list[i];
            if(row.raw!==null){
                try {
                    const json=JSON.parse(row.raw);
                    for(var k in json){
                        raw[k]=json[k];
                        const arr=k.split("_");
                        if(arr.length===2){
                            if(!group[arr[0]]) group[arr[0]]=[];
                            group[arr[0]].push(parseInt(arr[1]));
                            divide[arr[0]]=row.name;
                        }else{
                            group[k]=row.name;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        const map={}
        for(let k in group){
            if(!Array.isArray(group[k])){
                map[`${group[k]}|${k}`]=raw[k];
            }else{
                let str='';
                for(let i=0;i<group[k].length;i++){
                    str+=raw[`${k}_${i}`]
                }
                map[`${divide[k]}|${k}`]=str;
            }
        }
        return map;
    },
    groupEasyData:(easy)=>{
        const result={
            code:"",
            title:"",
            name:"",
            css:"",
        }
        result.name=easy.location[0];
        if(easy.libs && easy.libs.css) result.css+=easy.libs.css;
        if(easy.libs && easy.libs.js) result.code+=easy.libs.js;
        if(easy.code) result.code+=easy.code;

        if(easy.resource && easy.raw){
            const kv=self.groupResource(easy.raw);
            for(var k in kv){
                result.code = result.code.replaceAll(`anchor://${k}`, kv[k]);
            }
        }
        return result;
    },
    getReactTemplate:(name,title,code,css)=>{
        return `<!doctype html><html lang="en">
            <head>
                <meta charset="utf-8"/>
                <link rel="icon" href="./favicon.ico"/>
                <meta name="viewport" content="width=device-width,initial-scale=1"/>
                <meta name="theme-color" content="#000000"/>
                <meta name="description" content="Web application ${name} from Anchor Network"/>
                <title>${title}</title>
                <style>${css}</style>
            </head>
            <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="root"></div>
            </body>
            <script>${code}</script>
        </html>`;
    },
    downloadData:(easy)=>{
        const down = document.createElement("a");
        const pre='data:text/plain;charset=utf-8,';
        const anchor=easy.data[`${easy.location[0]}_${easy.location[1]}`];
        switch (easy.type) {
            case "app":
                const replace=self.groupEasyData(easy);
                const tpl=self.getReactTemplate(replace.name,replace.title,replace.code,replace.css);
                down.setAttribute("href",pre+encodeURIComponent(tpl));
                down.setAttribute("download",`${easy.location[0]}_${easy.location[1]}_v${anchor.protocol.ver}.html`);
                
                break;
            case "data":
                const data={
                    raw:anchor.raw,
                    protocol:anchor.protocol,
                };
                const suffix=!anchor.protocol.fmt?"json":anchor.protocol.fmt;
                down.setAttribute("href",pre+encodeURIComponent(JSON.stringify(data)));
                down.setAttribute("download",`${easy.location[0]}_${easy.location[1]}.${suffix}`);
                break;

            case "lib":
                const fmt=!adata.protocol.fmt?"json":adata.protocol.fmt;
                down.setAttribute("href",pre+encodeURIComponent(anchor.raw));
                down.setAttribute("download",`${easy.location[0]}_${easy.location[1]}_v${anchor.protocol.ver}.${fmt}`);
                break;

            default:
                down.setAttribute("href",pre+encodeURIComponent(JSON.stringify(anchor)));
                down.setAttribute("download",`${easy.location[0]}_${easy.location[1]}.txt`);
                break;
        }
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
                    [${row.protocol.type}] <a href="#${row.name}" class="${cls}" data="anchor://${row.name}/${row.block}">
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

$(()=>{
    $("#btn_search").off("click").on("click",()=>{
        self.clear();
        const val=$("#anchor_name").val();
        if(!val) return $("#output").html("Please input the anchor name.");
        $("#btn_search").prop("disabled",true);
        
        self.auto(server,() => {
            self.getHistory(val,(res)=>{
                $("#btn_search").prop("disabled",false);
                if(res===false) return $("#output").html(`No such anchor : ${val}`);
                if(res.dom)$("#list").html(res.dom);
                if(res.fun)res.fun();
            });
        });
    });

    $("#anchor_name").off("keyup").on("keyup",(ev)=>{
        const code=ev.keyCode;
        if(code===13){
            $("#btn_search").trigger("click");
        }
    });

    const data=self.decodeHash(location.hash);
    const server = !data.server?self.getServer():data.server;
    $("#server").html(server);

    if(data.anchor){
        $("#anchor_name").val(data.anchor);
        $("#btn_search").trigger("click");
    }
});