import { Row,Col,Image } from 'react-bootstrap';

function To(props) {
  const size = [2,10];
  const cmap={
    background:"#EEEEEE",
  }

  return (
    <Row className='pt-1'>
      <Col xs={10} sm={10} md={10} lg={10} xl={10} xxl={10} >
        <p className="to">{props.content}</p>
      </Col>
      <Col xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} >
        <Image 
            src={`https://robohash.org/${props.address}.png`}
            rounded
            width="100%"
            style={cmap}
          />
      </Col>
    </Row>
  );
}
export default To;