import { Container, Row, Col,Card,Button } from 'react-bootstrap';

function Sample() {
  return (
    <Container>
      <Row className='pb-4'>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/point_01.png" />
            <Card.Body>
              <Card.Title>Gateway UI</Card.Title>
              <Card.Text>
                The UI of Gateway.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/point_01.png" />
            <Card.Body>
              <Card.Title>Gate Hub</Card.Title>
              <Card.Text>
                Exposed entry.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/point_01.png" />
            <Card.Body>
              <Card.Title>Gateway vService</Card.Title>
              <Card.Text>
                Function modules, implement the ideas.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Sample;