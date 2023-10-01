import { Row, Col,Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Chat from './chat';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';

function ContactList(props) {
  const size = [12];
  const dv={xs:3,sm:3,md:3,lg:3,xl:6,xxl:6};
  const funs = props.funs;

  let [contact, setContact] = useState({});

  const self={
    click:(address,ev)=>{
      funs.dialog.show(<Chat address={address} />,"Chatting");
    },
  }

  useEffect(() => {
    RUNTIME.getContact((res) => {
      //console.log(res);
      setContact(res);
    });
  }, [contact])

  return (
    <Row>
      {Object.keys(contact).map((address, index) => (
        <Col xs={dv.xs} sm={dv.sm} md={dv.md} lg={dv.lg} xl={dv.xl} xxl={dv.xxl} key={index} onClick={(ev)=>{
          self.click(address,ev);
        }}>
          <Row>
            <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
              className="pt-2">
                <Image 
                    src={`https://robohash.org/${address}.png`}
                    rounded
                    width="100%"
                  />
              <small>{tools.shorten(address,4)}</small><br/>
              <small><input type="checkbox" style={{marginRight:"5px"}}/>@{contact[address].network}</small>
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
export default ContactList;