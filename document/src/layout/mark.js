import { useState, useEffect } from 'react';
import Decode from '../lib/decode';

function Mark(props) {
  let [value, setValue] = useState("");
  let [list, setList] = useState([]);
  let [deleting, setDeleting] = useState(false);

  let [select, setSelect] = useState([]);

  const self = {
    onChange: (ev) => {
      const val = ev.target.value;
      setValue(val);
    },
    onKeydown: (ev) => {
      if (ev.key === 'Enter') {
        if(deleting) return false;
        const anchor = Decode(value);
        if (anchor !== false) {
          const favs = props.storage.getList();
          //console.log(favs);
          const nlist = [value];
          for (let i = 0; i < favs.length; i++) {
            if (favs[i] !== value) nlist.push(favs[i]);
          }

          props.storage.setList(nlist);
          setList(nlist);
        }
      }
    },
    onFocus: (ev) => {
      if (ev.target.value === "") {
        setValue("anchor://");
      }
    },
    onBlur: (ev) => {
      if (ev.target.value === "anchor://") {
        setValue("");
      }
    },
    switchDelete: (ev) => {
      if (!deleting) {
        setSelect(new Array(list.length).fill(false));
        //console.log(select);
      } else {
        console.log(select);
        //return false;
        const nfavs = [];
        for(let i=0;i<select.length;i++){
          if(select[i]===false){
            nfavs.push(list[i]);
          }
        }
        props.storage.setList(nfavs);
        setList(nfavs);
        setSelect([]);
        self.fresh();
      }

      setDeleting(!deleting);
    },
    onClick: (ev, key, item) => {
      if (deleting) {
        setSelect(select);
      } else {
        //console.log(item);
        window.location.hash = item;
        props.reload(item);
      }
    },
    fresh: () => {
      const favs = props.storage.getList();
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
          onFocus={(ev) => { self.onFocus(ev) }}
          onBlur={(ev) => { self.onBlur(ev) }}
          onChange={(ev) => { self.onChange(ev) }}
          onKeyDown={(ev) => { self.onKeydown(ev) }}
        />
      </div>
      <ul>
        {list.map((item, key) => (
          <li key={key}>
            <input type="checkbox"
              hidden={!deleting}
              onChange={(ev) => {
                select[key] = !select[key];
              }}
            />
            <span onClick={(ev) => {
              self.onClick(ev, key, item);
            }}>{item}</span>
          </li>
        ))}
      </ul>
      <div id="remove">
        {/* <input type="checkbox" hidden={!deleting} /> */}
        <img src="icons/remove.svg" alt="" onClick={(ev) => {
          self.switchDelete(ev);
        }} />
      </div>
    </div>
  );
}

export default Mark;