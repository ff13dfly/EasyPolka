import { Container,Row,Col,Button,Form } from 'react-bootstrap';
import { useState,useEffect } from 'react';

import Search from './components/search';
import List from './components/list';
import Verify from './components/verify';


function App() {

  useEffect(() => {

  });
  return (
    <Container>
      <Row>
        <Col md={6} lg={6} xl={6} xxl={6} className="pt-2">
          <h5 className="pt-2">Gateway UI</h5>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
          <Form.Control 
            size="md" 
            type="text" 
            placeholder="Gateway URI to add..." 
            onChange={(ev) => { }} 
            onKeyDown={(ev)=>{}}
          />
        </Col>
        <Col md={2} lg={2} xl={2} xxl={2} className="pt-2 text-end">
          <Button>Add</Button>
        </Col>
        <Col md={12} lg={12} xl={12} xxl={12}><hr /></Col>
      </Row>
      <Row>
        <Col md={3} lg={3} xl={3} xxl={3} className="pt-2">
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Form.Select onChange={(ev) => {}} >
                <option value="http://localhost:8001" key="1">Gateway Node A</option>
                <option value="http://localhost:8002" key="2">Gateway Node B</option>
                <option value="http://localhost:8003" key="3">Gateway Node C</option>
              </Form.Select>
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Verify />
            </Col>
          </Row>
        </Col>
        <Col md={9} lg={9} xl={9} xxl={9} className="pt-2">
          <Row>
            <Col md={4} lg={4} xl={4} xxl={4} className="pt-2"></Col>
            <Col md={6} lg={6} xl={6} xxl={6} className="pt-2">
              <Search />
            </Col>
            <Col md={2} lg={2} xl={2} xxl={2} className="pt-2 text-end">
              <Button>Dock</Button>
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <List />
            </Col>
          </Row>
          
        </Col>
      </Row>
    </Container>
  );
}

export default App;
