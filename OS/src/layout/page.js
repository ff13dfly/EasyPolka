import { Row, Col } from 'react-bootstrap';
import { useEffect,useState} from 'react';

//dialog page container, hidden default

function Page(props) {
  const alink=props.anchor;

  let [link,setLink]=useState("");

  //const basic="http://localhost/easypolka/loader/frontend/code/index.html";
  const basic="loader.html";

  const self={
  };

  useEffect(() => {
    //self.router(router);
    setLink(`${basic}#${alink}#`);
  }, []);


  return (
    <div id="page">
      <Row>
        <Col lg={12} xs={12} className="pt-2">Title and Status here</Col>
        <Col lg={12} xs={12} className="pt-2">
          <iframe src={link}></iframe>
        </Col>
      </Row>
      <span id="close" onClick={(ev)=>{
        props.funs.page("");
      }}>X</span>
    </div>
  );
}
export default Page;