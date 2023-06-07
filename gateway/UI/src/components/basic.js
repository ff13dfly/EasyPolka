import { Row, Col, Button,Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const tools = require('../lib/tools');

function Basic(props) {

  const now=props.name;
  const index=props.index;
  const storage=props.storage;
  const fresh=props.fresh;

  //console.log({now,index})
  const self={
    onChange:(ev)=>{
      storage.updateNode(ev.target.value,index);
      fresh();
    },
    onRemove:()=>{
      storage.removeNode(index);
      fresh();
    },
  }

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={9} lg={9} xl={9} xxl={9} className="pt-1">
        <Form.Control
          size="sm"
          type="text"
          value={now}
          placeholder="Hub name..."
          onChange={(ev) => {
            self.onChange(ev)
          }}
        />
      </Col>
      <Col md={3} lg={3} xl={3} xxl={3} className="pt-1 text-end">
        <Button size="sm" variant="danger" onClick={(ev) => {
          self.onRemove(ev);
        }}>Remove</Button>
      </Col>
    </Row>
  );
}
export default Basic;