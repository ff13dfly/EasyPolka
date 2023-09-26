import { Row,Col,Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import From from './chat_from';
import To from './chat_to';

function Chat(props) {
  const size = {
    content:[9,3],
  };
  const dv={xs:4,sm:4,md:4,lg:4,xl:6,xxl:6};

  const self={

  };

  const mine="5GnaMMdmqFrUWpDsiC2FXotJ4cwnQcMDKCnygo8CviDGDsHd";

  useEffect(()=> {

  },[])

  const cmap={
    height:"500px",
    background:"#FFFFFF",
    padding:"0px 5px 0px 5px",
  }

  const target={
    background:"#EEEEEE",
  }
  return (
      <Row className='pb-2'>
        <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} >
          <div style={cmap}>
            <From address={props.address} content={"Hello, will you help me? Transfer me 2,000 units"}/>
            <To address={mine} content={"No,no such thing."}/>
          </div>
        </Col>
        <Col xs={size.content[0]} sm={size.content[0]} md={size.content[0]} lg={size.content[0]} xl={size.content[0]} xxl={size.content[0]}
          className="pt-4">
          <input type="text" className="form-control" />
        </Col>
        <Col xs={size.content[1]} sm={size.content[1]} md={size.content[1]} lg={size.content[1]} xl={size.content[1]} xxl={size.content[1]}
          className="pt-4 text-end">
          <button className='btn btn-md btn-primary' onClick={(ev)=>{

          }}>Send</button>
        </Col>
      </Row>
  );
}
export default Chat;