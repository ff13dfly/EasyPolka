import { Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import RUNTIME from '../lib/runtime';

function ContactSetting(props) {
  const size = [12];
  const funs = props.funs;


  const self={
    
  }

  useEffect(() => {

  }, [])

  return (
    <Row>
       <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}>
        Server status: active
       </Col>
    </Row>
  );
}
export default ContactSetting;