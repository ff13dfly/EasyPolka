import { useEffect, useState } from 'react';

import Cherry from 'cherry-markdown/dist/cherry-markdown.core';
require('cherry-markdown/dist/cherry-markdown.min.css');

let cherryInstance = null;
function Content(props) {

  let [anchor, setAnchor] = useState("");

  const API = props.API;
  const anchorJS = API.AnchorJS;
  const dot = API.Polkadot;

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
    if (cherryInstance === null) {
      cherryInstance = new Cherry({
        id: "md_container",
        value: "loading...",
        forceAppend: true,
        editor: {
          defaultModel: 'previewOnly',
        }
      });
    }
    //console.log(props.link);
    if(props.link){
      API.Easy.easyRun(props.link, startAPI, (res) => {
        if (res.error.length !== 0) return cherryInstance.setValue(`${props.link}:\n${JSON.stringify(res.error)}`);
        const data = res.data[`${res.location[0]}_${res.location[1]}`];
        cherryInstance.setValue(data.raw);
        window.scrollTo(0, 0);
        setAnchor(res.location[0]);
      });
    }    
  }, [props.link, props.websocket]);

  return (
    <div id="md_container" anchor={anchor}></div>
  );
}

export default Content;