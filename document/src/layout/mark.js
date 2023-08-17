import { useState,useEffect } from 'react';

function Mark(props) {
  let [value,setValue]=useState("");

  const self={
    onChange:(ev)=>{
      const val=ev.target.value;
      setValue(val);
    },
    onKeydown:(ev)=>{
      if(ev.key==='Enter'){
        console.log('enter pressed.');
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
          onFocus={()=>{
            setValue("anchor://");
          }}
          onBlur={(ev)=>{
            if(ev.target.value==="anchor://"){
              setValue("");
            }
          }}
          onChange={(ev) => { self.onChange(ev)}}
          onKeyDown={(ev)=>{self.onKeydown(ev)}}
        />
      </div>
      <ul>
        <li>aaa <small>203</small></li>
        <li>bbb <small>3,323</small></li>
        <li>ccc <small>1,239</small></li>
      </ul>
    </div>
  );
}

export default Mark;