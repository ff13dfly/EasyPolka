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
            <Nav.Link href="#anchor">Anchor</Nav.Link>
            <Nav.Link href="#plinth">Plinth</Nav.Link>
            <Nav.Link href="#protocol">Protocol</Nav.Link>
            <NavDropdown title="Demo" id="basic-nav-dropdown">
              <NavDropdown.Item href="https://polkadot.js.org/apps/?rpc=wss://dev.metanchor.net">Dev Network</NavDropdown.Item>
              <NavDropdown.Item href="https://playground.metanchor.net">Playground</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="https://plinth.metanchor.net">Plinth</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="https://gateway.metanchor.net">Gateway UI</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Github" id="basic-nav-dropdown">
            <NavDropdown.Item href="https://github.com/ff13dfly/Anchor">
                Anchor Pallet
              </NavDropdown.Item>
              <NavDropdown.Item href="https://github.com/ff13dfly/EasyPolka/tree/main/anchorJS">
                AnchorJS
              </NavDropdown.Item>
              <NavDropdown.Item href="https://playground.metanchor.net">Playground</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="https://github.com/ff13dfly/plinth">
                Plinth
              </NavDropdown.Item>
              <NavDropdown.Item href="https://github.com/ff13dfly/EasyPolka/tree/main/protocol">
                Easy Protocol
              </NavDropdown.Item>
              <NavDropdown.Item href="https://github.com/ff13dfly/EasyPolka/tree/main/loader">
                Loader
              </NavDropdown.Item>
              <NavDropdown.Item href="https://github.com/ff13dfly/EasyPolka/tree/main/convertor">
                Convertor
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="https://github.com/ff13dfly/EasyPolka/tree/main/gateway/UI">
                Gateway UI
              </NavDropdown.Item>
              <NavDropdown.Item href="https://github.com/ff13dfly/EasyPolka/tree/main/gateway/hub">
                Gateway Hub
              </NavDropdown.Item>
              <NavDropdown.Item href="https://github.com/ff13dfly/EasyPolka/tree/main/gateway/vservice">
                Gateway Service
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigator;