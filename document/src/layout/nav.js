import { useEffect } from 'react';
import Sub from './sub';

function Nav(props) {

  const list = props.data;
  const active=props.active;
  useEffect(() => {

  }, []);

  return (
    <ul>
      {list.length===0?(<li>Empty index</li>):list.map((item, key) => (
        <li key={key} 
          id={item.link.substring(9,item.link.length)} 
          className={active===item.link.substring(9,item.link.length)?"active":""} 
          onClick={(ev) => {
            props.update(ev.target);
          }}>
          {item.title}
          <Sub data={item.children} active={active} update={props.update} />
        </li>
      ))}
    </ul>
  );
}

export default Nav;