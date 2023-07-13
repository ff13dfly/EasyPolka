import { Container, Row, Col, Card } from 'react-bootstrap';

function Loader() {
  return (
    <Container>
      <Row className='pb-4'>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/point_01.png" />
            <Card.Body>
              <Card.Title>Chian Application</Card.Title>
              <Card.Text>
                Load application on chain directly.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/point_01.png" />
            <Card.Body>
              <Card.Title>NodeJS</Card.Title>
              <Card.Text>
                Easy way to run on-chian nodeJS application.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Loader;