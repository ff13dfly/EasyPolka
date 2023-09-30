import { Container,Row, Col, Button } from 'react-bootstrap';

import { useState,useEffect } from 'react';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';

function Paybill(props) {
  const size={
    row:[12],
    head:[4,4,4],
    password:[4,8]
  };

  const funs = props.funs;

  let [info, setInfo] = useState('');

  const avatar_from=`https://robohash.org/${props.from}.png`;
  const avatar_to=`https://robohash.org/${props.target}.png`;

  const self = {
    onClick: (ev) => {
      console.log("clicked");

    },
  }
  useEffect(() => {


  });

  const amap = {
    "width": "90px",
    "height": "90px",
    "borderRadius": "30px",
    "background": "#FFAABB",
  };

  const cmap={
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  }

  return (
    <Container>
      <Row>
        <Col xs={size.head[0]} sm={size.head[0]} md={size.head[0]} 
          lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]} >
          <img style={amap} src={avatar_from} alt="user logo"/>
          <small style={cmap}>{props.from}</small>
        </Col>
        <Col className='text-center' xs={size.head[1]} sm={size.head[1]} md={size.head[1]} 
          lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]} >
            <h5 className='pt-4'>{props.amount}</h5>
            <p>{"------>"}</p>
        </Col>
        <Col xs={size.head[2]} sm={size.head[2]} md={size.head[2]} 
          lg={size.head[2]} xl={size.head[2]} xxl={size.head[2]} >
          <img style={amap} src={avatar_to} alt="user logo"/>
          <small style={cmap}>{props.target}</small>
        </Col>

        <Col className='pt-4' xs={size.row[0]} sm={size.row[0]} md={size.row[0]} 
          lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
          <input type="password" className='form-control' placeholder={`Password of ${tools.shorten(props.from)}`} />
        </Col>

        <Col className='pt-2' xs={size.password[0]} sm={size.password[0]} md={size.password[0]} 
          lg={size.password[0]} xl={size.password[0]} xxl={size.password[0]} >
          {info}
        </Col>

        <Col className='pt-2 text-end' xs={size.password[1]} sm={size.password[1]} md={size.password[1]} 
          lg={size.password[1]} xl={size.password[1]} xxl={size.password[1]} >
          <Button size="md" variant="primary" onClick={(ev) => {
            self.onClick(ev);
          }}> Pay Now </Button>
        </Col>
      </Row>
    </Container>
    
  );
}
export default Paybill;