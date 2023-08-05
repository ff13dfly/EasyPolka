import { useEffect, useState } from 'react';
function Nav(props) {

  let [subs, setSubs] = useState([]);
  const list = props.data;
  
  const ss=[];
  for(let i=0;i<list.length;i++)ss.push("");

  useEffect(() => {
    
  }, []);

  return (
    <ul>
      {list.map((item, key) => (
        <li key={key} onClick={() => {
          props.update(item.link);
        }}>{item.title}</li>
      ))}
    </ul>
  );
}

export default Nav;