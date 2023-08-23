import { useState, useEffect } from 'react';

function Favs(props) {
  let [index,setIndex]=useState(0);
  let [select, setSelect] = useState({});
  //let [empty, setEmpty] = useState(true);

  const self={
    fresh:()=>{
      index++;
      setIndex(index);
    },
    empty:(map)=>{
      for(var k in map) if(map[k]) return false;
      return true;
    },
  }

  useEffect(() => {
    setSelect({});
    self.fresh();
  }, [props.list]);

  return (
    <ul index={index}>
      {props.list.map((item, key) => (
        <li key={key}>
          <input type="checkbox"
            hidden={!props.deleting}
            checked={!select[`key_${key}`]?false:select[`key_${key}`]}
            onChange={(ev) => {
              select[`key_${key}`] = !select[`key_${key}`];
              self.fresh();

              const todo=[];
              for(var k in select){
                if(select[k]===true){
                  const arr=k.split('_');
                  todo.push(parseInt(arr[1]));
                }
              }
              props.todo(todo);
            }}
          />
          <span onClick={(ev) => {
            if (props.deleting) {
              select[`key_${key}`] = !select[`key_${key}`];
              self.fresh();

              const todo=[];
              for(var k in select){
                if(select[k]===true){
                  const arr=k.split('_');
                  todo.push(parseInt(arr[1]));
                }
              }
              props.todo(todo);
            } else {
              props.todo(item);
            }
          }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default Favs;