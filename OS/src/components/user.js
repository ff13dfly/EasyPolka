import { Container, Row, Col, Button } from 'react-bootstrap';

import { useState, useEffect } from 'react';

import STORAGE from '../lib/storage.js';

function User(props) {
  let [amount, setAmount] = useState(0);
  let [avatar, setAvatar] = useState('user.png');
  let [info, setInfo] = useState('');
  let [disable, setDisable] = useState('');

  const fa = STORAGE.getKey("signature");
  //const address = fa.address;
  const address="5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw";

  const self = {
    init: () => {

    },
    remove: () => {
      STORAGE.removeKey("signature");
      props.fresh();      //父组件传过来的
    },
    charge: () => {
      setDisable('disabled');
      //console.log('here...');
      setInfo('Requesting...');
      // props.auto('vMarket','apply',{},(res)=>{
      //   if(res.message){
      //     setInfo(res.message);
      //   }else{
      //     setInfo(`Apply successful. Got ${res.amount} coins`);
      //   }
      //   setTimeout(()=>{
      //     setDisable('');
      //     setInfo('');
      //   },3000);
      // });
    },
    download: () => {
      const pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(fa));
      pom.setAttribute('download', address + '.json');
      if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
      } else {
        pom.click();
      }
    },
  };

  const cls = {
    "wordWrap": "break-word",
  };

  useEffect(() => {
    //console.log('useEffect...');
    props.balance(address, (res) => {
      //console.log(res.data.toJSON())
      if (res === false) {
        setAmount('unknown');
      } else {
        setAmount(parseFloat(res.data.free.toBn() * 0.000000000001).toLocaleString());
      }
    });
    setAvatar(`https://robohash.org/${address}.png`);

  });

  const amap = {
    "width": "60px",
    "height": "60px",
    "borderRadius": "30px",
    "background": "#FFAABB",
  };

  return (
    <Container>
      <Row className="pt-2" >
        <Col lg={2} xs={2} className="pt-2" >
          <img style={amap} src={avatar} />
        </Col>
        <Col lg={6} xs={6} className="pt-2" >
          <h3>{""}</h3>
          <p>{amount} unit</p>
        </Col>
        <Col lg={4} xs={4} className="pt-4 text-end" >
          <Button size="sm" variant="danger" onClick={self.remove} > Remove </Button>{' '}
        </Col>
        <Col lg={12} xs={12} className="text-end" >{info}</Col>

        <Col lg={8} xs={8} className="pt-2 text-start" ><p className="text-justify" style={cls}>{address}</p></Col>
        <Col lg={4} xs={4} className="pt-3 text-end" >
          <Button size="sm" variant="primary" onClick={self.charge} disabled={disable} > Free charge </Button>{' '}
        </Col>
        <Col lg={8} xs={8} className="pt-4 text-start" >
          <p className='text-muted'>Download your encry verify file.</p>
        </Col>
        <Col lg={4} xs={4} className="pt-4 text-end" >
          <Button size="sm" variant="primary" onClick={self.download} > Download </Button>{' '}
        </Col>
      </Row>
    </Container>
  );
}
export default User;