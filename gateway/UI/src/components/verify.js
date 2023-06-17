import { Row, Col, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const tools = require('../lib/tools');
const encry = require('../lib/encry');
//const DB = require('../lib/mndb');

function Verify(props) {
  const server = props.server;
  const setAuth = props.authority;
  const fresh = props.fresh;
  const uploaded = props.uploaded;
  const spam = props.spam;

  //console.log(spam);

  let [disable, setDisable] = useState({ upload: uploaded, verify: false });
  let [info, setInfo] = useState("");
  let [code, setCode] = useState("");
  let [pass, setPass] = useState("");
  let [address, setAddress] = useState("");

  const self = {
    passChange: (ev) => {
      setPass(ev.target.value);
    },
    addressChange: (ev) => {
      setAddress(ev.target.value);
    },
    passClick: (ev) => {
      if (!pass) return setInfo('No password to verify.');
    },
    removeClick:(ev)=>{
      const data = { id: "drop_id", method: "drop", params: {spam:spam } }
      tools.jsonp(server + '/manage/', data, (res) => {
        if(res.error){
          console.log(res);
          return false;
        }
        props.remove(server);
        props.fresh();
      });
    },
    verifyClick:(ev)=>{
      if(uploaded){
        self.verifyOnlyPassword(ev);
      }else{
        self.verifyFileAndPassword(ev);
      }
    },
    verifyFileAndPassword: (ev) => {
      if (!code) return setInfo('No encry json file.');
      if (!pass) return setInfo('No password to decode.');

      self.handshake(code.address,(res)=>{
        self.upload(res.key,res.iv,(resUpload)=>{

          self.auth(pass,(resAuth)=>{
            const access = encry.decrypt(resAuth.result.access);
            const obj = JSON.parse(access);
            setAuth(server,obj, resAuth.result.access);
            fresh();
          });

        });
      });
    },
    verifyOnlyPassword:(ev)=>{
      if (!address) return setInfo('No address to verify.');
      if (!pass) return setInfo('No password to verify.');
      if (address.length!==48) return setInfo('Invalid address to verify.');

      self.handshake(address,(res)=>{
        encry.setKey(res.key);
        encry.setIV(res.iv);

        self.auth(pass,(resAuth)=>{
          const access = encry.decrypt(resAuth.result.access);
          const obj = JSON.parse(access);
          setAuth(server,obj, resAuth.result.access);
          fresh();
        });
      });
    },

    handshake:(address,ck)=>{
      const md5 = encry.md5(address), key = md5.substring(0, 16), iv = md5.substring(16, 32);
      const s_key = tools.char(13, "key"), s_iv = tools.char(14, "iv");
      encry.setKey(key);
      encry.setIV(iv);
      const security = encry.encrypt(`${s_key}.${s_iv}`);
      const data = { id: "handshake_id", method: "handshake", params: { code: security, spam: spam } }
      tools.jsonp(server + '/manage/', data, (res) => {
        if (!res.result || !res.result.token) return ck && ck(false);
        encry.setKey(s_key);
        encry.setIV(s_iv);
        const token = encry.decrypt(res.result.token);

        //2.2.encrypto the json file and sent to Hub
        const tmp = token.split(".");
        encry.setKey(tmp[0]);
        encry.setIV(tmp[1]);
        return ck && ck({key:tmp[0],iv:tmp[1]});
      });
    },

    upload:(key,iv,ck)=>{
      encry.setKey(key);
      encry.setIV(iv);
      const fa = encry.encrypt(JSON.stringify(code));
      const up_data = { id: "upload_id", method: "upload", params: { file: fa, spam: spam } }
      tools.jsonp(server + '/manage/', up_data, (res) => {
        return ck && ck(res);
      });
    },

    auth:(pass,ck)=>{
      const password = encry.encrypt(pass);
      const pass_config = { id: "auth_id", method: "auth", params: { pass: password, spam: spam } }
      tools.jsonp(server + '/manage/', pass_config, (resAuth) => {
        return ck && ck(resAuth);
      });
    },

    
    fileChange: (ev) => {
      try {
        const fa = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const sign = JSON.parse(e.target.result);
            if (!sign.address || !sign.encoded) return setInfo('Error encry JSON file');
            if (sign.address.length !== 48) return setInfo('Error SS58 address');
            if (sign.encoded.length !== 268) return setInfo('Error encoded verification');
            setInfo('Encoded account file loaded');
            setCode(sign);
          } catch (error) {
            console.log(error);
            setInfo('Not encry JSON file');
          }
        };
        reader.readAsText(fa);
      } catch (error) {
        setInfo('Can not load target file');
      }
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={12} lg={12} xl={12} xxl={12}>
        <Form.Control size="md" type="file" hidden={disable.upload} placeholder="Encrypto JSON file upload..."
          onChange={(ev) => {
            self.fileChange(ev);
          }} />
      </Col>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2" hidden={!disable.upload}>
          Remove encry JSON file.
      </Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end" hidden={!disable.upload}>
        <Button size="sm" variant="danger" onClick={(ev) => {
          self.removeClick(ev);
        }}>Remove</Button>
      </Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        <Form.Control size="md" type="text" hidden={!disable.upload} placeholder="Account..."
          onChange={(ev) => {
            self.addressChange(ev);
          }} />
      </Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        <Form.Control size="md" type="text" hidden={disable.verify} placeholder="Password to verify..."
          onChange={(ev) => {
            self.passChange(ev);
          }} />
      </Col>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2 text-end">
        <Button hidden={disable.upload && disable.verify} onClick={() => {
          self.verifyClick();
        }}>Verify</Button>
      </Col>
      <Col md={12} lg={12} xl={12} xxl={12}>{info}</Col>
    </Row>
  );
}
export default Verify;