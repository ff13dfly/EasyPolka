import { useState,useEffect } from 'react';
import Decode from '../lib/decode';

function Mark(props) {
  let [value,setValue]=useState("");
  let [list,setList]=useState([]);
  let [deleting,setDeleting]=useState(false);

  let todo=[];
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
    switchDelete:(ev)=>{
      if(!deleting){
        //set the select state

      }else{
        console.log(todo);

        //remove target storage;
        const map={},nfavs=[];
        for(let i=0;i<todo.length;i++){
          map[todo[i]]=true;
        }
        
        for(let i=0;i<list.length;i++){
          if(!map[i]) nfavs.push(list[i]);
        }
        //onsole.log(nfavs);

        props.storage.setList(nfavs);

        todo=[];
        self.fresh();
      }
      setDeleting(!deleting);
    },
    onClick:(ev,key,item)=>{
      if(deleting){
        const ntodo=[];
        let exsist=false;
        for(let i=0;i<todo.length;i++){
          const row=todo[i];
          if(row===key){
            exsist=true;
          }else{
            ntodo.push(row);
          } 
        }
        if(!exsist) ntodo.push(key);
        todo=ntodo;
        return false;
      }else{
        //console.log(item);
        window.location.hash=item;
        props.reload(item);
      }
    },
    fresh:()=>{
      const favs=props.storage.getList();
      setList(favs);
    }
  }

  useEffect(() => {
    self.fresh();
    
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
         <li key={key} 
            onClick={(ev)=>{
              self.onClick(ev,key,item);
            }}
          >
          <input type="checkbox" hidden={!deleting} onChange={(ev)=>{
         }}/>{item}</li>
        ))}
      </ul>
      <div id="remove">
        {/* <input type="checkbox" hidden={!deleting} /> */}
        <img src="icons/remove.svg" alt="" onClick={(ev)=>{
          self.switchDelete(ev);
        }} />
      </div>
    </div>
  );
}

export default Mark;