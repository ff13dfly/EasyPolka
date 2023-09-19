import { Container } from 'react-bootstrap';
import { useEffect,useState} from 'react';

import Navigator from './components/navigator';
import Grid from './components/grid';
import Board from './components/board';



import Device from './lib/device';
import list from './data';

const size = Device.grids();

function App() {
  let [ctx_stage, setStageContent] = useState("");
  let [ctx_mask, setMaskContent] = useState("");

  const funs={
    stage:(ctx)=>{
      setStageContent(ctx);
    },
    mask:(ctx)=>{
      setMaskContent(ctx);
    },
  }

  return (
    <div>
      <Navigator />
      <Container>
        <Board />
        <Grid size={size} list={list} funs={funs}/>
      </Container>
      {ctx_stage}
      {ctx_mask}
    </div>
  );
}

export default App;
