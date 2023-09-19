import { Row, Col } from 'react-bootstrap';
import { useEffect,useState} from 'react';
import { Config } from '../config/default.js';

//dialog page container, hidden default

function Page(props) {
  const router=props.router;
  const show=props.show;
  //console.log(router);
  //console.log(show);
  let [info,setInfo]=useState(router);


  const self={
    router:(page)=>{
      setInfo(page);
    },
  };

  useEffect(() => {
    self.router(router);
  }, []);


  return (
    <Row>
      <Col lg={12} xs={12} className="pt-2" id={Config.ID.page} >{info}</Col>
    </Row>
  );
}
export default Page;