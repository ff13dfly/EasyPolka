import { Row, Col, Button } from 'react-bootstrap';
import { useEffect } from 'react';

const tools = require('../lib/tools');

function Tick(props) {
  const exp=props.expired;
  const spam=props.spam;
  const server = props.server;
  const remove=props.remove;

  useEffect(() => {

  }, []);

  const self={
    onClick:(ev)=>{
      console.log('Ready to remove the online verify JSON file.');
      const data = { id: "drop_id", method: "drop", params: {spam:spam } }
      tools.jsonp(server + '/manage/', data, (res) => {
        if(res.error){
          console.log(res);
          return false;
        }
        remove(server);
        props.fresh();
        
      });
    },
  }

  return (
    <Row>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        Authority expired time. {exp}
      </Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end">
        <Button size="md" variant="danger" onClick={(ev) => {
          self.onClick(ev);
        }}>Remove</Button>
      </Col>
    </Row>
  );
}
export default Tick;