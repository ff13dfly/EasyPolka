import { Row, Col, Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Chat from './chat';

import RUNTIME from '../lib/runtime';
import CHAT from '../lib/chat';
import tools from '../lib/tools';

function StrangerList(props) {

  //const size = [12];
  const size={
    row:12,
    divide:[4,4,4],
  }
  const dv = { xs: 3, sm: 3, md: 3, lg: 3, xl: 6, xxl: 6 };
  const funs = props.funs;
  const count = props.count;

  let [contact, setContact] = useState([]);
  let [select, setSelect] = useState({});
  let [hide, setHide] = useState(true);

  const self = {
    click: (address, ev) => {
      funs.dialog.show(<Chat address={address} mailer={props.mailer}/>,tools.shorten(address,6));
    },
    select: (address) => {
      select[address] = !select[address];
      props.fresh();
      props.select(select);
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
    //setContact(props.list);
    if(props.list.length!==0) setHide(false);

    RUNTIME.getAccount((fa) => {
      const mine=fa.address;
      const nlist=[];
      for(let i=0;i<props.list.length;i++){
        nlist.push(props.list[i].address);
      } 

  
        // for(let i=0;i<props.list.length;i++){
        //   const atom=props.list[i];
        //   list.push(atom);
        //   nlist.push(atom.address);
        // }
        // console.log(nlist);
        
        self.getCount(mine,nlist,(un)=>{
          const list=[];
          for(let i=0;i<props.list.length;i++){
            const atom=props.list[i];
            atom.unread=!un[atom.address]?0:un[atom.address];
            list.push(atom);
          }
          setContact(list);
        });
    });
  }, [props.list]);

  return (
    <Row index={count}>
      <Col hidden={hide} xs={size.divide[0]} sm={size.divide[0]} md={size.divide[0]} 
        lg={size.divide[0]} xl={size.divide[0]} xxl={size.divide[0]} className="pt-2"><hr/></Col>
      <Col hidden={hide} xs={size.divide[1]} sm={size.divide[1]} md={size.divide[1]} 
        lg={size.divide[1]} xl={size.divide[1]} xxl={size.divide[1]} className="pt-2 text-center">
          <span style={{color:"#BBBBBB",fontWeight:"500"}}>Stranger</span>
      </Col>
      <Col hidden={hide} xs={size.divide[2]} sm={size.divide[2]} md={size.divide[2]} 
        lg={size.divide[2]} xl={size.divide[2]} xxl={size.divide[2]} className="pt-2"><hr/></Col>
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
export default StrangerList;