import { Navbar, Container, Row, Col } from 'react-bootstrap';
import { useEffect,useState } from 'react';

import Paybill from '../components/paybill';

function Payment(props) {
  const size = [3, 6, 3, 12];
  const table = [3, 9];
  const funs=props.funs;
  
  let [from, setFrom] = useState("");
  let [account, setAccount] = useState("");
  let [amount, setAmount] = useState(0);

  const desc="The payment can not be called back, please confirm the account you want to pay.";
  const self = {
    changeAmount:(ev)=>{
      setAmount(ev.target.value);
    },
    changeAccount:(ev)=>{
      setAccount(ev.target.value)
    },
    click:(ev)=>{
      
      funs.dialog.show(
        (<Paybill callback={(pass) => {
          
        }} desc={desc} from={from} target={account} amount={amount} funs={funs} />),
        "Payment confirm"
      );
    },
  }

  useEffect(() => {
    setFrom("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
  }, []);
  return (
    <div id="page">
      <Navbar className="bg-body-tertiary">
        <Container>
          <Row style={{"width":"100%","margin":"0 auto"}}>
            <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
            style={{"paddingTop":"6px"}}>
              <Navbar.Brand href="#">W<span className='logo'>3</span>OS</Navbar.Brand>
            </Col>
            <Col xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]}
              style={{"paddingTop":"10px"}} className='text-center'>
              Payment</Col>
            <Col xs={size[2]} sm={size[2]} md={size[2]} lg={size[2]} xl={size[2]} xxl={size[2]} 
              className="text-end pb-2" style={{"paddingTop":"10px"}}>
              <span className="close" onClick={(ev) => {
                props.funs.page("");
              }}>X</span>
            </Col>
          </Row>
        </Container>
      </Navbar>
      <Container>
        <Row>
          <Col xs={size[3]} sm={size[3]} md={size[3]} lg={size[3]} xl={size[3]} xxl={size[3]}>
              Account selector
          </Col>
          <Col xs={size[3]} sm={size[3]} md={size[3]} lg={size[3]} xl={size[3]} xxl={size[3]}>
              Account details
          </Col>
        </Row>
        <Row className='pt-4'>
          <Col xs={size[3]} sm={size[3]} md={size[3]} lg={size[3]} xl={size[3]} xxl={size[3]}>
            <small>Account to pay</small>
            <textarea className="form-control" id="" cols="10" rows="3" defaultValue={props.target} onChange={(ev)=>{
              self.changeAccount(ev);
            }}></textarea>
          </Col>
          <Col className='pb-4' xs={size[3]} sm={size[3]} md={size[3]} lg={size[3]} xl={size[3]} xxl={size[3]}>
            <small>Amount to pay</small>
            <input type="number" className="form-control" defaultValue={props.amount} onChange={(ev)=>{
              self.changeAmount(ev);
            }}/>
          </Col>

          <Col className='pt-4 text-end' xs={size[3]} sm={size[3]} md={size[3]} lg={size[3]} xl={size[3]} xxl={size[3]}>
            <button className='btn btn-md btn-primary' onClick={(ev)=>{
              self.click(ev);
            }}>Payment</button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Payment;