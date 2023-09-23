import { Row, Col,Form,Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';



function Contact_Add(props) {
  const size=[10,2];

  useEffect(() => {
    //const startY=Device.getStart(id);
    //console.log(startY);
  }, [])

  return (

    <Row>
      <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
       className="pt-2">
        <Form.Control
              size="md"
              type="text"
              placeholder="Address ..."
              onChange={(ev) => {}}
            />
      </Col>
      <Col xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]}
       className="pt-2 text-end">
          <Button variant="default" onClick={(ev)=>{
              
          }}>+</Button>
      </Col>
    </Row>
  );
}
export default Contact_Add;