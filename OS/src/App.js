import { Container } from 'react-bootstrap';
import { useEffect,useState} from 'react';

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
  let [show,setDialogShow] = useState(false);
  let [apps,setApps]= useState([[]]);

  const funs={
    stage:(ctx)=>{
      setStageContent(ctx);
    },
    mask:(ctx)=>{
      setMaskContent(ctx);
    },
    page:(ctx)=>{
      setPageContent(ctx);
    },
    fresh:()=>{

    },
  }

  useEffect(()=>{
    RUNTIME.getApps((list)=>{
      setApps(list);
    });
  },[]);

  return (
    <div>
      <Navigator />
      <Container>
        <Board />
        <Grid size={size} list={apps} funs={funs}/>
        <Dialog show={show}/>
      </Container>
      {ctx_stage}
      {ctx_mask}
      {ctx_page}
    </div>
  );
}

export default App;
