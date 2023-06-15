import { Form } from 'react-bootstrap';

function Selector(props) {
  const cur=props.current;
  console.log(cur);
  //{(props.current===index?'selected="selected"':"")}
  return (
    <Form.Select id="trigger_me" value={cur} onChange={(ev) => {
      props.changeServer(ev.target.value);
    }}>
    {props.hubs.map((item, index) => (
      <option value={index} key={index}>{item.name}</option>
    ))}
    </Form.Select>
  );
}
export default Selector;