import { Row,Col,Image } from 'react-bootstrap';

function To(props) {
  const address=props.address;
  const size ={
    content:[10,2]
  };
  return (
    <Row className='pb-2'>
      <Col className='text-end' xs={size.content[0]} sm={size.content[0]} md={size.content[0]} 
      lg={size.content[0]} xl={size.content[0]} xxl={size.content[0]} >
        <span className="to">{props.content}</span>
      </Col>
      <Col xs={size.content[1]} sm={size.content[1]} md={size.content[1]} 
      lg={size.content[1]} xl={size.content[0]} xxl={size.content[1]} >
        <Image 
            className='to_icon'
            src={`https://robohash.org/${address}.png`}
            rounded
            width="100%"
          />
      </Col>
    </Row>
  );
}
export default To;