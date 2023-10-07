import { Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import Navigator from './components/navigator';
import Grid from './components/grid';
import Board from './components/board';

import SystemPassword from './components/sys_password';

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
  let [callback,setCallback]= useState(()=>{});

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
      agent:(onHide)=>{
        setCallback(onHide);
      },
    },
    // update: () => {
    //   setDialogShow(false);
    // },
  }

  const self={
    clickEdit:(ev)=>{
      setEditing(!editing);
    },
    select:(id)=>{
      console.log(`Selected App Index: ${id}`);
    },
    fresh:()=>{
      RUNTIME.getApps((list) => {
        setApps(list);
      });
    },
    // setInitPass:(pass,ck)=>{
    // },
  }

  useEffect(() => {
    RUNTIME.init((ck)=>{
      const info_pass=(<p>Please set the W3OS to storage your setting on Localstorage encried by AES.<br/><br/>
        Please notes that, if skip this step, all your operation will be lost. <br/>
        The storaged setting will not include your private key.</p>);
      funs.dialog.show(<SystemPassword info={info_pass} callback={(pass)=>{
        //self.setInitPass(pass,ck);
        funs.dialog.hide();
        return ck && ck(pass);
      }}/>,"W3OS system password setting");
    },self.fresh);
  }, []);

  return (
    <div>
      <Navigator />
      <Container>
        <Board funs={funs} />
        <Grid size={size} list={apps} funs={funs} edit={editing} select={self.select}/>
        <Dialog show={show} content={content} callback={callback} title={title} update={self.fresh} />
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
