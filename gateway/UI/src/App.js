import { Container, Row, Col, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Link from './components/link';
import Dock from './components/dock';
import List from './components/list';
import Verify from './components/verify';
import Tick from './components/tick';
import Basic from './components/basic';
import Details from './components/details';

const tools = require('./lib/tools');
//const DB=require('./lib/mndb');

const test = {
  spam: (URI) => {
    const data = { id: "abc", method: "spam" }
    tools.jsonp(URI, data, (res) => {
      console.log(res);
      const data = { id: "address_ss58", method: "list", params: { v: "vhistory", a: "view", spam: res.result.spam } }
      tools.jsonp(URI + '/manage', data, (res) => {
        console.log(res);
      });
    });
  },
  auth: (URI) => {
    const data = { id: "abc", method: "spam" }
    tools.jsonp(URI, data, (res) => {
      console.log(res);
      const data = { id: "auth_id", method: "auth", params: { salt: tools.char(10, "CX"), spam: res.result.spam } }
      tools.jsonp(URI + 'manage/', data, (res) => {
        // const jsonwebtoken = require('jsonwebtoken');
        // const edata=jsonwebtoken.verify(res.result.token,'spam');
        // console.log(res.result.token);
        // console.log(edata);
      });
    });
  },
  aes: () => {
    const encry = require('./lib/encry');
    encry.setKey("176G123412ABCDEF");
    encry.setIV("ABCDEF123412341p");
    const result = encry.encrypt(JSON.stringify({ hello: "world" }));
    console.log(result);

    const de_result = encry.decrypt(result);
    console.log(de_result);

    const md5 = encry.md5('5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw');
    console.log(md5);
  },
  direct: (URI) => {
    const data = { id: "abc", method: "spam" }
    tools.jsonp(URI, data, (res) => {
      console.log(res);
      const spam = res.result.spam;
      const params = {
        svc: 'vHistory',
        act: 'view',
        name: 'hello',
        spam: spam,
      }
      const data = { id: "auth_id", method: "auto", params: params };
      tools.jsonp(URI, data, (res) => {
        console.log(res);
      });
    });
  },
  auto: () => {
    const URI = "http://127.0.0.1:8001";
    //test.spam(URI);
    //test.auth(URI);
    test.direct(URI);
    //test.aes();
  },
}

const authority = {};   //storage authority
const spams = {};       //storage the spams
const monitor={};       //storage monitor data

function App() {

  //storage part
  let [server, setServer] = useState("");
  let [force, setForce] = useState(0);

  //render part;
  let [domList,setDomList]=useState("");
  let [basic,setBasic]=useState("");
  let [endpoint,setEndpoint]=useState("");
  

  const storage = {
    key: "hub_nodes",
    loadNodes: () => {
      const str = localStorage.getItem(storage.key);
      if (str === null) return [];
      try {
        return JSON.parse(str);
      } catch (error) {
        localStorage.removeItem(storage.key);
        return [];
      }
    },
    saveNodes: (list) => {
      localStorage.setItem(storage.key, JSON.stringify(list));
      return true;
    },
    removeNode:(index)=>{
      console.log({index});
      const old=storage.loadNodes();
      const list=[];
      console.log(old);
      for(let i=0;i<old.length;i++){
        const row=old[i];
        if(i!==parseInt(index)) list.push(row);
      }
      console.log(list);
      storage.saveNodes(list);
    },
    updateNode:(name,index)=>{
      const list=storage.loadNodes();
      list[index].name=name;
      storage.saveNodes(list);
    },
  }

  //let hubs=[];
  let [hubs, setHubs] = useState([]);
  const self = {
    changeServer: (index) => {
      const node = hubs[index];
      setDomList("Loading");
      if(!node){

        return false;
      }
      setServer(node.URI);
      setEndpoint(node.URI);
      setBasic(<Basic name={node.name} index={index} storage={storage} fresh={self.fresh}/>)
      self.system(node.URI, (res) => {
        if(res.error){
          return setDomList(res.error);
        } 
        monitor[node.URI]=res;
        setDomList(<List server={node.URI} spam={spams[node.URI]} fresh={self.fresh}
          token={(authority[node.URI] && authority[node.URI].token) ? authority[node.URI].token : ""}
          show={(authority[node.URI] && authority[node.URI].token) ? true : false} />);
      });
    },
    setAuthority: (exp, token) => {
      //console.log({ exp, token })
      authority[server] = {
        token: token,
        expired: exp,
      }
      return true;
    },
    fresh: (skip) => {
      //1.list the storaged nodes
      const hs = storage.loadNodes();
      setHubs(hs);
      if (hubs.length !== 0) {
        let index = 0;
        for (let i = 0; i < hubs.length; i++) {
          const row = hubs[i];
          if (row.URI === server) index = i;
        }
        setServer(hubs[index].URI);
      }

      //2.force to render
      if (!skip) {
        setForce(force + 1);
      }
    },
    serverSpam:(uri,ck)=>{
      if(!spams[uri]){
        tools.jsonp(uri, { id: "system_spam_id", method: "spam" }, (res) => {
          if(res.error){
            return ck && ck({error:"Failed to get spam"});
          }
          const spam = res.result.spam;
          spams[uri]=spam;
          return ck && ck(spams[uri]);
        });
      }else{
        return ck && ck(spams[uri]);
      }
    },
    system: (uri, ck) => {
      self.serverSpam(uri,(spam)=>{
        if(spam && spam.error!==undefined) return ck && ck(spam);
        const data = { id: "system_id", method: "system", params: { spam: spam } }
        tools.jsonp(uri + '/manage/', data, (res) => {
          console.log(res);
          if(res.error){
            delete spams[uri];
            return self.system(uri,ck);
          }
          return ck && ck(res.result);
        });
      });
    },
  }

  useEffect(() => {
    self.fresh();
    setTimeout(() => {
      const ev = new Event('change', { bubbles: true });
      const node = document.getElementById('trigger_me');
      node.dispatchEvent(ev);
    }, 0);
  }, []);

  return (
    <Container>
      <Link storage={storage} fresh={self.fresh} />
      <Row index={force} hidden={hubs.length===0?true:false}>
        <Col md={3} lg={3} xl={3} xxl={3} className="pt-2">
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2" >
              <Form.Select simulated="true" id="trigger_me" onChange={(ev) => {
                self.changeServer(ev.target.value);
              }}>
                {hubs.map((item, index) => (
                  <option value={index} key={index}>{item.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12}>{endpoint}</Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">{basic}</Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Verify server={server} authority={self.setAuthority} fresh={self.fresh}
                uploaded={false}
                show={(authority[server] && authority[server].token) ? false : true} />
              <Tick server={server} remove={self.removeAuthority}
                expired={authority[server] ? authority[server].expired : 0}
                show={(authority[server] && authority[server].token) ? true : false} />
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              {/* <Details data={data} /> */}
            </Col>
          </Row>
        </Col>
        <Col md={9} lg={9} xl={9} xxl={9} className="pt-2">
          <Dock server={server} fresh={self.fresh}
            token={(authority[server] && authority[server].token) ? authority[server].token : ""}
            show={(authority[server] && authority[server].token) ? true : false} />
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              {domList}
            </Col>
          </Row>

        </Col>
      </Row>
    </Container>
  );
}

export default App;
