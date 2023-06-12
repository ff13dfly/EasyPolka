import { Row, Col, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';


const tools = require('../lib/tools');
const encry = require('../lib/encry');
const DB = require('../lib/mndb');


function Verify(props) {
  const server = props.server;
  const setAuth = props.authority;
  const fresh = props.fresh;
  const show = props.show;
  const uploaded = props.uploaded;
  const spam = props.spam;

  let [disable, setDisable] = useState({ upload: uploaded, verify: false });
  let [info, setInfo] = useState("");
  let [code, setCode] = useState("");
  let [pass, setPass] = useState("");

  const self = {
    passChange: (ev) => {
      setPass(ev.target.value);
    },
    passClick: (ev) => {
      if (!pass) return setInfo('No password to verify.');
    },
    getAES: (ck) => {

    },
    verifyClick: (ev) => {
      if (!code) return setInfo('No encry json file.');
      if (!pass) return setInfo('No password to decode.');


      //1.encrypto by ( md5(address) ) the temp AES key and iv 
      const md5 = encry.md5(code.address), key = md5.substring(0, 16), iv = md5.substring(16, 32);
      const s_key = tools.char(13, "key"), s_iv = tools.char(14, "iv");
      encry.setKey(key);
      encry.setIV(iv);
      console.log(`${s_key}.${s_iv}`);
      const security = encry.encrypt(`${s_key}.${s_iv}`);

      const data = { id: "handshake_id", method: "handshake", params: { code: security, spam: spam } }
      tools.jsonp(server + '/manage/', data, (res) => {
        if (!res.result || !res.result.token) return false;
        //2. get the new AES key and iv from Hub, then upload the JSON file
        //2.1.decode to get the new AES key and iv
        encry.setKey(s_key);
        encry.setIV(s_iv);
        const token = encry.decrypt(res.result.token);

        //2.2.encrypto the json file and sent to Hub
        const tmp = token.split(".");
        encry.setKey(tmp[0]);
        encry.setIV(tmp[1]);
        const fa = encry.encrypt(JSON.stringify(code));

        const up_data = { id: "upload_id", method: "upload", params: { file: fa, spam: spam } }
        tools.jsonp(server + '/manage/', up_data, (resUpload) => {
          //3.sent the password to confirm the authority ( the json file can storage in the Hub for 10 mins )
          //seperate the password for the scenior, two person control the Hub
          const password = encry.encrypt(pass);
          const pass_config = { id: "auth_id", method: "auth", params: { pass: password, spam: spam } }
          tools.jsonp(server + '/manage/', pass_config, (resAuth) => {
            const access = encry.decrypt(resAuth.result.access);
            const obj = JSON.parse(access);
            setAuth(obj.exp, resAuth.result.access);
            fresh();
          });
        });
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
    <Row hidden={!show}>
      <Col md={12} lg={12} xl={12} xxl={12}>
        <Form.Control size="md" type="file" hidden={disable.upload} placeholder="Encrypto JSON file upload..."
          onChange={(ev) => {
            self.fileChange(ev);
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