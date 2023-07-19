import { Container, Row, Col, Nav } from 'react-bootstrap';


function Protocol() {

  const cmap={
    background:'url("imgs/protocol.jpg") no-repeat center center',
    'background-size': 'cover',
    'min-height':'600px',
  };

  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="protocol" style={cmap}>
      <Container>
        <Row>
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
            <h3>Easy Protocol</h3>
            <p>A simple protocol to group Web3.0 resource.</p>
          </Col>
          <Col md={8} lg={8} xl={8} xxl={8} className='pt-4'>
            <h4>Self Bootstrap</h4>
            <h4>Anchor Link</h4>
            <h4>Declared Hide</h4>
          </Col>
        </Row>
        
      </Container>
    </div>
  );
}
export default Protocol;