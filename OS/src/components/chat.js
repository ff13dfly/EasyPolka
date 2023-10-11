import { Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import From from './chat_from';
import To from './chat_to';

import RUNTIME from '../lib/runtime';
import CHAT from '../lib/chat';

let chatWS=null;
let spam="";
let backup=[];

function Chat(props) {
  const size = {
    content: [9, 3],
  };
  const dv = { xs: 4, sm: 4, md: 4, lg: 4, xl: 6, xxl: 6 };
  const mailer=props.mailer;
  let [content, setContent] = useState("");
  let [list, setList] = useState([]);

  let my_address = "";
  
  const self = {
    chat: (ev) => {
      //console.log(content);
      self.append(content);
      self.send(content,props.address);
    },
    append: (ctx) => {
      const row = {
        type: "to",
        address: my_address,
        content: ctx,
      }
      const now = [];
      for (let i = 0; i < list.length; i++) {
        now.push(list[i]);
      }
      now.push(row);
      setList(now);
      setContent("");
      backup=now;
    },
    onChange: (ev) => {
      setContent(ev.target.value);
    },
    send:(ctx,to)=>{
      if(chatWS===null) return false;
      const msg={
        act:"chat",
        to:to,
        msg:ctx,
        spam:spam,
      };
      chatWS.send(JSON.stringify(msg));
    },
    showHistory:(list)=>{
      const cs=[];
      for(let i=0;i<list.length;i++){
        const row=list[i];
        cs.push({ type: "from", address: props.address, content: row.msg });
      }
      setList(cs);
      backup=cs;
    },
  };

  RUNTIME.getAccount((res) => {
    my_address = res.address;
  });

  useEffect(() => {
    RUNTIME.getSetting((cfg) => {
      const config = cfg.apps.contact;
      const uri = config.node[0];
      RUNTIME.websocket(uri, (ws) => {
        chatWS=ws;
        spam = RUNTIME.getSpam(uri);

        CHAT.page(my_address,props.address,20,1,(his)=>{
          self.showHistory(his);
        });
      });
    });

    mailer(props.address,(res)=>{
      const nlist=[];
      for(let i=0;i<backup.length;i++){
        nlist.push(backup[i]);
      }
      nlist.push({ type: "from", address: props.address, content: res.msg })
      setList(nlist);
      backup=nlist;
    });
    
  }, []);

  return (
    <Row className='pb-2'>
      <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
        <div className='chat_container' style={{WebkitOverflowScrolling: "touch"}}>
          {list.map((row, key) => (
            row.type === "from" ?
              <From address={row.address} key={key} content={row.content} /> :
              <To address={row.address} key={key} content={row.content} />
          ))}
        </div>
      </Col>
      <Col xs={size.content[0]} sm={size.content[0]} md={size.content[0]} lg={size.content[0]} xl={size.content[0]} xxl={size.content[0]}
        className="pt-4">
        <input type="text" className="form-control" value={content} onChange={(ev) => {
          self.onChange(ev);
        }} />
      </Col>
      <Col xs={size.content[1]} sm={size.content[1]} md={size.content[1]} lg={size.content[1]} xl={size.content[1]} xxl={size.content[1]}
        className="pt-4 text-end">
        <button className='btn btn-md btn-primary' onClick={(ev) => {
          self.chat(ev);
        }}>Send</button>
      </Col>
    </Row>
  );
}
export default Chat;