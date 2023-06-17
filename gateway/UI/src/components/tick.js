import { Row, Col, Button } from 'react-bootstrap';
import { useEffect,useState } from 'react';

const tools = require('../lib/tools');

function Tick(props) {
  const exp=props.expired;
  const spam=props.spam;
  const server = props.server;

  const self={
    onClick:(ev)=>{
      console.log('Ready to remove the online verify JSON file.');
      const data = { id: "drop_id", method: "drop", params: {spam:spam } }
      tools.jsonp(server + '/manage/', data, (res) => {
        if(res.error){
          console.log(res);
          return false;
        }
        props.remove(server);
        props.fresh();
      });
    },
    getLeft:(dead)=>{
      return parseInt((dead-tools.stamp())*0.001);
    }
  }

  let [left,setLeft]=useState(self.getLeft(exp.password));
  let [fa,setFa]=useState(self.getLeft(exp.file));

  useEffect(() => {
    const timer=setInterval(()=>{
      const left=self.getLeft(exp.password);
      const fleft=self.getLeft(exp.file);
      if(left<0){
        clearInterval(timer);
        props.fresh();
      }else{
        setLeft(left);
        setFa(fleft);
      }
    },1000);
  }, []);

  return (
    <Row>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        {left}s left to input password again.<br />
        {fa}s left to auto drop.<br />
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