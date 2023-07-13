import { Container, Row, Col, Nav } from 'react-bootstrap';

function Footer() {
  return (
    <div expand="lg" className="bg-body-tertiary pt-4" id="footer_nav">
      <Container>
        <Row>
          <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
            <Nav defaultActiveKey="/home" className="flex-column">
              <Nav.Link href="/home">Active</Nav.Link>
              <Nav.Link eventKey="link-1">Substrate</Nav.Link>
              <Nav.Link eventKey="link-2">Polkadot</Nav.Link>
              <Nav.Link eventKey="link-2">Grants</Nav.Link>
              <Nav.Link eventKey="disabled" disabled>
                Disabled
              </Nav.Link>
            </Nav>
          </Col>
          <Col md={8} lg={8} xl={8} xxl={8} className='pt-4'>

          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Footer;