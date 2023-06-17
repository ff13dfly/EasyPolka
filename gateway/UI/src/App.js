import { Container, Row, Col, Form, Accordion } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Link from './components/link';
import Dock from './components/dock';
import List from './components/list';
import Verify from './components/verify';
import Tick from './components/tick';
import Basic from './components/basic';
import Status from './components/status';
import Selector from './components/selector';

const tools = require('./lib/tools');

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
const monitor = {};       //storage monitor data

function App() {

  //render part;
  let [domList, setDomList] = useState("");     //vService functions
  let [basic, setBasic] = useState("");         //node basic information
  let [uploader,setUploader] = useState("");    //verify uploader status
  let [docker,setDocker]=useState("");          //docker functions
  let [selector,setSelector]=useState("");      //node selector
  let [status,setStatus]=useState("");          //monitor status

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
    removeNode: (index) => {
      const old = storage.loadNodes();
      const list = [];
      for (let i = 0; i < old.length; i++) {
        const row = old[i];
        if (i !== parseInt(index)) list.push(row);
      }
      storage.saveNodes(list);
    },
    updateNode: (name, index) => {
      const list = storage.loadNodes();
      list[index].name = name;
      storage.saveNodes(list);
    },
  }

  let [sidebar,setSidebar]=useState(true);
  const config={
    selector_id:"trigger_me",
  };
  const self = {
    changeServer: (index) => {
      const hs = storage.loadNodes();
      const node = hs[index];
      setDomList("Loading");
      if (!node) return false;

      //set cur_hub to 
      localStorage.setItem("cur_hub",index);

      setBasic(<Basic name={node.name} index={index} storage={storage} fresh={self.fresh} />);
      const server=node.URI;

      self.system(server, (res) => {
        if (res.error) return setDomList(res.error);

        const token=(authority[server] && authority[server].token) ? authority[server].token : "";

        //TODO, filter different authority level
        if(!token){
          //a.token lost,check status
          setUploader(
            <Verify server={server} authority={self.setAuthority} fresh={self.fresh} 
            remove={self.removeAuthority} uploaded={res.status.uploaded} authed={false} spam={spams[server]} />       
          );
        }else{
          //b.token is ok
          setUploader(
            <Tick server={server} remove={self.removeAuthority} fresh={self.fresh} spam={spams[server]} token={token}
                expired={authority[server] ? authority[server].expired : 0}/>    
          );
          setDocker(
            <Dock server={server} fresh={self.fresh} spam={spams[server]} token={token}/>
          );
        }

        monitor[server] = res.status.monitor;
        setDomList(<List server={server} spam={spams[server]} fresh={self.fresh}
          token={token} show={token ? true : false} />);
        setStatus(<Status data={res.status} server={server}/>);
      });
    },
    removeAuthority:(server)=>{
      delete authority[server];
      return true;
    },
    setAuthority: (server ,exp, token) => {
      authority[server] = {
        token: token,
        expired: exp,
      }
      return true;
    },
    fresh: () => {
      //1.list the storaged nodes
      const hs = storage.loadNodes();
      setSidebar(hs.length!==0?false:true);
      if(hs.length!==0){
        const cur=localStorage.getItem("cur_hub");
        setSelector(<Selector hubs={hs} fresh={self.fresh} id={config.selector_id}
          current={cur==null?0:parseInt(cur)}
          changeServer={self.changeServer}
        />);
        self.changeSelector();
      }
    },
    serverSpam: (uri, ck) => {
      if (!spams[uri]) {
        tools.jsonp(uri, { id: "system_spam_id", method: "spam" }, (res) => {
          if (res.error) {
            return ck && ck({ error: "Failed to get spam" });
          }
          const spam = res.result.spam;
          spams[uri] = spam;
          return ck && ck(spams[uri]);
        });
      } else {
        return ck && ck(spams[uri]);
      }
    },
    system: (uri, ck) => {
      self.serverSpam(uri, (spam) => {
        if (spam && spam.error !== undefined) return ck && ck(spam);
        const data = { id: "system_id", method: "system", params: { spam: spam } }
        tools.jsonp(uri + '/manage/', data, (res) => {
          if (res.error) {
            delete spams[uri];
            return self.system(uri, ck);
          }
          return ck && ck(res.result);
        });
      });
    },
    changeSelector:()=>{
      const node = document.getElementById(config.selector_id);
      if(node===null) return setTimeout(self.changeSelector,100);   //reload if the dom is not ready

      const ev = new Event('change', { bubbles: true });
      node.dispatchEvent(ev);
    }
  }

  useEffect(() => {
    self.fresh();
  }, []);

  return (
    <Container>
      <Link storage={storage} fresh={self.fresh} />
      <Row hidden={sidebar}>
        <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2" >
              {selector}
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
              <Accordion flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Basic</Accordion.Header>
                  <Accordion.Body>
                    {basic}
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Authority</Accordion.Header>
                  <Accordion.Body>
                    {uploader}
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>vService</Accordion.Header>
                  <Accordion.Body>
                    {docker}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        </Col>
        <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
          <Row>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">{domList}</Col>
            <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">{status}</Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
