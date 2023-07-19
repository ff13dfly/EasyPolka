import { Container, Row, Col,Card } from 'react-bootstrap';

function Sample() {
  return (
    <Container>
      <Row id="intro_gateway">
          <Col md={12} lg={12} xl={12} xxl={12} className='pt-4'>
            <p>With the support of Easy Protol, the application can be deployed on chain, either the frontend UI or the backend server.</p>
          </Col>
        </Row>
      <Row className='pb-4'>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/gateway_ui.jpg" />
            <Card.Body>
              <Card.Title>Gateway UI</Card.Title>
              <Card.Text>
                The UI of Gateway.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/gateway_hub.jpg" />
            <Card.Body>
              <Card.Title>Gate Hub</Card.Title>
              <Card.Text>
                Exposed entry.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/gateway_vservice.jpg" />
            <Card.Body>
              <Card.Title>Gateway vService</Card.Title>
              <Card.Text>
                Function modules, implement the ideas.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Sample;