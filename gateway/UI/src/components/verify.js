import { Row,Col,Form,Button } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function Verify(props) {
  let [disable,setDisable]=useState({upload:false,verify:false});
  let [info,setInfo]=useState("");
  let [code,setCode]=useState("");
  let [pass,setPass]=useState("");

  const tools=require('../lib/tools');

  const self={
    passChange:(ev)=>{
      setPass(ev.target.value);
    },
    passClick:(ev)=>{
      if(!pass) return setInfo('No password to verify.');
      console.log(pass);
      //TODO ready to sent the encry JSON file, by using encry token
    },
    uploadClick:(ev)=>{
      if(!code) return setInfo('No encry json file.');

      //TODO ready to sent the encry JSON file, by using encry token

      //1. sent a encry salt to server ( server will md5(salt+hub_name) to get the `key` and `iv`)
      // use the addresss as default salt md5(address) then get the temp `key` and `iv` to transfer the 

      //2. get the encried data to get `key` and `iv`

      //3. sent the encrypto data to server

    },
    fileChange:(ev)=>{
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
            setCode(JSON.stringify(sign));
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
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
      <Col md={12} lg={12} xl={12} xxl={12} className="pt-2">
        Vertifying Management Account
      </Col>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        <Form.Control size="md" type="file" hidden={disable.upload} placeholder="Password to verify..." 
        onChange={(ev) => {
          self.fileChange(ev);
        }}/>
        <p>{info}</p>
      </Col>
      <Col md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end">
        <Button hidden={disable.upload} onClick={()=>{
          self.uploadClick();
        }}>Upload</Button>
      </Col>
      <Col md={8} lg={8} xl={8} xxl={8} className="pt-2">
        <Form.Control size="md" type="text" hidden={disable.verify} placeholder="Password to verify..." 
        onChange={(ev) => {
          self.passChange(ev);
        }}/>
      </Col>
      <Col  md={4} lg={4} xl={4} xxl={4} className="pt-2 text-end">
        <Button hidden={disable.verify} onClick={()=>{
          self.passClick();
        }}>Verify</Button>
      </Col>
    </Row>
  );
}
export default Verify;