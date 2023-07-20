import { Container, Row, Col } from 'react-bootstrap';

function Plinth() {
  const cmap={
    background:'url("imgs/plinth.jpg") no-repeat center center',
    'background-size': 'cover',
    'min-height':'600px',
  };
  const cols={
    left:3,
    mid:4,
    right:5,
  }

  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="plinth" style={cmap}>
      <Container>
        <Row className='pt-4'>
        <Col md={cols.right} lg={cols.right} xl={cols.right} xxl={cols.right} className='pt-4'>
            <h4>The Web3.0 Entry</h4>
            <p>You can load it anywhere</p>
            <h4>Full On Chain</h4>
            <p>You can load it anywhere</p>
            <h4>Simple To Understand</h4>
            <p>You can load it anywhere</p>
          </Col>
          
          <Col md={cols.mid} lg={cols.mid} xl={cols.mid} xxl={cols.mid} className='pt-4'></Col>
          <Col md={cols.left} lg={cols.left} xl={cols.left} xxl={cols.left} className='pt-4'>
            <h3>Plinth</h3>
            <p>Your Web3.0 browser</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Plinth;