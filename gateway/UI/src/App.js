import { Container,Row,Col,Form } from 'react-bootstrap';
import { useState,useEffect } from 'react';

import Link from './components/link';
import Dock from './components/dock';
import List from './components/list';
import Verify from './components/verify';

const tools=require('./lib/tools');

const test={
  spam:(URI)=>{
    const data={id:"abc",method:"spam"}
    tools.jsonp(URI,data,(res)=>{
      console.log(res);
      const data={id:"address_ss58",method:"list",params:{v:"vhistory",a:"view",spam:res.result.spam}}
      tools.jsonp(URI+'/manage',data,(res)=>{
        console.log(res);
      });
    });
  },
  auth:(URI)=>{
    const data={id:"abc",method:"spam"}
    tools.jsonp(URI,data,(res)=>{
      console.log(res);
      const data={id:"auth_id",method:"auth",params:{salt:tools.char(10,"CX"),spam:res.result.spam}}
      tools.jsonp(URI+'manage/',data,(res)=>{
        // const jsonwebtoken = require('jsonwebtoken');
        // const edata=jsonwebtoken.verify(res.result.token,'spam');
        // console.log(res.result.token);
        // console.log(edata);
      });
    });
  },
  aes:()=>{
    const encry=require('./lib/encry');
    encry.setKey("176G123412ABCDEF");
    encry.setIV("ABCDEF123412341p");
    const result=encry.encrypt(JSON.stringify({hello:"world"}));
    console.log(result);

    const de_result=encry.decrypt(result);
    console.log(de_result);

    const md5=encry.md5('5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw');
    console.log(md5);
  },
}

function App() {
  let [hubs,setHubs]=useState([]);
  let [server,setServer]=useState("");
  //let [spam,setSpam]=useState({});

  const self={
    changeServer:(uri)=>{
      setServer(uri);
      // if(!spam[uri]){
      //   const data={id:"abc",method:"spam"}
      //   tools.jsonp(uri,data,(res)=>{
      //     console.log(res);
          
      //   });
      // }
    },
    fresh:()=>{

    },
  }

  useEffect(() => {
    const URI="http://127.0.0.1:8001";
    //test.spam(URI);
    //test.auth(URI);
    //test.aes();

    //Fresh hubs list
    const hs=[
      {URI:"http://localhost:8001",name:"Local_hub_8001"},
      {URI:"http://localhost:8002",name:"Local_hub_8002"},
      {URI:"http://localhost:8003",name:"Local_hub_8003"},
    ];
    setHubs(hs);
    setServer(hs[0].URI);
  }, []);

  return (
    <Container>
      <Link />
      <Row>
        <Col md={3} lg={3} xl={3} xxl={3} className="pt-2">
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Form.Select onChange={(ev) => {
                self.changeServer(ev.target.value);
              }} >
              {hubs.map((item,index) => (
                <option value={item.URI} key={index}>{item.name}</option>
              ))}
              </Form.Select>
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Verify server={server}/>
            </Col>
          </Row>
        </Col>
        <Col md={9} lg={9} xl={9} xxl={9} className="pt-2">
          <Dock hub={server}/>
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <List server={server}/>
            </Col>
          </Row>
          
        </Col>
      </Row>
    </Container>
  );
}

export default App;
