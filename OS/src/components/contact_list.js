import { Row, Col,Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Chat from './chat';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';

function ContactList(props) {

  const size = [12];
  const dv={xs:3,sm:3,md:3,lg:3,xl:6,xxl:6};
  const funs = props.funs;
  const count=props.count;

  let [contact, setContact] = useState({});
  let [select, setSelect] = useState({});

  const self={
    click:(address,ev)=>{
      funs.dialog.show(<Chat address={address} />,"Chatting");
    },
    select:(address)=>{
      select[address] = !select[address];
      props.fresh();
      props.select(select);
      //console.log(select);
    },
  }

  useEffect(() => {
    RUNTIME.getContact((res) => {
      //console.log(res);
      setContact(res);
    });
  }, [count])

  return (
    <Row index={count}>
      {Object.keys(contact).map((address, index) => (
        <Col xs={dv.xs} sm={dv.sm} md={dv.md} lg={dv.lg} xl={dv.xl} xxl={dv.xxl} key={index} onClick={(ev)=>{
          props.edit?self.select(address):self.click(address,ev);
        }}>
          <Row>
            <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
              className="pt-2">
                <Image 
                    src={`https://robohash.org/${address}.png`}
                    rounded
                    width="100%"
                  />
              <small>{address.length>10?tools.shorten(address,4):address}</small><br/>
              <small><input hidden={!props.edit} type="checkbox"  
                checked={!select[address]?false:select[address]}
                onChange={(ev)=>{
                  //self.change(ev,address);
                }} style={{marginRight:"5px"}}/>@{contact[address].network}</small>
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
export default ContactList;