import { Row,Col,Image } from 'react-bootstrap';

function From(props) {
  const address=props.address;
  const size ={
    content:[2,10]
  };
  return (
    <Row className='pb-2'>
      <Col xs={size.content[0]} sm={size.content[0]} md={size.content[0]} 
      lg={size.content[0]} xl={size.content[0]} xxl={size.content[0]} >
          <Image 
            className='from_icon'
            src={`https://robohash.org/${address}.png`}
            rounded
            width="100%"
          />
      </Col>
      <Col xs={size.content[1]} sm={size.content[1]} md={size.content[1]} 
      lg={size.content[1]} xl={size.content[0]} xxl={size.content[1]} >
        <p className="from">{props.content}</p>
      </Col>
    </Row>
  );
}
export default From;