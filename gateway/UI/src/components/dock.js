import { Row, Col, Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const tools = require('../lib/tools');

function Dock(props) {
  const token = props.token;
  const node = props.server;

  let [uri, setURI] = useState("");
  let [secret,setSecret]=useState("");
  let [info,setInfo]=useState(token===null?"No authority to dock vService.":"");

  const self = {
    secretChange: (ev) => {
      setSecret(ev.target.value);
    },
    onChange: (ev) => {
      setURI(ev.target.value);
    },
    onClick:()=>{
      tools.jsonp(node, { id: "abc", method: "spam" }, (res) => {
        //console.log(res);
        const spam = res.result.spam;
        const request={
          id: "dock_vservice", 
          method: "dock", 
          params:{
            token:token,
            node:uri,
            secret:secret,
            spam:spam,
          }
        }
        //console.log(request);
        tools.jsonp(node+'/manage/',request, (res) => {
          if(res.error) {
            return setInfo(res.error)
          }
          setURI("");
          setSecret("");
          setInfo("");
          props.fresh();
        });
      });
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">{info}</Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        <Form.Control
          size="md"
          type="text"
          placeholder="vService URI..."
          value={uri}
          disabled={!token}
          onChange={(ev) => { self.onChange(ev) }}
        />
      </Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        <Form.Control
          size="md"
          type="text"
          disabled={!token}
          value={secret}
          placeholder="******-******-******-******"
          onChange={(ev) => { self.secretChange(ev) }}
        />
      </Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2 text-end">
        <Button disabled={!token} onClick={() => {
          self.onClick()
        }}>Dock</Button>
      </Col>
    </Row>
  );
}
export default Dock;