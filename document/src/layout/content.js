import { useEffect } from 'react';

import Cherry from 'cherry-markdown/dist/cherry-markdown.core';
require('cherry-markdown/dist/cherry-markdown.min.css');

let websocket = null;
let cherryInstance=null;
function Content(props) {

  const API = props.API;
  const anchorJS = API.AnchorJS;
  const dot = API.Polkadot;
  const self = {
    auto: (ck) => {
      if (websocket !== null) return ck && ck();
      const server = props.config && props.config.server ? props.config.server : "wss://dev.metanchor.net";
      dot.ApiPromise.create({ provider: new dot.WsProvider(server) }).then((api) => {
        websocket = api;
        anchorJS.set(api);
        return ck && ck();
      });
    },
  }

  useEffect(() => {
    const startAPI = {
      common: {
        "latest": anchorJS.latest,
        "target": anchorJS.target,
        "history": anchorJS.history,
        "owner": anchorJS.owner,
        "subcribe": anchorJS.subcribe,
        "block": anchorJS.block,
      }
    };
    self.auto(() => {
      if(!props.link) return false;
      if(cherryInstance===null){
        cherryInstance = new Cherry({
          id: "md_container",
          value: "loading...",
          forceAppend: true,
          editor: {
            defaultModel: 'previewOnly',
          }
        });
      }
      
      API.Easy.easyRun(props.link, startAPI, (res) => {
        if (res.error.length !== 0) return cherryInstance.setValue(JSON.stringify(res.error));
        const data = res.data[`${res.location[0]}_${res.location[1]}`];
        cherryInstance.setValue(data.raw);
        window.scrollTo(0, 0);
        
        setTimeout(() => {
          //window.location.hash=target;
          //const tps = cherryInstance.getToc();
          //props.update(tps);
        }, 50);
      });
    });
  }, [props.link]);

  return (
    <div id="md_container"></div>
  );
}

export default Content;