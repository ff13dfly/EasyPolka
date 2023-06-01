import { Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const tools = require('../lib/tools');

function List(props) {
  const node = props.server;
  const show = props.show;
  const token = props.token;

  let [svcs, setServers] = useState([
    {
      name: "vHistory", funs: {
        "view": {
          "intro": "",
          "params": {
            "name": "string"
          }
        },
        "target": {
          "intro": "",
          "params": {
            "name": "string",
            "block": "blocknumber"
          }
        },
        "history": {
          "intro": "",
          "params": {
            "name": "string",
            "page": "u32",
            "step": "u32"
          }
        },
      }, nodes: ["http://localhost:5600", "http://localhost:5601"]
    },
    {
      name: "vSocial", funs: {
        "fav": {
          "intro": "",
          "params": {
            "name": "string"
          }
        },
      }, nodes: ["http://localhost:8843"]
    },
  ]);


  const self = {
    removeService: (uri,name) => {
      tools.jsonp(uri, { id: "abc", method: "spam" }, (res) => {
        //console.log(res);
        const spam = res.result.spam;
        const request={
          id: "remove_vservice", 
          method: "apart", 
          params:{
            token:token,
            name:name,
            node:uri,
            spam:spam,
          }
        }
        tools.jsonp(uri+'/manage/',request, (res) => {
          console.log(res);
        });
      });
    },
    load:(uri)=>{
      console.log(uri);
      tools.jsonp(uri,{id:"load_spam",method:"spam"},(res)=>{
        console.log(res);
        const spam = res.result.spam;
        const request={
          id: "list_vservice", 
          method: "list", 
          params:{
            spam:spam,
          }
        }
        tools.jsonp(uri+'/manage/',request, (res) => {
          console.log(res);
        });
      });
    },
  }

  useEffect(() => {
    if(node!=="") self.load(node);
    console.log(node);
    //self.load(node);
  }, []);

  return (
    <Row>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2 text-end">
          <Button size="sm" variant="info" className='mr-4' onClick={(ev) => {
            self.load(node)
          }}>Fresh</Button>
      </Col>
      {svcs.map((item, key) => (
        <Col md={12} lg={12} xl={12} xxl={12} className="pt-2" key={item.name}>
          <Row>
            <Col md={2} lg={2} xl={2} xxl={2} className="pt-2">{item.name}</Col>
            <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
              {item.nodes.map((node, index) => (
                <p key={index}>
                  <Button size="sm" variant="danger" className='mr-4' hidden={!show} onClick={(ev) => {
                    self.removeService(node,item.name)
                  }}>X</Button>
                  {node}
                </p>
              ))}
            </Col>
            <Col md={6} lg={6} xl={6} xxl={6} className="pt-2">
              {Object.keys(item.funs).map((fkey) => (
                <Row key={fkey}>
                  <Col md={3} lg={3} xl={3} xxl={3} className="pt-2">
                    <Button size="sm" variant="info" >{fkey}</Button>
                  </Col>
                  <Col md={9} lg={9} xl={9} xxl={9} className="pt-2 text-end">
                    {JSON.stringify(item.funs[fkey].params)}
                  </Col>
                </Row>
              ))}
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12}><hr /></Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
export default List;