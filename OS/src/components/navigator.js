import { Container, Navbar, Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import RUNTIME from '../lib/runtime';

function Navigator() {

  let [name,setName]=useState("");
  let [map,setMap]=useState({});

  const self={
    onChange:(ev)=>{
      setMap({background:"#FFFFFF"});
      setName(ev.target.value);
    },
    onClick:(ev)=>{
      RUNTIME.getAPIs((APIs)=>{
        APIs.AnchorJS.search(name,(res)=>{
          if(res===false){
            return setMap({background:"#d7a3a3"});
          }

          console.log(res);
        });
      });
    },
  }

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
              style={map}
              onChange={(ev) => {self.onChange(ev)}}
            />
          </Col>
          <Col lg={3} xs={3} className="pt-2 text-end" >
            <Button variant="default" onClick={(ev)=>{
              self.onClick(ev);
            }}>+</Button>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
}

export default Navigator;