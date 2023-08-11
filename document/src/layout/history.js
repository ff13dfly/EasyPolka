import { useEffect } from 'react';

function History(props) {

  const API=props.API;
  //console.log(API);

  useEffect(() => {
    console.log("ready to do by " + props.anchor);
  }, [props.anchor]);

  return (
    <div id='history'>
      <div id="history_list">
        <span>{props.anchor}</span>
        <ul>
          <li>3</li>
          <li>2,023</li>
          <li>9,202</li>
        </ul>
      </div>
      <div id="owner">
        5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw
      </div>
    </div>
  );
}

export default History;