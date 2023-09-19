import { Container, Navbar, Form, Button, Row, Col } from 'react-bootstrap';
function Navigator() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary pb-4">
      <Container>
        <Navbar.Brand href="#home">W<span className='logo'>3</span>OS</Navbar.Brand>
        <Row>
          <Col lg={9} xs={9} className="pt-2" >
            <Form.Control
              size="md"
              type="text"
              placeholder="Anchor name..."
              onChange={(ev) => { }}
              onKeyDown={(ev) => { }}
            />
          </Col>
          <Col lg={3} xs={3} className="pt-2 text-end" >
            <Button variant="default">+</Button>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
}

export default Navigator;