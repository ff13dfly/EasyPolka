import { Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const tools = require('../lib/tools');

function List(props) {
  const server = props.server;
  const show = props.show;
  const token = props.token;
  const spam=props.spam;

  //console.log({server,show,token,spam})

  let [svcs, setServers] = useState([]);
  let [info, setInfo] = useState('');

  const self = {
    removeService: (node,name) => {
        const request={
          id: "remove_vservice", 
          method: "apart", 
          params:{
            token:token,
            name:name,
            node:node,
            spam:spam,
          }
        }
        console.log(request);
        tools.jsonp(server+'/manage/',request, (res) => {
          console.log(res);
          
        });
    },
    load:(uri)=>{
        const request={
          id: "list_vservice", 
          method: "list", 
          params:{
            spam:spam,
          }
        }
        tools.jsonp(uri+'/manage/',request, (res) => {
          setServers(res.result);
          if(res.result.length===0) setInfo("No active vService.");
        });
    },
  }

  useEffect(() => {
    if(server!=="") self.load(server);

  }, []);

  return (
    <Row>
      {/* <Col md={12} lg={12} xl={12} xxl={12} className="pt-2 text-end">
          <Button size="sm" variant="info" className='mr-4' onClick={(ev) => {
            self.load(server)
          }}>Fresh</Button>
      </Col> */}
      <Col md={12} lg={12} xl={12} xxl={12}>{info}</Col>
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