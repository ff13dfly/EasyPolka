import { useEffect } from 'react';
function Sub(props) {
  const list = props.data;
  const active=props.active;
  //console.log(props);
  //console.log(props);
  //console.log(active);
  useEffect(() => {

  }, []);

  return (
    <dt>
      {list.map((item, key) => (
        <dl key={key} 
          id={item.link.substring(9,item.link.length)} 
          className={active===item.link.substring(9,item.link.length)?"active":""} 
          onClick={(ev)=> {
            props.update(ev.target);
          }}>
          {item.title}
        </dl>
      ))}
    </dt>
  );
}

export default Sub;