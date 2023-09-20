import { Row,Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';


function Overview(props) {
  const anchor=props.link;

  useEffect(()=> {
    console.log(anchor);
  },[anchor]);

  return (
    <Row>
      <Col>{anchor}</Col>
      <Col></Col>
    </Row>
  );
}
export default Overview;