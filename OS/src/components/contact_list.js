import { Row, Col, Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Chat from './chat';

import RUNTIME from '../lib/runtime';
import CHAT from '../lib/chat';
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
      funs.dialog.show(<Chat address={address} mailer={props.mailer}/>,tools.shorten(address,6));
    },
    select: (address) => {
      select[address] = !select[address];
      props.fresh();
      props.select(select,"contact");
    },
    getCount:(mine,list,ck,map)=>{
      if(!map) map={};
      if(list.length===0) return ck && ck(map);
      const acc=list.pop();
      CHAT.unread(mine,acc,(n)=>{
        map[acc]=!n?0:n;
        return self.getCount(mine,list,ck,map);
      });
    },
  }

  useEffect(() => {
    RUNTIME.getAccount((fa) => {
      const mine=fa.address;
      RUNTIME.getContact((res) => {
        const nlist=[];
        for(var k in res) nlist.push(k);

        self.getCount(mine,nlist,(un)=>{
          const list=[];
          for(var k in res){
            const atom=res[k];
            atom.address=k;
            atom.unread=!un[k]?0:un[k];
            list.push(atom);
          }
          setContact(list);
        });
      });
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
              <span className='count' hidden={!row.unread || row.unread===0}>{!row.unread?0:row.unread}</span>
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