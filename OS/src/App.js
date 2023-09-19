import { Container } from 'react-bootstrap';

import Navigator from './components/navigator';
import Grid from './components/grid';
import Board from './components/board';

import Device from './lib/device';
import list from './data';

const size = Device.grids();

function App() {
  return (
    <div>
      <Navigator />
      <Container>
        <Board />
        <Grid size={size} list={list} />
      </Container>
    </div>
  );
}

export default App;
