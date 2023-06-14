import { Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';

function Selector(props) {
  const cur=props.current;

  useEffect(() => {

  }, []);

  return (
    <Form.Select simulated="true" id="trigger_me" onChange={(ev) => {
      props.changeServer(ev.target.value);
    }}>
    {props.hubs.map((item, index) => (
      <option value={index} key={index}>{item.name}</option>
    ))}
    </Form.Select>
  );
}
export default Selector;