import { useState, useEffect } from 'react';
import Decode from '../lib/decode';
import Favs from './favs';

function Mark(props) {
  let [value, setValue] = useState("");
  let [list, setList] = useState([]);
  let [deleting, setDeleting] = useState(false);

  let [select, setSelect] = useState(false);
  let [todo, setTodo] = useState([]);

  const self = {
    onChange: (ev) => {
      const val = ev.target.value;
      setValue(val);
    },
    onKeydown: (ev) => {
      if (ev.key === 'Enter') {
        if (deleting) return false;
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
    clearSelect: () => {
      setSelect({});
    },
    switchDelete: (ev) => {
      if (deleting) {
        const dmap = {};
        for (let i = 0; i < todo.length; i++) {
          dmap[todo[i]] = true;
        }

        const nfavs = [];
        for (let i = 0; i < list.length; i++) {
          if (!dmap[i]) {
            nfavs.push(list[i]);
          }
        }
        props.storage.setList(nfavs);
        setList(nfavs);
        setTodo([]);
      }
      const val = !deleting;
      setDeleting(val);
    },
    fresh: () => {
      const favs = props.storage.getList();
      setList(favs);
    },

    todo: (todo) => {
      //console.log(todo);
      if (deleting) {
        setTodo(todo);
      } else {
        window.location.hash = todo;
        props.reload(todo);
      }
    },
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
      <Favs list={list} deleting={deleting} todo={self.todo} all={select} />
      <div id="remove">
        <input type="checkbox"
          checked={select}
          hidden={true}
          onChange={(ev) => {
            const val = !select;
            setSelect(val);
          }} />
        <img src="icons/remove.svg" alt="" onClick={(ev) => {
          self.switchDelete(ev);
        }} />
      </div>
    </div>
  );
}

export default Mark;