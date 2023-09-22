import { Row,Col } from 'react-bootstrap';
import { useEffect } from 'react';

import RUNTIME from '../lib/runtime';

function Overview(props) {
  const anchor=props.link;

  useEffect(()=> {
    RUNTIME.getAPIs((APIs)=>{
      //APIs.AnchorJS.search()
      APIs.Easy(anchor,(res)=>{
        console.log(res);
      });
    });
  },[anchor]);

  return (
    <Row>
      <Col>{anchor}</Col>
      <Col></Col>
    </Row>
  );
}
export default Overview;