import { Row,Col,Form,Button } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function Link(props) {

  let [hub,setHub]=useState("");
  
  const self={
    onChange:(ev)=>{
        setHub(ev.target.value);
    },
    onClick:(ev)=>{
      console.log(hub);
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
        <Col md={6} lg={6} xl={6} xxl={6} className="pt-2">
          <h5 className="pt-2">Gateway UI</h5>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
          <Form.Control 
            size="md" 
            type="text" 
            placeholder="Gateway URI to add..." 
            onChange={(ev) => {
                self.onChange(ev)
            }} 
            onKeyDown={(ev)=>{}}
          />
        </Col>
        <Col md={2} lg={2} xl={2} xxl={2} className="pt-2 text-end">
          <Button onClick={() => {
            self.onClick()
            }}>Add</Button>
        </Col>
        <Col md={12} lg={12} xl={12} xxl={12}><hr /></Col>
      </Row>
  );
}
export default Link;