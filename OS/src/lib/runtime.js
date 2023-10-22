import STORAGE from './storage';
import tools from './tools';
import Encry from './encry';
import Config from '../data/setting';

let API = null;
let wsAPI = null;
let wss = {};
let spams = {};
let nets={};

//keys and prefix for localstorage
const prefix = "w3os";
const keys = {
    "account": `${prefix}_account_file`,
    "stranger": `${prefix}_stranger_list`,
    "apps": `${prefix}_apps_list`,
    "salt": `${prefix}_salt`,
    "vertify": `${prefix}_check`,
};
STORAGE.setMap(keys);

//default OS setting
const config = {
    accounts: require("../data/accounts"),
    apps: require("../data/apps"),              //Official Dapps
    contacts: require("../data/contacts"),      //Official contact
    system: require("../data/setting"),         //Official settings for both system and Dapps
}

const RUNTIME = {
    //1. set the password for W3OS;
    //!important, if there is no password, the data will be encode by default salt.
    //!important, the storage will be fresh when the password changed
    init: (setPass, ck) => {
        //1. creat salt anyway.
        STORAGE.setIgnore(["salt", "vertify"]);     //public data;
        let salt = STORAGE.getKey("salt");
        if (salt === null) {    //1.first time to run W3OS
            const char = tools.char(28, prefix);
            STORAGE.setKey("salt", char);
        }
        salt = STORAGE.getKey("salt");
        const login = STORAGE.getEncry();     //check storage md5 password hash
        if (!login) {
            setPass((pass) => {
                const md5 = Encry.md5(`${salt}${pass}`);
                const check = STORAGE.getKey("vertify");
                //console.log(check);
                if (check === null) {   //a. no password check, create one
                    STORAGE.setEncry(md5);
                    STORAGE.setKey("vertify", md5);
                } else {  //b. no password check, create one
                    if (check !== md5) return ck && ck({ msg: "Error password" });
                    STORAGE.setEncry(md5);
                    //console.log(`vertify:${check},pass:${md5}`);
                    return ck && ck(true);
                }
            });
        }
    },
    isLogin: () => {
        return STORAGE.getEncry();
    },
    isSalted:()=>{
        const salt=STORAGE.getKey("salt");
        //console.log(salt);
        return !salt?false:true;
    },
    networkReg:(net,fun)=>{
        nets[net]=fun;
        return true;
    },
    networkStatus:(net,ck)=>{
        //console.log(net);
        //console.log(JSON.stringify(nets));
        //console.log(nets[net]);
        if(!nets[net]) return ck && ck(false);
        nets[net](ck);
    },

    getAccount: (ck) => {
        const fa = STORAGE.getKey("account");
        return ck && ck(fa);
    },
    setAccount: (obj) => {
        STORAGE.setKey("account", obj);
    },
    removeAccount: () => {
        STORAGE.removeKey("account");
        return true;
    },

    getSetting: (ck) => {
        return ck && ck(config.system);
    },

    //contact functions
    addContact: (address, ck, stranger) => {
        RUNTIME.getAccount((acc) => {
            if (!acc || !acc.address) return ck && ck(false);
            const mine = acc.address;
            const nkey = !stranger ? mine : `${mine}_stranger`;
            let list = STORAGE.getKey(nkey);
            if (list === null) list = {};
            list[address] = {
                "intro": "",
                "status": 1,
                "type": !stranger?"friend":"stranger",
                "network": "Anchor",
            }
            STORAGE.setKey(nkey, list);
            return ck && ck(true);
        });
    },
    removeContact: (list, ck, stranger) => {
        RUNTIME.getAccount((acc) => {
            if (!acc || !acc.address) return ck && ck(false);
            const mine = acc.address;
            const nkey = !stranger ? mine : `${mine}_stranger`;
            let map = STORAGE.getKey(nkey);
            if (map === null) map = {};
            for (let i = 0; i < list.length; i++) {
                const acc = list[i];
                if (map[acc]) delete map[acc];
            }
            STORAGE.setKey(nkey, map);

            return ck && ck(true);
        });
    },
    getContact: (ck, stranger) => {
        RUNTIME.getAccount((acc) => {
            if (!acc || !acc.address) return ck && ck(false);
            const mine = acc.address;
            const nmap = {};
            const skey = !stranger ? `${prefix}_${mine}` : `${prefix}_${mine}_stranger`;
            const nkey = !stranger ? mine : `${mine}_stranger`;
            nmap[nkey] = skey;
            STORAGE.setMap(nmap);

            const list = STORAGE.getKey(nkey);
            if (list === null) {
                STORAGE.setKey(nkey, !stranger ? config.contacts : {});
            }
            return ck && ck(STORAGE.getKey(nkey));
        });
    },
    clearContact: (ck, stranger) => {
        RUNTIME.getAccount((acc) => {
            if (!acc || !acc.address) return ck && ck(false);
            const mine = acc.address;
            const nkey = !stranger ? mine : `${mine}_stranger`;
            STORAGE.removeKey(nkey);
            return ck && ck(true);
        });
    },

    getApps: (ck) => {
        const list = STORAGE.getKey("apps");
        if (list === null) {
            STORAGE.setKey("apps", config.apps);
        }
        return ck && ck(STORAGE.getKey("apps"));
    },
    inArray:(index,arr)=>{
        //console.log(index);
        //console.log(arr);
        for(let i=0;i<arr.length;i++){
            if(parseInt(index)===arr[i]) return true;
        }
        return false;
    },
    removeApp:(map,ck)=>{
        //console.log(map);
        const list = STORAGE.getKey("apps");
        //console.log(JSON.stringify(list));
        for(var page in map){
            if(!list[page]) break;
            const todo=map[page];
            const nlist=[];
            for(let i=0;i<list[page].length;i++){
                const row=list[page][i];
                //console.log(RUNTIME.inArray(i,todo))
                if(!RUNTIME.inArray(i,todo)) nlist.push(row);
            }
            list[page]=nlist;
            STORAGE.setKey("apps", list);
            //console.log(nlist);
            return ck && ck(true);
        }
    },
    installApp: (obj, page, ck) => {
        const list = STORAGE.getKey("apps");
        list[page].push(obj);
        STORAGE.setKey("apps", list);
        return ck && ck(true);
    },
    clearApps: () => {
        STORAGE.removeKey("apps");
    },
    formatApp: () => {
        const str = JSON.stringify(Config.format.app);
        return JSON.parse(str);
    },

    setSpam: (uri, spam) => {
        spams[uri] = spam;
    },
    getSpam: (uri) => {
        return spams[uri];
    },
    websocket: (uri, ck, agent) => {
        if (wss[uri]) return ck && ck(wss[uri]);
        try {
            const ws = new WebSocket(uri);
            ws.onopen = (res) => {
                if (agent && agent.open) agent.open(res);
            };
            ws.onmessage = (res) => {
                if (agent && agent.message) agent.message(res);
            };
            ws.onclose = (res) => {
                if (agent && agent.close) agent.close(res);
            };
            ws.onerror = (res) => {
                if (agent && agent.error) agent.error(res);
            };
            wss[uri] = ws;
            return ck && ck(ws);
        } catch (error) {
            return ck && ck(RUNTIME.getError("WEBSOCKET_LINK_ERROR"));
        }
    },

    link: (endpoint, ck) => {
        if (wsAPI === null) {
            const WsProvider = API.Polkadot.WsProvider;
            const ApiPromise = API.Polkadot.ApiPromise;
            try {
                const provider = new WsProvider(endpoint);
                ApiPromise.create({ provider: provider }).then((PokLinker) => {
                    wsAPI = PokLinker;
                    API.AnchorJS.set(wsAPI);
                    ck && ck(API);
                });
            } catch (error) {
                ck && ck(false);
            }
        } else {
            ck && ck(API);
        }
    },
    getActive: (ck) => {
        if (wsAPI === null) {
            RUNTIME.getAPIs(() => {
                return ck && ck(wsAPI, API.Polkadot.Keyring);
            });
        } else {
            return ck && ck(wsAPI, API.Polkadot.Keyring);
        }
    },
    basicStatus:(ck)=>{
        //console.log(API.AnchorJS.ready());
        if(API.AnchorJS.ready) return ck && ck(API.AnchorJS.ready())
        return ck && ck(false);
    },
    getAPIs: (ck) => {
        if (API === null) {
            const AnchorJS = window.AnchorJS;
            const easyAPI = {
                common: {
                    "latest": AnchorJS.latest,
                    "target": AnchorJS.target,
                    "history": AnchorJS.history,
                    "owner": AnchorJS.owner,
                    "subcribe": AnchorJS.subcribe,
                    "block": AnchorJS.block,
                }
            };
            API = {
                Polkadot: window.Polkadot,
                AnchorJS: AnchorJS,
                Easy: (anchorLinker, ck) => {
                    window.Easy.easyRun(anchorLinker, easyAPI, ck);
                },
            };

            const endpoint = config.system.basic.endpoint[0];
            RUNTIME.networkReg("anchor",RUNTIME.basicStatus);   //reg status function for Anchor Network
            return RUNTIME.link(endpoint, ck);
        }
        return ck && ck(API);
    },
}

export default RUNTIME;