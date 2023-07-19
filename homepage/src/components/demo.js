import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function Demo() {
  return (
    <Container id="anchor">
      <Row className='pb-4'>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/d_plinth.jpg" />
            <Card.Body>
              <Card.Title>Plinth</Card.Title>
              <Card.Text>
                Browser on Anchor network,only tool you need to explorer Web3.0
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/d_freesaying.jpg" />
            <Card.Body>
              <Card.Title>FreeSaying</Card.Title>
              <Card.Text>
                Social App base on Anchor network totally. Free module of Anchor Network.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/d_vbw.jpg" />
            <Card.Body>
              <Card.Title>Virtual Block World</Card.Title>
              <Card.Text>
                A total Web3.0 virtual world, even the world structure.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Demo;