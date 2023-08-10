import { useEffect } from 'react';

function History(props) {

  const API=props.API;
  //console.log(API);

  useEffect(() => {
    console.log("ready to do by " + props.anchor);
  }, [props.anchor]);

  return (
    <div id='history'></div>
  );
}

export default History;