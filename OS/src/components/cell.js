import { Col } from 'react-bootstrap';

function Cell(props) {
  const size=props.size;
  const row=props.data;

  return (
    <Col xs={size} sm={size} md={size} lg={size} xl={size} xxl={size} className='pt-4 cell'
      onClick={(ev)=>{
        console.log("click");
      }}
    >
      <img src={row.icon} alt="" />
      <h6>{row.short}</h6>
    </Col>
  );
}
export default Cell;