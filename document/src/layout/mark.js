import { useState,useEffect } from 'react';
import Decode from '../lib/decode';

function Mark(props) {
  let [value,setValue]=useState("");

  const self={
    onChange:(ev)=>{
      const val=ev.target.value;
      setValue(val);
    },
    onKeydown:(ev)=>{
      if(ev.key==='Enter'){
        const anchor=Decode(value);
        if(anchor!==false){

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
        <li>anchor://abc</li>
        <li>anchor://abc/234</li>
        <li>anchor://ddd/333</li>
      </ul>
    </div>
  );
}

export default Mark;