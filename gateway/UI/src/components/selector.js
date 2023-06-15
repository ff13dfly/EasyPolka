import { Form } from 'react-bootstrap';

function Selector(props) {
  return (
    <Form.Select id="trigger_me" onChange={(ev) => {
      props.changeServer(ev.target.value);
    }}>
    {props.hubs.map((item, index) => (
      <option value={index} key={index}>{item.name}</option>
    ))}
    </Form.Select>
  );
}
export default Selector;