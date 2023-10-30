import { Row, Col } from 'react-bootstrap';
import { useState,useEffect } from 'react';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';

function Balance(props) {
  const size={
    row:[12],
  };
  let [amount, setAmount] = useState("");
  let [address, setAddress] = useState("");

  const self={
    balance:(address,ck)=>{
      RUNTIME.getAPIs((API) => {
        if(API.AnchorJS.ready()){
          return API.AnchorJS.balance(address,ck);
        }
        setTimeout(()=>{
          self.balance(address,ck);
        },100);
      });
    },
  };

  useEffect(() => {
    RUNTIME.getAccount((sign)=>{
      if(!sign) return false;
      const acc = sign.address;
      setAddress(acc);
      self.balance(acc, (res) => {
        if (res === false) {
          setAmount('unknown');
        } else {
          setAmount(parseFloat(res.free * 0.000000000001).toLocaleString());
        }
      });
    });
  }, [])

  return (
    <Row className='pt-1'>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        {tools.shorten(address,10)} : <strong>{amount}</strong> units.
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr />
      </Col>
    </Row>
  );
}
export default Balance;