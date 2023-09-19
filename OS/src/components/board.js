import { Row,Col } from 'react-bootstrap';

function Board(props) {
  const size=[9,3];
  return (
    <Row className='pb-2'>
      <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]} className='pt-4'>
        BTC trend
      </Col>
      <Col xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]} className='pt-4'>
        Network status
      </Col>
    </Row>
  );
}
export default Board;