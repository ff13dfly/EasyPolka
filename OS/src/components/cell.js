import { Col } from 'react-bootstrap';
import Stage from '../layout/stage';
import Mask from '../layout/mask';
import Device from '../lib/device';

function Cell(props) {
  const size = props.size;
  const row = props.data;
  const funs = props.funs;

  const self = {
    calcBlock: (index) => {
      const details = Device.details();
      const range = details.range;
      const cellX = index % range[0];
      const cellY = Math.floor(index / range[0]);
      const posX = cellX * details.cell[0];
      const posY = details.gridY + cellY  * details.cell[1];
      return { position: [posX, posY], size: details.cell, screen: details.screen }
    },
    click: () => {
      const block = self.calcBlock(props.index)
      funs.stage(<Stage block={block} callback={(ev) => {
        funs.stage("");
        // const x=ev.screenX;
        // const y=ev.screenY;
        // const clickEvent = new MouseEvent('click', {
        //   view: window,
        //   screenX: x,
        //   screenY: y,
        // });
        // const elementAtPoint = document.elementFromPoint(x, y);
        // console.log(elementAtPoint);
        //elementAtPoint.click();
        //elementAtPoint.dispatchEvent(clickEvent);

      }} />);
    },
  }

  return (
    <Col xs={size} sm={size} md={size} lg={size} xl={size} xxl={size} className='pt-4 cell'
      onClick={(ev) => {
        self.click()
      }}
    >
      <span className={props.index % 2 ? "status green" : "status red"}></span>
      <span className='type'>{props.index % 2 ? "Data" : "Dapp"}</span>
      <img src={row.icon} alt="" />
      <h6>{row.short}</h6>
    </Col>
  );
}
export default Cell;