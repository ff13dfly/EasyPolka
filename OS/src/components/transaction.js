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

  //console.log(props);

  let [details, setDetails] = useState('');

  const self={
    
  };

  useEffect(() => {
    RUNTIME.getActive((pok)=>{
      if(pok===null) return false;
      console.log(pok);
      pok.rpc.chain.getBlock(block).then((res)=>{
        const data=res.toJSON();
        console.log(data);
      })
    });
    // RUNTIME.getAPIs((API) => {
    //   const cfg=RUNTIME.getConfig("system");
    //   const node=cfg.network.anchor[0];
    //   const pok=RUNTIME.wsInstance(node);
      
    // });
  }, []);

  return (
    <Row className='pt-1'>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h5>Summary</h5>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        {details}
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Block Hash</small>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea name="" style={{width:"100%"}} rows="3" disabled={true} defaultValue={block}></textarea>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Transaction Hash</small>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea name="" style={{width:"100%"}} rows="3" disabled={true} defaultValue={hash}></textarea>
      </Col>
    </Row>
  );
}
export default Transaction;