import { Row } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Cell from './cell';
import Device from '../lib/device';

const sum = 12;
let page = 0;

function Grid(props) {
  const size = props.size;
  const list = props.list;

  const num = Math.floor(sum / size[0]);

  const id="grid_container";
  
  useEffect(()=> {
    //const startY=Device.getStart(id);
    //console.log(startY);
  },[])

  return (
    <div id={id}>
      <Row className='pb-2'>
        {list[page].map((row, index) => (
          <Cell size={num} key={index} index={index} data={row} edit={props.edit} funs={props.funs}/>
        ))}
      </Row>
    </div>
  );
}
export default Grid;