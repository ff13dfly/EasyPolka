let API = null;
let wsAPI = null;

const config={
    accounts:require("../data/accounts"),
    apps:require("../data/apps"),
    contacts:require("../data/contacts"),
    system:require("../data/setting"),
}

const RUNTIME = {
    system_init:()=>{

    },
    trustSetting: () => {

    },

    getContact:(ck)=>{
        return ck && ck(config.contacts);
    },

    getApps:(ck)=>{
        return ck && ck(config.apps);
    },
    installApp:(data)=>{

    },
    getConfig:(name)=>{

    },
    link: (endpoint,ck) => {
        if (wsAPI === null) {
            const WsProvider = API.Polkadot.WsProvider;
            const ApiPromise = API.Polkadot.ApiPromise;
            try {
                const provider = new WsProvider(endpoint);
                ApiPromise.create({ provider: provider }).then((PokLinker) => {
                    wsAPI = PokLinker;
                    API.AnchorJS.set(wsAPI);
                    //console.log(PokLinker);
                    ck && ck(API);
                });
            } catch (error) {
                ck && ck(false);
            }
        } else {
            ck && ck(API);
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

            const endpoint=config.system.basic.endpoint[0];
            //console.log(endpoint);

            return RUNTIME.link(endpoint,ck);
        }
        //console.log(API);
        return ck && ck(API);
    },
}

export default RUNTIME;