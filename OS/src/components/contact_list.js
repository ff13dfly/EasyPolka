import { Row, Col, Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Chat from './chat';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';

function ContactList(props) {

  const size = [12];
  const dv = { xs: 3, sm: 3, md: 3, lg: 3, xl: 6, xxl: 6 };
  const funs = props.funs;
  const count = props.count;

  let [contact, setContact] = useState([]);
  let [select, setSelect] = useState({});

  const self = {
    click: (address, ev) => {
      funs.dialog.show(<Chat address={address} mailer={props.mailer}/>, "Chatting");
    },
    select: (address) => {
      select[address] = !select[address];
      props.fresh();
      props.select(select);
    },
  }

  useEffect(() => {
    RUNTIME.getContact((res) => {
      //console.log("fresh");
      const list=[];
      for(var k in res){
        const atom=res[k];
        atom.address=k;
        list.push(atom);
      }
      setContact(list);
    });
  }, [count])

  return (
    <Row index={count}>
      {contact.map((row, index) => (
        <Col xs={dv.xs} sm={dv.sm} md={dv.md} lg={dv.lg} xl={dv.xl} xxl={dv.xxl} key={index} onClick={(ev) => {
          props.edit ? self.select(row.address) : self.click(row.address, ev);
        }}>
          <Row>
            <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
              className="pt-2">
              <Image
                src={`https://robohash.org/${row.address}.png`}
                rounded
                width="100%"
                style={{minHeight:"80px"}}
              />
              <span className='count'>3</span>
              <small>{row.address.length > 10 ? tools.shorten(row.address, 4) : row.address}</small><br />
              <small><input hidden={!props.edit} type="checkbox"
                checked={!select[row.address] ? false : select[row.address]}
                onChange={(ev) => {
                  //self.change(ev,address);
                }} style={{ marginRight: "5px" }} />@{row.network}</small>
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
export default ContactList;