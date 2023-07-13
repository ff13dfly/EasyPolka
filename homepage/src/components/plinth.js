import { Container, Row, Col } from 'react-bootstrap';

function Plinth() {
  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="plinth">
      <Container>
        <Row>
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
            <h3>Plinth</h3>
            <p>Your Web3.0 browser</p>
          </Col>
          <Col md={8} lg={8} xl={8} xxl={8} className='pt-4'>
            
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Plinth;