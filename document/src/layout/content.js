import { useEffect, useState } from 'react';
//import Comment from './comment';
import History from './history';

import Cherry from 'cherry-markdown/dist/cherry-markdown.core';
require('cherry-markdown/dist/cherry-markdown.min.css');

let websocket = null;
let cherryInstance=null;
function Content(props) {

  let [anchor, setAnchor ]= useState("");

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
      //console.log(props.link);
      //if(cherryInstance!==null) cherryInstance.setValue('loading...');
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
      if(!props.link) return false;
      
      
      API.Easy.easyRun(props.link, startAPI, (res) => {
        if (res.error.length !== 0) return cherryInstance.setValue(`${props.link}:\n${JSON.stringify(res.error)}`);
        const data = res.data[`${res.location[0]}_${res.location[1]}`];
        cherryInstance.setValue(data.raw);
        window.scrollTo(0, 0);
        console.log(res.location[0]);
        setAnchor(res.location[0]);
        
        setTimeout(() => {
          //window.location.hash=target;
          //const tps = cherryInstance.getToc();
          //props.update(tps);
        }, 50);
      });
    });
  }, [props.link]);

  return (
    <div>
      <History API={API} anchor={anchor}/>
      <div id="md_container" anchor={anchor}></div>
      {/* <Comment /> */}
    </div>
  );
}

export default Content;