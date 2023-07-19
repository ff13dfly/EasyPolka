import { Container, Row, Col, Card } from 'react-bootstrap';

function Loader() {
  return (
    <Container>

      <Row id="intro_protocol">
          <Col md={5} lg={5} xl={5} xxl={5} className='pt-4'>
            <p>With the support of Easy Protol, the application can be deployed on chain, either the frontend UI or the backend server.</p>
          </Col>
          <Col md={7} lg={7} xl={7} xxl={7} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/loader.png" />
            </Card>
          </Col>
        </Row>
      <Row className='pb-4'>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Body>
              <Card.Title>Chain Application</Card.Title>
              <Card.Text>
                One single html file.
                Easy deploy, only http server needed.
                Meanful hash.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Body>
              <Card.Title>NodeJS</Card.Title>
              <Card.Text>
                Anchor link support.
                Parameters from command line.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Loader;