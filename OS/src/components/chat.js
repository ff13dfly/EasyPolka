import { Row,Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import From from './chat_from';
import To from './chat_to';

function Chat(props) {
  const size = {
    content:[9,3],
  };
  const dv={xs:4,sm:4,md:4,lg:4,xl:6,xxl:6};

  let [content, setContent] = useState("");
  let [list, setList] = useState([]);

  const self={
    chat:(ev)=>{
      console.log(content);
      self.append(content);
    },
    append:(ctx)=>{
      const row={
        type:"to",
        address:props.address,
        content:ctx,
      }
      const now=[];
      for(let i=0;i<list.length;i++){
        now.push(list[i]);
      }
      now.push(row);
      setList(now);
      setContent("");
    },
    onChange:(ev)=>{
      setContent(ev.target.value);
    },
  };

  const mine="5GnaMMdmqFrUWpDsiC2FXotJ4cwnQcMDKCnygo8CviDGDsHd";

  useEffect(()=> {
    const history=[
      {type:"from",address:props.address,content:"Hello, will you help me? Transfer me 2,000 units"},
      {type:"to",address:props.address,content:"No,no such thing."},
    ]
    setList(history);
  },[])

  const cmap={
    height:"500px",
    background:"#FFFFFF",
    padding:"0px 5px 0px 5px",
    overflow: "auto",
  }

  return (
      <Row className='pb-2'>
        <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} >
          <div style={cmap}>
            {list.map((row, key) => (
              row.type==="from"?
              <From address={row.address} key={key} content={row.content}/>:
              <To address={mine} key={key} content={row.content}/>
            ))}
          </div>
        </Col>
        <Col xs={size.content[0]} sm={size.content[0]} md={size.content[0]} lg={size.content[0]} xl={size.content[0]} xxl={size.content[0]}
          className="pt-4">
          <input type="text" className="form-control" value={content} onChange={(ev)=>{
            self.onChange(ev);
          }}/>
        </Col>
        <Col xs={size.content[1]} sm={size.content[1]} md={size.content[1]} lg={size.content[1]} xl={size.content[1]} xxl={size.content[1]}
          className="pt-4 text-end">
          <button className='btn btn-md btn-primary' onClick={(ev)=>{
            self.chat(ev);
          }}>Send</button>
        </Col>
      </Row>
  );
}
export default Chat;