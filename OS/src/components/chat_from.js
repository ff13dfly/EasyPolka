import { Row,Col,Image } from 'react-bootstrap';

function From(props) {
  const size = [2,10];
  const cmap={
    background:"#EEEEEE",
  }

  return (
    <Row className='pt-1'>
      <Col xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} >
          <Image 
            src={`https://robohash.org/${props.address}.png`}
            rounded
            width="100%"
            style={cmap}
          />
      </Col>
      <Col xs={10} sm={10} md={10} lg={10} xl={10} xxl={10} >
        <p className="from">${props.content}</p>
      </Col>
    </Row>
  );
}
export default From;