import { useEffect } from 'react';
function Nav(props) {

  const list = props.data;
  const active=props.active;
  console.log(active);
  useEffect(() => {

  }, []);

  return (
    <ul>
      {list.map((item, key) => (
        <li key={key} 
          id={item.link.substring(9,item.link.length)} 
          className={active===item.link.substring(9,item.link.length)?"active":""} 
          onClick={(ev) => {
            props.update(ev.target,item.link);
          }}>
        {item.title}
        </li>
      ))}
    </ul>
  );
}

export default Nav;