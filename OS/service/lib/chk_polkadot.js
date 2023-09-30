const { ApiPromise, WsProvider } = require('@polkadot/api');

let endpoint = "";

const fmt = [
    {
        "phase": "Initialization",
        "event": {
            "method": "EraPaid",
            "section": "staking",
            "index": "0x0a00",
            "data": {
                "eraIndex": "692",
                "validatorPayout": "60,476,420,997,256,057",
                "remainder": "180,794,449,859,696,349"
            }
        },
        "topics": []
    }, 
    {
        "phase": "Initialization",
        "event": {
            "method": "Deposit",
            "section": "balances",
            "index": "0x0607",
            "data": {
                "who": "5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z",
                "amount": "180,794,449,859,696,349"
            }
        },
        "topics": []
    }, 
    {
        "phase": "Initialization",
        "event": {
            "method": "Deposit",
            "section": "treasury",
            "index": "0x1206",
            "data": {
                "value": "180,794,449,859,696,349"
            }
        },
        "topics": []
    }, 
    {
        "phase": "Initialization",
        "event": {
            "method": "NewSession",
            "section": "session",
            "index": "0x0b00",
            "data": {
                "sessionIndex": "4,158"
            }
        },
        "topics": []
    }, 
    {
        "phase": "Initialization",
        "event": {
            "method": "UpdatedInactive",
            "section": "treasury",
            "index": "0x1208",
            "data": {
                "reactivated": "8,414,304,271,343,305,547",
                "deactivated": "8,595,098,721,203,001,896"
            }
        },
        "topics": []
    }, 
    {
        "phase": {
            "ApplyExtrinsic": "0"
        },
        "event": {
            "method": "ExtrinsicSuccess",
            "section": "system",
            "index": "0x0000",
            "data": {
                "dispatchInfo": {
                    "weight": {
                        "refTime": "274,737,000",
                        "proofSize": "1,493"
                    },
                    "class": "Mandatory",
                    "paysFee": "Yes"
                }
            }
        },
        "topics": []
    },
    {
        "phase": "Finalization",
        "event": {
            "method": "NewAuthorities",
            "section": "grandpa",
            "index": "0x1100",
            "data": {
                "authoritySet": [
                    ["0x88dc3417d5058ec4b4503e0c12ea1a0a89be200fe98922423d4334014fa6b0ee", "1"]
                ]
            }
        },
        "topics": []
    }
]

module.exports = {
    endpoint: (uri) => {
        endpoint = uri;
    },
    subcribe: (ck) => {
        //const endpoint="ws://127.0.0.1:9944";
        const provider = new WsProvider(endpoint);
        ApiPromise.create({ provider: provider }).then((wsAPI) => {
            wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
                const hash = lastHeader.hash.toHex();
                const block = lastHeader.number.toNumber();
                wsAPI.rpc.chain.getBlock(hash).then((dt) => {
                    wsAPI.query.system.events.at(hash, (evs) => {
                        const list = evs.toHuman();
                        //console.log(list);
                        if (list.length !== 1) {
                            list.shift();
                            return ck && ck(block, list);
                        }
                    });
                });
            });
        });
    },
    convert: (list) => {

    },
}