import { useEffect } from 'react';

import Cherry from 'cherry-markdown/dist/cherry-markdown.core';
require('cherry-markdown/dist/cherry-markdown.min.css');

let cherryInstance=null;

function Content(props) {
  
  if(cherryInstance!==null){
    cherryInstance.setValue(props.link);
  }

  useEffect(() => {
    cherryInstance = new Cherry({
      id: "md_container",
      value: "loading...",
      forceAppend:true,
      editor: {
        defaultModel: 'previewOnly',
      }
    });
  }, []);

  return (
    <div>
      <div id="md_container"></div>
    </div>
  );
}

export default Content;