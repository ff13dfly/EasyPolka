import STORAGE from './storage';
import tools from './tools';
import Encry from './encry';

import Config from '../data/setting';

let API = null;
let wsAPI = null;
let wss = {};
let spams = {};

// let login = {
//     md5: "",        //AES decode md5 password, avoid explosing the real one
//     stamp: 0,       //Login stamp, check expired
//     account: "",     //Login account, bind to current user
// };

// const errors = {
//     WEBSOCKET_LINK_ERROR: {
//         message: "Failed to link to websocket",
//         code: 4001,
//     }
// }

//keys and prefix for localstorage
const prefix = "w3os";
const keys = {
    "account": `${prefix}_account_file`,
    "contact": `${prefix}_contact_list`,
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
        STORAGE.setIgnore(["salt","vertify"]);     //public data;
        let salt = STORAGE.getKey("salt");
        if (salt === null) {    //1.first time to run W3OS
            const char = tools.char(28, prefix);
            STORAGE.setKey("salt", char);
        }
        salt = STORAGE.getKey("salt");
        const login = STORAGE.getEncry();     //check storage md5 password hash
        if(!login) {
            setPass((pass) => {
                const md5 = Encry.md5(`${salt}${pass}`);
                const check = STORAGE.getKey("vertify");
                //console.log(check);
                if(check===null){   //a. no password check, create one
                    STORAGE.setEncry(md5);
                    STORAGE.setKey("vertify",md5);
                }else{  //b. no password check, create one
                    if(check!==md5) return ck && ck({msg:"Error password"});
                    STORAGE.setEncry(md5);
                    console.log(`vertify:${check},pass:${md5}`);
                    return ck && ck(true);
                }
            });
        }
    },
    isLogin:()=>{
        return STORAGE.getEncry();
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

    getError: (name) => {

    },


    system_init: () => {

    },
    trustSetting: () => {

    },
    getSetting: (ck) => {
        return ck && ck(config.system);
    },

    //contact functions
    addContact: (address, ck) => {
        let list = STORAGE.getKey("contact");
        if (list === null) list = {};
        list[address] = {
            "intro": "",
            "status": "",
            "type": "friend",
            "network": "Anchor",
        }
        STORAGE.setKey("contact", list);
        return ck && ck(true);
    },
    removeContact: (list, ck) => {
        console.log(list);
        let map = STORAGE.getKey("contact");
        if (map === null) map = {};
        for (let i = 0; i < list.length; i++) {
            const acc = list[i];
            if (map[acc]) delete map[acc];
        }
        console.log(map);
        STORAGE.setKey("contact", map);
        return ck && ck(true);
    },
    getContact: (ck) => {
        const list = STORAGE.getKey("contact");
        if(list===null){
            STORAGE.setKey("contact",config.contacts);
        }
        return ck && ck(STORAGE.getKey("contact"));
    },
    clearContact:()=>{
        STORAGE.removeKey("contact");
    },

    getApps: (ck) => {
        const list = STORAGE.getKey("apps");
        if(list===null){
            STORAGE.setKey("apps",config.apps);
        }
        return ck && ck(STORAGE.getKey("apps"));
    },
    removeApp:(page,index)=>{

    },
    installApp: (obj,page,ck) => {
        const list = STORAGE.getKey("apps");
        list[page].push(obj);
        STORAGE.setKey("apps", list);
        return ck && ck(true);
    },
    clearApps:()=>{
        STORAGE.removeKey("apps");
    },
    formatApp:()=>{
        const str=JSON.stringify(Config.format.app);
        return JSON.parse(str);
    },

    setSpam: (uri, spam) => {
        spams[uri] = spam;
    },
    getSpam: (uri) => {
        return spams[uri];
    },
    websocket: (uri, ck, agent) => {
        //console.log(uri);
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
            return RUNTIME.link(endpoint, ck);
        }
        //console.log(API);
        return ck && ck(API);
    },
}

export default RUNTIME;