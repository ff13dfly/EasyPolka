//!important This is the file to create the mock complex data.
//!important This JS can be run many times, the anchor data will be updated, but still can work.

//#run this mock.
//node test_mock_data.js

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/api');
const anchorJS = require('../../package/node/anchor.node');
const {easyRun} = require('../../package/node/easy.node');
const md5 = require("md5");

const config = {
    color: '\x1b[36m%s\x1b[0m',
    endpoint: "ws://127.0.0.1:9944"
};

let websocket = null;

let test_start = 0;
let test_end = 0;
const self = {
    run: (list, count) => {
        if (list.length === 0) {
            test_end = self.stamp();
            console.log(`\nStart from ${test_start}, end at ${test_end}, total cost : ${((test_end - test_start) * 0.001).toFixed(3)} s.`);
            //self.report();
            console.log(`\n********************End of Writing Mock Data********************`);
            return true;
        }
        const fun = list.shift();
        fun(count - list.length, () => {
            if (list.length !== 0) console.log(`Done, ready for next one.\n\n`);
            setTimeout(() => {
                self.run(list, count);
            }, 1500);
        });
    },
    accounts: (ck) => {

    },
    prework: (ck) => {
        return ck && ck();
    },
    auto: (list) => {
        ApiPromise.create({ provider: new WsProvider(config.endpoint) }).then((api) => {
            console.log('Linker to substrate node created...');
            websocket = api;

            anchorJS.set(api);
            anchorJS.setKeyring(Keyring);
            self.prework(() => {
                test_start = self.stamp();
                console.log(`\n********************Start of Writing Mock Data********************\n`);
                self.run(list, list.length);
            });
        });
    },
    multi: (list, ck, index, pair) => {
        if (list.length === 0) return ck && ck();
        const row = list.shift();
        console.log(`\nWriting lib anchor : ${row.name}`);
        const strProto = typeof (row.protocol) == 'string' ? row.protocol : JSON.stringify(row.protocol);
        const raw = typeof (row.raw) == 'string' ? row.raw : JSON.stringify(row.raw);
        anchorJS.write(pair, row.name, raw, strProto, (res) => {
            console.log(`[${index}] Processing : ${row.name}, protocol ( ${strProto.length} bytes ) :${strProto}`);
            console.log(res);
            if (res.step === "Finalized") {
                self.multi(list, ck, index, pair);
            }
        });
    },
    stamp: () => {
        return new Date().getTime();
    },
    randomData: (len) => {
        let str = '';
        const max = len === undefined ? 4 : len;
        for (let i = 0; i < max; i++) {
            str += Math.ceil(Math.random() * 10) - 1;
        }
        return str;
    },
};

const API = {
    common: {
        "latest": anchorJS.latest,
        "target": anchorJS.target,
        "history": anchorJS.history,
        "owner": anchorJS.owner,
        "subcribe": anchorJS.subcribe,
        "block": anchorJS.block,
    }
};

const task = [
    //node_js_app,
    //node_simple_app,
    node_libs_app,
];
self.auto(task);

function node_js_app(index, ck) {
    const start = self.stamp();
    const seed = 'Alice';
    const ks = new Keyring({ type: 'sr25519' });
    const pair = ks.addFromUri(`//${seed}`);

    console.log(config.color, `[${index}] ${start} Hide by protocol directly ${seed}`);

    const list = [];

    const name = `node_me`;
    const code = `
        API.anchorJS.subcribe(function(list,block){
            console.log("block : "+block);
        });
    `;
    const protocol = { 
        "type": "app",
        "fmt": "js",
        "ver":"0.0.1",
    };
    list.push({ name: name, raw: code, protocol: protocol });

    self.multi(list, () => {
        const linker=`anchor://${name}/`;
        easyRun(linker, API, (result) => {
            console.log(`-----------------result-----------------`);
            console.log(JSON.stringify(result));

            const end = self.stamp();
            console.log(config.color, `[${index}] ${end}, cost: ${end - start} ms \n ------------------------------`);
            return ck && ck();
        });
    }, index, pair);
}

function node_simple_app(index, ck) {
    const start = self.stamp();
    const seed = 'Alice';
    const ks = new Keyring({ type: 'sr25519' });
    const pair = ks.addFromUri(`//${seed}`);

    console.log(config.color, `[${index}] ${start} Hide by protocol directly ${seed}`);

    const list = [];

    const name = `node_simple`;
    const code = `console.log("This is a simple node application. No libs needed.")`;
    const protocol = { 
        "type": "app",
        "fmt": "js",
        "ver":"0.0.1",
    };
    list.push({ name: name, raw: code, protocol: protocol });

    self.multi(list, () => {
        const linker=`anchor://${name}/`;
        easyRun(linker, API, (result) => {
            console.log(`-----------------result-----------------`);
            console.log(JSON.stringify(result));

            const end = self.stamp();
            console.log(config.color, `[${index}] ${end}, cost: ${end - start} ms \n ------------------------------`);
            return ck && ck();
        });
    }, index, pair);
}

function node_libs_app(index, ck) {
    const start = self.stamp();
    const seed = 'Alice';
    const ks = new Keyring({ type: 'sr25519' });
    const pair = ks.addFromUri(`//${seed}`);

    console.log(config.color, `[${index}] ${start} Hide by protocol directly ${seed}`);

    const list = [];

    const name = `node_libs`;
    const libs=["node_polkadot","node_anchorjs","node_easy","node_koa"];
    const code = `console.log("Libs needed : ${JSON.stringify(libs)}")`;
    const protocol = { 
        "type": "app",
        "fmt": "js",
        "lib":libs,
        "ver":"0.0.1",
    };
    list.push({ name: name, raw: code, protocol: protocol });

    self.multi(list, () => {
        const linker=`anchor://${name}/`;
        easyRun(linker, API, (result) => {
            console.log(`-----------------result-----------------`);
            console.log(JSON.stringify(result));

            const end = self.stamp();
            console.log(config.color, `[${index}] ${end}, cost: ${end - start} ms \n ------------------------------`);
            return ck && ck();
        });
    }, index, pair);
}