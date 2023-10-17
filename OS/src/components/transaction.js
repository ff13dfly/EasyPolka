import { Row, Col } from 'react-bootstrap';
import { useState,useEffect } from 'react';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';

function Transaction(props) {
  const size={
    row:[12],
  };
  const block=props.block;
  const hash=props.hash;

  const self={
    
  };

  useEffect(() => {

  }, [])

  return (
    <Row className='pt-1'>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        Transaction details.
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea name="" cols="40" rows="3" disabled={true} defaultValue={block}></textarea>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea name="" cols="40" rows="3" disabled={true} defaultValue={hash}></textarea>
      </Col>
    </Row>
  );
}
export default Transaction;