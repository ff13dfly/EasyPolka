import { Container, Row, Col } from 'react-bootstrap';

function Gateway() {
  const cmap={
    background:'url("imgs/gateway.jpg") no-repeat center center',
    'backgroundSize': 'cover',
    'minHeight':'600px',
  };
  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="gateway" style={cmap}>
      <Container>
        <Row>
          
          <Col md={8} lg={8} xl={8} xxl={8} className='pt-4'>
            <h3>Gateway Micro-service</h3>
            <p>The micro-server framework on Anchor network.</p>
            <p>Three parts: UI, Hub and vService.</p>
          </Col>
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
            
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Gateway;