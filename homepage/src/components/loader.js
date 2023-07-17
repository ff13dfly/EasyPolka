import { Container, Row, Col, Card } from 'react-bootstrap';

function Loader() {
  return (
    <Container>
      <Row className='pb-4'>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/App_01.png" />
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
            <Card.Img variant="top" src="imgs/App_02.png" />
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