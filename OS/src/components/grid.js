import { Row } from 'react-bootstrap';
import Cell from './cell';

const sum = 12;
let page = 0;

function Grid(props) {
  const size = props.size;
  const list = props.list;

  console.log(size);
  console.log(list);

  const num = Math.floor(sum / size[0]);

  return (
    <Row className='pb-2'>
      {list[page].map((row, index) => (
        <Cell size={num} key={index} data={row} />
      ))}
    </Row>
  );
}
export default Grid;