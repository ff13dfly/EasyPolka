import { Row, Col, Form, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

function Verify(props) {
  const node = props.server;
  const setAuth=props.authority;
  //const fresh=props.fresh;
  const show=props.show;

  let [disable, setDisable] = useState({ upload: false, verify: false });
  let [info, setInfo] = useState("");
  let [code, setCode] = useState("");
  let [pass, setPass] = useState("");

  const tools = require('../lib/tools');
  const encry = require('../lib/encry');
  const tmp_encrypto = {
    key: "",
    iv: "",
  }

  const self = {
    fresh: () => {
      tmp_encrypto.key = tools.char(16);
      tmp_encrypto.iv = tools.char(16);
    },
    getTemp: () => {
      return `${tmp_encrypto.key}.${tmp_encrypto.iv}`;
    },
    passChange: (ev) => {
      setPass(ev.target.value);
    },
    passClick: (ev) => {
      if (!pass) return setInfo('No password to verify.');
      //console.log(pass);
      // tools.jsonp(node,{id:"abc",method:"spam"},(res)=>{
      //   const spam=res.result.spam;
      //   const data={id:"auth_id",method:"handshake",params:{pass:pass}}
      //   tools.jsonp(node+'/manage/',data,(res)=>{

      //   });
      // });
    },
    uploadClick: (ev) => {
      if (!code) return setInfo('No encry json file.');
      const md5 = encry.md5(code.address);
      const key = md5.substring(0, 16), iv = md5.substring(16, 32);
      encry.setKey(key);
      encry.setIV(iv);

      //console.log(self.getTemp());
      const s_key = "1234123412ABCDEF", s_iv = "ABCDEF1234123412";
      const security = encry.encrypt(`${s_key}.${s_iv}`);

      tools.jsonp(node, { id: "abc", method: "spam" }, (res) => {
        //console.log(res);
        const spam = res.result.spam;
        const data = { id: "auth_id", method: "handshake", params: { code: security, spam: spam } }
        tools.jsonp(node + '/manage/', data, (res) => {
          //console.log(res);
          if (!res.result || !res.result.token) return false;
          encry.setKey(s_key);
          encry.setIV(s_iv);
          const token = encry.decrypt(res.result.token);
          const tmp = token.split(".");

          encry.setKey(tmp[0]);
          encry.setIV(tmp[1]);
          const fa = encry.encrypt(JSON.stringify(code));
          console.log(fa);
          const up_config = { id: "auth_id", method: "upload", params: { file: fa, spam: spam } }
          tools.jsonp(node + '/manage/', up_config, (res) => {
            //console.log(res);
            const pass = encry.encrypt('123456');
            const pass_config = { id: "auth_id", method: "auth", params: { pass: pass, spam: spam } }
            tools.jsonp(node + '/manage/', pass_config, (res) => {
              //console.log(res);
              const access = encry.decrypt(res.result.access);
              const obj=JSON.parse(access);
              //obj.token=res.result.access;
              setAuth(obj.exp,res.result.access);
              //fresh();
            });
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
    self.fresh();
    //console.log(self.getTemp());
  }, []);

  return (
    <Row hidden={!show}>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        Vertifying Management Account
      </Col>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        <Form.Control size="md" type="file" hidden={disable.upload} placeholder="Password to verify..."
          onChange={(ev) => {
            self.fileChange(ev);
          }} />
        <p>{info}</p>
      </Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end">
        <Button hidden={disable.upload} onClick={() => {
          self.uploadClick();
        }}>Upload</Button>
      </Col>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        <Form.Control size="md" type="text" hidden={disable.verify} placeholder="Password to verify..."
          onChange={(ev) => {
            self.passChange(ev);
          }} />
      </Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end">
        <Button hidden={disable.verify} onClick={() => {
          self.passClick();
        }}>Verify</Button>
      </Col>
    </Row>
  );
}
export default Verify;