import { Row, Col } from 'react-bootstrap';
import { useState,useEffect } from 'react';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';

function Transaction(props) {
  const size={
    row:[12],
  };
  const block=props.block;
  const hash=props.hash;
  const row=JSON.parse(props.row);

  let [details, setDetails] = useState('');

  const self={
    status:(list)=>{
      const evs=list.toHuman();
      const map={};
      for(let i=0;i<evs.length;i++){
        const ev=evs[i],index=ev.phase.ApplyExtrinsic;
        if(ev.event.section!=="system") continue;
        map[index]=ev.event.method;
      }
      return map;
    },
  };

  useEffect(() => {
    RUNTIME.getActive((pok)=>{
      if(pok===null) return false;
      pok.rpc.chain.getBlock(block).then((res)=>{
        const data=res.toHuman();
        console.log(data);
        setDetails((<p>On <strong>{row.more.blocknumber.toLocaleString()}</strong>, 
        amount <strong>{row.amount}</strong> index <strong>{row.more.index}</strong><br />
        At {tools.toDate(row.stamp)}</p>));

        pok.query.system.events.at(block,(evs)=>{
          const list=self.status(evs);
          console.log(list);
          console.log(evs);

          res.block.extrinsics.forEach((ex, index) => {
            const dt = ex.toHuman();
            console.log(dt);
          });
        });
      }).catch((error)=>{
        console.log(error);
        setDetails(`Invalid data.`);
      })
    });
  }, []);

  return (
    <Row className='pt-1'>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <h5>Summary</h5>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        {details}
      </Col>
      <Col className='pt-3' xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Block Hash</small>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea name="" style={{width:"100%"}} rows="3" disabled={true} defaultValue={block}></textarea>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <small>Transaction Hash</small>
      </Col>
      <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
        <textarea name="" style={{width:"100%"}} rows="3" disabled={true} defaultValue={hash}></textarea>
      </Col>
    </Row>
  );
}
export default Transaction;