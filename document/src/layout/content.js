import { useEffect } from 'react';

import Cherry from 'cherry-markdown';

function Content(props) {
  console.log(props.data);
  useEffect(() => {
    const cherryInstance = new Cherry({
      id: "md_container",
      value: props.data,
      forceAppend:true,
    });
    const tree=cherryInstance.getToc();
    props.update(tree);
  }, []);

  return (
    <div id="md_container"></div>
  );
}

export default Content;