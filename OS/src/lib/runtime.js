import STORAGE from './storage';
let API = null;
let wsAPI = null;
let wss = {};
let spams = {};

const errors={
    WEBSOCKET_LINK_ERROR:{
        message:"Failed to link to websocket",
        code:4001,
    }
}

const keys = {
    "account": "w3os_account_file",
    "contact": "w3os_contact_list",
    "apps": "w3os_apps_list",
};
STORAGE.setMap(keys);

const config = {
    accounts: require("../data/accounts"),
    apps: require("../data/apps"),
    contacts: require("../data/contacts"),
    system: require("../data/setting"),
}

const RUNTIME = {
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

    getError:(name)=>{

    },

    // setConfig:(obj)=>{

    // },
    // getConfig:(name,ck)=>{

    //     return ck && ck();
    // },


    system_init: () => {

    },
    trustSetting: () => {

    },
    getSetting: (ck) => {
        return ck && ck(config.system);
    },

    //contact functions
    addContact:(address,ck)=>{
        let list = STORAGE.getKey("contact");
        if(list===null) list={};
        list[address]={
            "intro":"",
            "status":"",
            "type":"friend",
            "network":"Anchor",
        }
        STORAGE.setKey("contact",list);
        return ck && ck(true);
    },
    removeContact:(list,ck)=>{
        console.log(list);
        let map = STORAGE.getKey("contact");
        if(map===null) map={};
        for(let i=0;i<list.length;i++){
            const acc=list[i];
            if(map[acc]) delete map[acc];
        }
        console.log(map);
        STORAGE.setKey("contact",map);
        return ck && ck(true);
    },

    getContact: (ck) => {
        RUNTIME.getAccount((res)=>{
            if(res===null || !res.address) return ck && ck(false);

            let list = STORAGE.getKey("contact");
            if(list===null) list={};
            return ck && ck(list);
        });
    },

    getApps: (ck) => {
        return ck && ck(config.apps);
    },
    installApp: (data) => {

    },

    setSpam:(uri,spam)=>{
        spams[uri]=spam;
    },
    getSpam:(uri)=>{
        return spams[uri];
    },
    websocket: (uri, ck, agent) => {
        //console.log(uri);
        if (wss[uri]) return ck && ck(wss[uri]);
        try {
            const ws = new WebSocket(uri);
            ws.onopen = (res) => {
                if(agent && agent.open) agent.open(res);
            };
            ws.onmessage = (res) => {
                if(agent && agent.message) agent.message(res);
            };
            ws.onclose = (res) => {
                if(agent && agent.close) agent.close(res);
            };
            ws.onerror = (res) => {
                if(agent && agent.error)  agent.error(res);
            };
            wss[uri]=ws;
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