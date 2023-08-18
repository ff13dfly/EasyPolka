import { useState,useEffect } from 'react';
import Decode from '../lib/decode';

function Mark(props) {
  let [value,setValue]=useState("");
  let [list,setList]=useState([]);

  const self={
    onChange:(ev)=>{
      const val=ev.target.value;
      setValue(val);
    },
    onKeydown:(ev)=>{
      if(ev.key==='Enter'){
        const anchor=Decode(value);
        if(anchor!==false){
          const favs=props.storage.getList();
          console.log(favs);
          const nlist=[value];
          for(let i=0;i<favs.length;i++){
            if(favs[i]!==value) nlist.push(favs[i]);
          }

          props.storage.setList(nlist);
          setList(nlist);
        }
      }
    },
    onFocus:(ev)=>{
      if(ev.target.value===""){
        setValue("anchor://");
      }
    },
    onBlur:(ev)=>{
      if(ev.target.value==="anchor://"){
        setValue("");
      }
    },
  }

  useEffect(() => {
    const favs=props.storage.getList();
    setList(favs);
  }, []);

  return (
    <div id="mark">
      <div id="search">
        <small>Such as anchor://hello</small>
        <input type="text" placeholder='Please enter Anchor Link' 
          value={value}
          onFocus={(ev)=>{self.onFocus(ev)}}
          onBlur={(ev)=>{self.onBlur(ev)}}
          onChange={(ev) => { self.onChange(ev)}}
          onKeyDown={(ev)=>{self.onKeydown(ev)}}
        />
      </div>
      <ul>
        {list.map((item, key) => (
         <li key={key} onClick={(ev)=>{
           props.reload(item);
         }}><input type="checkbox" /> {item}</li>
        ))}
      </ul>
      <div id="remove">
        <input type="checkbox" />
        <img src="icons/remove.svg" alt="" />
      </div>
    </div>
  );
}

export default Mark;