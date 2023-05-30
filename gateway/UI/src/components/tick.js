import { Row, Col, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

function Tick(props) {
  const show=props.show;
  const exp=props.expired;
  useEffect(() => {

  }, []);

  return (
    <Row hidden={!show}>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        Authority expired time. {exp}
      </Col>
    </Row>
  );
}
export default Tick;