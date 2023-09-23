import { Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import RUNTIME from '../lib/runtime';

function Contact_List(props) {
  const size = [12, 12];

  let [contact, setContact] = useState({});
  //console.log(contact);
  useEffect(() => {
    RUNTIME.getContact((res) => {
      setContact(res);
    });
  }, [contact])

  return (
    <Row>
      {Object.keys(contact).map((address, index) => (
        <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} key={index}>
          <Row>
            <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
              className="pt-2">
              {address}
            </Col>
            <Col xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]}
              className="pt-2 text-end">
              @{contact[address].network}
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
export default Contact_List;