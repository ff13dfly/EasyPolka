import { Row, Col, Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const tools = require('../lib/tools');

function Dock(props) {
  const token = props.token;
  const node = props.server;
  const show=props.show;

  let [uri, setURI] = useState("");
  let [address,setAddress]=useState("");

  const self = {
    accountChange: (ev) => {
      setAddress(ev.target.value);
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
            address:address,
            spam:spam,
          }
        }
        console.log(request);
        // tools.jsonp(node+'/manage/',request, (res) => {
        //   console.log(res);
        // });
      });
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Row hidden={!show}>
      <Col md={2} lg={2} xl={2} xxl={2} className="pt-2"></Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
        <Form.Control
          size="md"
          type="text"
          placeholder="Account..."
          onChange={(ev) => { self.accountChange(ev) }}
        />
      </Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
        <Form.Control
          size="md"
          type="text"
          placeholder="vService URI..."
          onChange={(ev) => { self.onChange(ev) }}
        />
      </Col>
      <Col md={2} lg={2} xl={2} xxl={2} className="pt-2 text-end">
        <Button onClick={() => {
          self.onClick()
        }}>Dock</Button>
      </Col>
    </Row>
  );
}
export default Dock;