import { Row, Col, Button } from 'react-bootstrap';
import { useEffect } from 'react';

function Tick(props) {
  const show=props.show;
  const exp=props.expired;
  useEffect(() => {

  }, []);

  const self={
    onClick:(ev)=>{
      console.log('Ready to remove the online verify JSON file.');
    },
  }

  return (
    <Row hidden={!show}>
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