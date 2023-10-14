import { Row, Col } from 'react-bootstrap';
import { useState,useEffect } from 'react';
import tools from '../lib/tools';

import RUNTIME from '../lib/runtime';
import Copy from '../lib/clipboard';

function ContactTitle(props) {
  const size=[8,4];
  let [clip, setClip] = useState("Copy");
  let [disable, setDisable] = useState(false);

  const address=props.address;
  const self={
    change:(ev)=>{
      //setAddress(ev.target.value);
    },
    click:(acc)=>{
      Copy(acc);
      setClip("Done");
      setDisable(true);
      setTimeout(()=>{
        setDisable(false);
        setClip("Copy");
      },1000);
    },
  };

  useEffect(() => {
  }, [])

  return (
    <Row>
      <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}>
        {tools.shorten(address,6)}
      </Col>
      <Col className='text-end' xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]}>
        <button className='btn btn-sm btn-primary' disabled={disable} onClick={(ev)=>{
          self.click(address);
        }}>{clip}</button>
      </Col>
    </Row>
  );
}
export default ContactTitle;