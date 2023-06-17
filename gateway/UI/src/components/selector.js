import { Form } from 'react-bootstrap';

function Selector(props) {
  const id=props.id;
  return (
    <Form.Select id={id} onChange={(ev) => {
      props.changeServer(ev.target.value);
    }}>
    {props.hubs.map((item, index) => (
      <option value={index} key={index}>{item.name}</option>
    ))}
    </Form.Select>
  );
}
export default Selector;