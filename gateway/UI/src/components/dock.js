import { Row, Col, Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';

function Dock(props) {

  let [uri, setURI] = useState("");

  const hub = props.hub;
  console.log(hub);

  const self = {
    onChange: (ev) => {
      setURI(ev.target.value);
    },
    onClick:()=>{
      console.log(hub);
      console.log(uri);
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2"></Col>
      <Col md={6} lg={6} xl={6} xxl={6} className="pt-2">
        <Form.Control
          size="md"
          type="text"
          placeholder="vService URI to add..."
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