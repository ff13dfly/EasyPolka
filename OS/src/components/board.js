import { Row,Col } from 'react-bootstrap';

function Board(props) {
  const size=[7,5];
  return (
    <div className="board">
      <Row>
        <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}>
          BTC/USDT 25,200
          ETH/USDT 2,312
        </Col>
        <Col xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]}>
          Network status 
        </Col>
      </Row>
    </div>
  );
}
export default Board;