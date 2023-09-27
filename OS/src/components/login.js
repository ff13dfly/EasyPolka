
import { Container,Row, Col, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { Keyring } from '@polkadot/api';

import STORAGE from '../lib/storage.js';


function Login(props){
    let [password,setPassword]   =useState('');
    let [info,setInfo]=useState( 'Upload the encry file then import.');
    let [encoded, setEncoded] =useState('');

    const self={
      addAccount:()=>{
        props.register();
      },
      changeFile:(ev)=>{
        //1.这里需要对文件内容进行处理
        try {
          const fa = ev.target.files[0];
          const reader = new FileReader();
          reader.onload = (e)=>{
            try {
              const sign=JSON.parse(e.target.result);
              if(!sign.address || !sign.encoded) return setInfo('Error encry JSON file');
              if(sign.address.length!==48)  return setInfo('Error SS58 address');
              if(sign.encoded.length!==268)  return setInfo('Error encoded verification');
              setInfo('Encoded account file loaded');
              setEncoded(sign);
            }catch (error) {
              console.log(error);
              setInfo('Not encry JSON file');
            }
          };
          reader.readAsText(fa);
        }catch (error) {
          setInfo('Can not load target file');
        }
      },
      changePassword:(ev)=>{
        setPassword(ev.target.value);
      },

      save:()=>{
        if(!password) return false;
        if(!encoded) return setInfo('Load encoded JSON file first');
        const keyring = new Keyring({ type: 'sr25519' });
        const pair = keyring.createFromJson(encoded);
        try {
            pair.decodePkcs8(password);
            self.setSignJSON(encoded);
            props.fresh();      //父组件传过来的
        } catch (error) {
            setInfo('Password error');
            if(error) return false;
        }

      },
      setSignJSON:(fa)=>{
        STORAGE.setKey("signature",fa);
      }
    };
    
    return (
      <Container>
        <Row className = "pt-4" >
        <Col lg = { 6 } xs = { 6 } className = "pt-4" >
          <p>Create an account to join FreeSaying.net</p>
        </Col> 
        <Col lg = { 6 } xs = { 6 } className = "pt-4 text-end" >
          <Button size = "md" variant = "primary" onClick = { (self.addAccount) } >New Account</Button>{' '}
        </Col> 
      </Row>
      <Row>
        
        <Col lg = { 12 } xs = { 12 } className = "pt-4 pb-4"><hr /></Col>

        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
          <Form.Control size = "md" type = "file" placeholder = "Add Polkadot account JSON file..." onChange = { self.changeFile }/>
        </Col>
        <Col lg = { 5 } xs = { 12 } className = "pt-2" >
          <Form.Control size = "md" type = "password" placeholder = "Account password..." onChange = {self.changePassword}/> </Col > 
        <Col lg = { 2 } xs = { 12 } className = "pt-2 text-end" >
         
        </Col>
        <Col lg = { 8 } xs = { 8 } className = "pt-2" >
					<p className='pl-2'>{info}</p>
				</Col> 
				<Col lg = { 4 } xs = { 4 } className = "pt-2 text-end" >
          <Button size = "md" variant = "primary" onClick = { self.save } > Import </Button>{' '}
				</Col> 
        </Row>
      </Container>
    );
}
export default Login;