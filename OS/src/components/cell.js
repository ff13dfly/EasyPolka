import { Col } from 'react-bootstrap';
import Stage from '../layout/stage';
import Mask from '../layout/mask';

function Cell(props) {
  const size=props.size;
  const row=props.data;
  const funs=props.funs;

  const self={

  }

  return (
    <Col xs={size} sm={size} md={size} lg={size} xl={size} xxl={size} className='pt-4 cell'
      onClick={(ev)=>{
        console.log(ev);
        console.log("click: "+row.short);
        funs.mask(<Mask callback={()=>{
          funs.mask("");
          funs.stage("");
        }}/>);
        funs.stage(<Stage y={ev.nativeEvent.y}/>);
      }}
    >
      <span className={props.index%2?"status green":"status red"}></span>
      <span className='type'>Data</span>
      <img src={row.icon} alt="" />
      <h6>{row.short}</h6>
    </Col>
  );
}
export default Cell;