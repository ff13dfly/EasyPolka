import { Container, Row, Col, Nav } from 'react-bootstrap';

function Protocol() {
  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="protocol">
      <Container>
        <Row>
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
            <h3>Easy Protocol</h3>
            <p>A simple way to unit Web3.0</p>
          </Col>
          <Col md={8} lg={8} xl={8} xxl={8} className='pt-4'>
            <h3>Anchor Link</h3>
            <h3>Declared Hide</h3>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Protocol;