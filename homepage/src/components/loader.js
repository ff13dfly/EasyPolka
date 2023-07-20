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
              <Card.Title>Frontend</Card.Title>
              <Card.Text>
                By deploy the loader of frontend, you can run Anchor application directly by html hash.
                It is a simple way, the url as follow :

              </Card.Text>
              <section id="code_shell">
                loader.html#hello@wss://dev.metanchor.net
              </section>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <Card>
            <Card.Body>
              <Card.Title>Backend</Card.Title>
              <Card.Text>
                The backend need NodeJS support, please make sure your system can run NodeJS properly.
              </Card.Text>
              <section id="code_node">
                node loader.js anchor://hello/
              </section>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Loader;