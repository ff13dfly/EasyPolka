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
  let [callback, setCallback] = useState(() => { });

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
      agent: (onHide) => {
        setCallback(onHide);
      },
    },
  }

  const self = {
    clickEdit: (ev) => {
      setEditing(!editing);
    },
    select: (id) => {
      console.log(`Selected App Index: ${id}`);
    },
    login: (ctx, title) => {
      RUNTIME.init((ck) => {
        funs.dialog.show(<SystemPassword info={ctx} callback={(pass) => {
          funs.dialog.hide();
          return ck && ck(pass);
        }} />, title);

      }, self.fresh);
    },
    fresh: () => {
      RUNTIME.getApps((list) => {
        if (list === false) {
          setTimeout(() => {
            const info = (<p>Error password, please try again.</p>);
            const title = "System password";
            self.login(info, title);
          }, 500);
          return false;
        }
        setApps(list);
      });
    },
  }

  useEffect(() => {
    const info = (<p>Please set the W3OS to storage your setting on Localstorage encried by AES.<br /><br />
      Please notes that, if skip this step, all your operation will be lost. <br />
      The storaged setting will not include your private key.</p>);
    const sys_title = "W3OS system password setting";
    self.login(info, sys_title);
  }, []);

  return (
    <div>
      <Navigator />
      <Container>
        <Board funs={funs} />
        <Grid size={size} list={apps} funs={funs} edit={editing} select={self.select} />
        <Dialog show={show} content={content} callback={callback} title={title} funs={funs} />
      </Container>
      {ctx_stage}
      {ctx_mask}
      {ctx_page}
      <div className="opts">
        {/* <img src="icons/edit.svg" className='opt_button' alt="" /> */}
        <img src="icons/remove.svg" className='opt_button' alt="" onClick={(ev) => {
          self.clickEdit(ev)
        }} />
        <img src="icons/fin.svg" hidden={RUNTIME.isLogin()} className='opt_button' alt="" onClick={(ev) => {
          const info = (<p>Please input the system password.</p>);
          const title = "System Login";
          self.login(info, title);
        }} />
      </div>
    </div>
  );
}

export default App;
