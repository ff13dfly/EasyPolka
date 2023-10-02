import { Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import Navigator from './components/navigator';
import Grid from './components/grid';
import Board from './components/board';
import Dialog from './layout/dialog';

import Device from './lib/device';
import RUNTIME from './lib/runtime';

const size = Device.grids();

function App() {
  let [ctx_stage, setStageContent] = useState("");
  let [ctx_mask, setMaskContent] = useState("");
  let [ctx_page, setPageContent] = useState("");

  let [show, setDialogShow] = useState(false);
  let [content, setContent] = useState("");
  let [title, setTitle] = useState("");
  //let [callback,setCallback]= useState(()=>{});

  let [editing, setEditing] = useState(false);

  let [apps, setApps] = useState([[]]);

  const funs = {
    stage: (ctx) => {
      setStageContent(ctx);
    },
    mask: (ctx) => {
      setMaskContent(ctx);
    },
    page: (ctx) => {
      setPageContent(ctx);
    },
    dialog: {
      show: (ctx, title) => {
        //console.log("here:"+show);
        setContent(ctx);
        if (title) setTitle(title);
        setDialogShow(true);
      },
      hide: (ck) => {
        setDialogShow(false);
        return ck && ck();
      },
    },
    update: () => {
      setDialogShow(false);
    },
  }

  const self={
    clickEdit:(ev)=>{
      setEditing(!editing);
    },
  }

  useEffect(() => {
    RUNTIME.getApps((list) => {
      setApps(list);
    });
  }, []);

  return (
    <div>
      <Navigator />
      <Container>
        <Board funs={funs} />
        <Grid size={size} list={apps} funs={funs} edit={editing}/>
        <Dialog show={show} content={content} title={title} update={funs.update} />
      </Container>
      {ctx_stage}
      {ctx_mask}
      {ctx_page}
      <div className="opts">
        {/* <img src="icons/edit.svg" className='opt_button' alt="" /> */}
        <img src="icons/remove.svg" className='opt_button' alt="" onClick={(ev)=>{
          self.clickEdit(ev)
        }}/>
      </div>
    </div>
  );
}

export default App;
