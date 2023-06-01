import { Container,Row,Col,Form } from 'react-bootstrap';
import { useState,useEffect } from 'react';

import Link from './components/link';
import Dock from './components/dock';
import List from './components/list';
import Verify from './components/verify';
import Tick from './components/tick';

const tools=require('./lib/tools');
const DB=require('./lib/mndb');

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
  auto:()=>{
    const URI="http://127.0.0.1:8001";
    test.spam(URI);
    test.auth(URI);
    test.aes();
  },
}

const authority={}

function App() {
  let [hubs,setHubs]=useState([]);
  let [server,setServer]=useState("");
  let [force,setForce]=useState(0);

  const storage={
    key:"hub_nodes",
    loadNodes:()=>{
      const str=localStorage.getItem(storage.key);
      if(str===null) return [];
      try {
        return JSON.parse(str);
      } catch (error) {
        localStorage.removeItem(storage.key);
        return [];
      }
    },
    saveNodes:(list)=>{
      localStorage.setItem(storage.key,JSON.stringify(list));
      return true;
    },
  }

  const self={
    changeServer:(index)=>{
      const node=hubs[index];
      setServer(node.URI);
    },
    setAuthority:(exp,token)=>{
      authority[server]={
        token:token,
        expired:exp,
      }
    },
    removeAuthority:(server)=>{

    },
    fresh:(skip)=>{
      //1.list the storaged nodes
      const hs=storage.loadNodes();
      setHubs(hs);
      if(hs.length!==0) setServer(hs[0].URI);

      if(!skip){
        //console.log(`force  fresh`);
        setForce(force  +1);
      } 
    },
  }
  
  
  useEffect(() => {
    //test.auto();
    self.fresh();
  }, []);

  return (
    <Container>
      <Link storage={storage} fresh={self.fresh}/>
      <Row index={force}>
        <Col md={3} lg={3} xl={3} xxl={3} className="pt-2">
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Form.Select onChange={(ev) => {
                self.changeServer(ev.target.value);
              }} >
              {hubs.map((item,index) => (
                <option value={index} key={index}>{item.name}</option>
              ))}
              </Form.Select>
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12}>
              {server}
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Verify server={server} authority={self.setAuthority} fresh={self.fresh}
                show={(authority[server] && authority[server].token)?false:true}/>
              <Tick server={server} remove={self.removeAuthority}
                expired={authority[server]?authority[server].expired:0} 
                show={(authority[server] && authority[server].token)?true:false}/>
            </Col>
          </Row>
        </Col>
        <Col md={9} lg={9} xl={9} xxl={9} className="pt-2">
          <Dock server={server} fresh={self.fresh} 
              token={(authority[server] && authority[server].token)?authority[server].token:""}
              show={(authority[server] && authority[server].token)?true:false}/>
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <List server={server} fresh={self.fresh} 
                token={(authority[server] && authority[server].token)?authority[server].token:""}
                show={(authority[server] && authority[server].token)?true:false}/>
            </Col>
          </Row>
          
        </Col>
      </Row>
    </Container>
  );
}

export default App;
