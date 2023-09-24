
const { ApiPromise, WsProvider } = require('@polkadot/api');

const provider = new WsProvider("ws://127.0.0.1:9944");
ApiPromise.create({ provider: provider }).then((wsAPI) => {
    //console.log(wsAPI);
    const block=468664;
    wsAPI.rpc.chain.getBlockHash(block,(res)=>{
        const hash = res.toHex();
        wsAPI.rpc.chain.getBlock(hash).then((dt) => {
            wsAPI.query.system.events.at(hash,(evs)=>{
                console.log(evs);
            })
			// if (dt.block.extrinsics.length === 1) return ck && ck(false);
			// wsAPI.query.system.events.at(hash,(evs)=>{
			// 	const exs = self.filter(dt, 'setAnchor',self.status(evs),!cfg?undefined:cfg);
			// 	if(exs.length===0) return ck && ck(false);
			// 	if(anchor===undefined) return ck && ck(exs);
				
			// 	var data=null;
			// 	for(let i=0;i<exs.length;i++){
			// 		var ex=exs[i],row=ex.args;
			// 		if(row.key.substr(0, 2).toLowerCase() === '0x') row.key=self.decodeUTF8(row.key);
			// 		if(row.key.toLowerCase()===anchor){
			// 			data=row;
			// 			data.signer=ex.owner;
            //             data.stamp=parseInt(ex.stamp);
			// 		}
			// 	}
			// 	if(data===null) return ck && ck(false);
			// 	return ck && ck(self.decor(data));
			// });
		});
    });

    // wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
    //     console.log(lastHeader);
    // });
});