import { Row,Col,Form,Button } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function Verify(props) {
  let [disable,setDisable]=useState({upload:true,verify:true});
  
  const self={
    onChange:(ev)=>{
      //setURI(ev.target.value);
    },
    onKeydown:(ev)=>{
      if(ev.key==='Enter'){
        //self.dock(uri);
      }
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        Vertifying Management Account
      </Col>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        <Form.Control size="md" type="file" hidden={disable.upload} placeholder="Password to verify..." onChange={(ev) => {}}/>
      </Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end">
        <Button hidden={disable.upload}>Upload</Button>
      </Col>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        <Form.Control size="md" type="text" hidden={disable.verify} placeholder="Password to verify..." onChange={(ev) => {}}/>
      </Col>
      <Col  md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end">
        <Button hidden={disable.verify}>Verify</Button>
      </Col>
    </Row>
  );
}
export default Verify;