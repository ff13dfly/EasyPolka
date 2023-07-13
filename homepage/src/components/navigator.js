import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';

function Navigator() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Anchor Network</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Protocol</Nav.Link>
            <Nav.Link href="#link">Loader</Nav.Link>
            <NavDropdown title="Development" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.2">
                AnchorJS
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Playground</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Convertor
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Gateway
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigator;