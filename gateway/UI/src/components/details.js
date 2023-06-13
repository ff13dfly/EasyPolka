import { Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const tools = require('../lib/tools');

function Details(props) {
  const data=props.data;
  const monitor=!data?{}:data.monitor;
  console.log(monitor);
  
  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2 text-end"><hr /></Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2 text-end">
        <table>
          <tbody>
            <tr>
              <td>Uploaded</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2 text-end">
        {JSON.stringify(data.status)}
      </Col>
    </Row>
  );
}
export default Details;