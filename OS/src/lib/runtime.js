let API = null;
let wsAPI = null;

const config = {
    endpoint: "ws://localhost:9944",
    user: {

    },
}

const RUNTIME = {
    trustSetting: () => {

    },
    link: (ck) => {
        if (wsAPI === null) {
            const WsProvider = API.Polkadot.WsProvider;
            const ApiPromise = API.Polkadot.ApiPromise;
            try {
                const provider = new WsProvider(config.endpoint);
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

            return RUNTIME.link(ck);
        }

        return ck && ck(API);
    },
}

export default RUNTIME;