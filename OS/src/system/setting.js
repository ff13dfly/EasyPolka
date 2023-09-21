import { Container,Row, Col } from 'react-bootstrap';
import { useEffect } from 'react';

function Setting(props) {
  console.log(props.funs);
  const self = {

  };

  useEffect(() => {

  }, []);


  return (
    <div id="page">
      <Container >
      <Row>
        <Col lg={3} xs={3} className="pt-2"></Col>
        <Col lg={6} xs={6} className="pt-2 text-center">Network Setting</Col>
        <Col lg={3} xs={3} className="pt-2 text-end" onClick={(ev)=>{
        props.funs.page("");
      }}> X </Col>
        <Col lg={12} xs={12} className="pt-2">
          服务器配置
        </Col>
      </Row>
      {/* <span id="close" onClick={(ev)=>{
        props.funs.page("");
      }}>X</span> */}
      </Container>
    </div>
  );
}
export default Setting;