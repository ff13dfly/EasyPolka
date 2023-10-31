import { Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import From from './chat_from';
import To from './chat_to';

import RUNTIME from '../lib/runtime';
import CHAT from '../lib/chat';
import SCROLLER from '../lib/scroll';

let chatWS=null;
let spam="";
let backup=[];

function Chat(props) {
  const size = {
    content: [9, 3],
    row:[12],
  };
  const dv = { xs: 4, sm: 4, md: 4, lg: 4, xl: 6, xxl: 6 };
  let [content, setContent] = useState("");
  let [list, setList] = useState([]);

  let my_address = "";
  
  const self = {
    chat: (ev) => {
      if(!content) return false;
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
      if(chatWS===null || chatWS.readyState!==1 || !spam){
        self.linker();
        return setTimeout(()=>{
          self.send(ctx,to);
        },500);
      }
      const msg={
        act:"chat",
        to:to,
        msg:ctx,
        spam:spam,
      };
      chatWS.send(JSON.stringify(msg));
      CHAT.save(my_address,props.address,ctx,"to");           //save the answer
      self.toBottom();
    },
    showHistory:(list)=>{
      const cs=[];
      for(let i=0;i<list.length;i++){
        const row=list[i];
        if(row.way==="from"){
          cs.push({ type: "from", address: props.address, content: row.msg });
        }else{
          cs.push({ type: "to", address: my_address, content: row.msg });
        }
      }
      setList(cs);
      backup=cs;
      SCROLLER.allowScroll();
      self.toBottom();
    },

    getUnread:(list)=>{
      const nlist=[];
      for(let i=0;i<list.length;i++){
        const row=list[i];
        if(row.status===3){
          row.status=1;
          nlist.push(row);
        }
      }
      return nlist;
    },
    toBottom:()=>{
      setTimeout(()=>{
        const ele=document.getElementById(`con_${props.address}`);
        if(ele!==null) ele.scrollTop = ele.scrollHeight;
      },100);
    },
    linker:()=>{
      RUNTIME.getSetting((cfg) => {
        const config = cfg.apps.contact;
        const uri = config.node[0];
        RUNTIME.websocket(uri, (ws) => {
          chatWS=ws;
          spam = RUNTIME.getSpam(uri);
  
          CHAT.page(my_address,props.address,20,1,(his)=>{
            self.showHistory(his);
            const nlist=self.getUnread(his);
            if(nlist.length!==0){
              CHAT.toread(my_address,nlist,(res)=>{
                if(props.fresh) props.fresh();
              });
            }
          });
        });
      });
    }
  };

  RUNTIME.getAccount((res) => {
    my_address = res.address;
  });

  useEffect(() => {
    self.linker();
    RUNTIME.setMailer(props.address,(res)=>{
      switch (res.act) {
        case "chat":
          const nlist=[];
          for(let i=0;i<backup.length;i++){
            nlist.push(backup[i]);
          }
          nlist.push({ type: "from", address: props.address, content: res.msg })
          setList(nlist);
          backup=nlist;
          break;
        case "error":
          //TODO,showing notification and errors
          console.log(res);

          break;
        default:
          break;
      }
      self.toBottom();
    });
    
  }, []);

  return (
    <Row className='pb-2'>
      <Col className='chat_container' id={`con_${props.address}`} xs={size.row[0]} sm={size.row[0]} md={size.row[0]} 
      lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <div id={`scroll_${props.address}`}>
          {list.map((row, key) => (
            row.type === "from" ?
              <From address={row.address} key={key} content={row.content} /> :
              <To address={row.address} key={key} content={row.content} />
          ))}
        </div>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <hr/>
      </Col>
      <Col xs={size.content[0]} sm={size.content[0]} md={size.content[0]} lg={size.content[0]} xl={size.content[0]} xxl={size.content[0]}
        className="">
        <input type="text" className="form-control" value={content} onChange={(ev) => {
          self.onChange(ev);
        }} />
      </Col>
      <Col xs={size.content[1]} sm={size.content[1]} md={size.content[1]} lg={size.content[1]} xl={size.content[1]} xxl={size.content[1]}
        className="text-end">
        <button className='btn btn-md btn-primary' onClick={(ev) => {
          self.chat(ev);
        }}>Send</button>
      </Col>
    </Row>
  );
}
export default Chat;