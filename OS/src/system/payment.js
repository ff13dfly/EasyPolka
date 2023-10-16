import { Navbar, Container, Row, Col,Badge } from 'react-bootstrap';
import { useEffect,useState } from 'react';

import Paybill from '../components/paybill';
import Bill from '../components/bill';
import Balance from '../components/balance';
import RUNTIME from '../lib/runtime';

let fresh=0;

function Payment(props) {
  //const size = [3, 6, 3, 12];
  const size={
    head:[3,6,3],
    row:[12],
    account:[9,3],
  };
  const funs=props.funs;

  let [count, setCount]=useState(0);
  
  let [from, setFrom] = useState("");
  let [account, setAccount] = useState("");
  let [amount, setAmount] = useState(0);

  let [info,setInfo] =useState("");

  let [disable, setDisable] = useState({account:true,amount:true,pay:true});
  let [active,setActive] = useState({account:{background:"#FFFFFF"},amount:{background:"#FFFFFF"}});

  //const avatar_from=`https://robohash.org/${from}.png`;
  //const avatar_to=`https://robohash.org/${props.target}.png`;

  const desc="The payment can not be called back, please confirm the account you want to pay.";
  const self = {
    changeAmount:(ev)=>{
      self.clear();
      setAmount(ev.target.value);
    },
    changeAccount:(ev)=>{
      self.clear();
      setAccount(ev.target.value)
    },
    clear:()=>{
      const normal="#FFFFFF";
      if(active.account.background!==normal || active.amount.background!==normal){
        const map={account:{background:normal},amount:{background:normal}};
        setActive(map);
      }
    },
    checkAccount:(acc,from)=>{
      if(!acc) return false;
      if(acc.length!==48) return false;
      if(acc===from) return false;
      return true;
    },
    click:(ev)=>{
      const active_color="#d7a3a3";
      const normal="#FFFFFF";
      const map={account:{background:normal},amount:{background:normal}};
      if(!self.checkAccount(account,from)) map.account.background=active_color;
      if(!amount) map.amount.background=active_color;   
      setActive(map);
      if(!self.checkAccount(account) || !amount) return false;
      
      funs.dialog.show(
        (<Paybill callback={(res) => {
          console.log(fresh);
          self.fresh();
        }} desc={desc} from={from} target={account} amount={amount} funs={funs} />),
        "Payment confirm"
      );
    },
    fresh:()=>{
      fresh++;
      setCount(fresh);
    },
  }

  useEffect(() => {
    RUNTIME.getAccount((sign)=>{
      if(sign===null){
        
      }else{
        if(props.target && props.target===sign.address){
          console.log("here");
          setInfo("Can not pay to yourself.");
          setDisable({account:false,amount:false,pay:false});
        }else{
          setFrom(sign.address);
          setDisable({account:false,amount:false,pay:false});
        }
      }
    });
    if(props.target!==""){
      setAccount(props.target);
    }
  },[count]);

  const amap = {
    "width": "66px",
    "height": "66px",
    "borderRadius": "20px",
    "background": "#EEEEEE",
    "marginTop":"32px",
  };

  return (
    <div id="page" index={count}>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Row style={{"width":"100%","margin":"0 auto"}}>
            <Col xs={size.head[0]} sm={size.head[0]} md={size.head[0]} 
              lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]}
              style={{"paddingTop":"6px"}}>
              <Navbar.Brand href="#">W<span className='logo'>3</span>OS</Navbar.Brand>
            </Col>
            <Col className='text-center' xs={size.head[1]} sm={size.head[1]} md={size.head[1]}
              lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]}
              style={{"paddingTop":"10px"}}>
              Payment</Col>
            <Col className="text-end pb-2"  xs={size.head[2]} sm={size.head[2]} md={size.head[2]}
              lg={size.head[2]} xl={size.head[2]} xxl={size.head[2]}
              style={{"paddingTop":"10px"}}>
              <span className="close" onClick={(ev) => {
                props.funs.page("");
              }}>X</span>
            </Col>
          </Row>
        </Container>
      </Navbar>
      <Container>
        <Row className='pt-2'>
          <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <Badge bg='warning'>{info}</Badge>
          </Col>
          <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
            <Balance />
          </Col>
          <Col className='pb-2' xs={size.account[0]} sm={size.account[0]} md={size.account[0]}
            lg={size.account[0]} xl={size.account[0]} xxl={size.account[0]}>
            <small>Account to pay </small>
            <textarea className="form-control" disabled={disable.account} style={active.account} cols="10" rows="3" defaultValue={props.target} onChange={(ev)=>{
              self.changeAccount(ev);
            }}></textarea>
          </Col>

          <Col className='pb-2 text-center' xs={size.account[1]} sm={size.account[1]} md={size.account[1]}
            lg={size.account[1]} xl={size.account[1]} xxl={size.account[1]}>
              <img style={amap} src={account.length===48?`https://robohash.org/${account}.png`:"icons/empty.png"} alt="user logo"/>
          </Col>

          <Col className='pb-2' xs={size.account[0]} sm={size.account[0]} md={size.account[0]}
            lg={size.account[0]} xl={size.account[0]} xxl={size.account[0]}>
            <small>Amount to pay</small>
            <input type="number" className="form-control" disabled={disable.amount} style={active.amount} 
              defaultValue={props.amount} onChange={(ev)=>{
              self.changeAmount(ev);
            }}/>
          </Col>
          <Col className='pt-4 text-center' xs={size.account[1]} sm={size.account[1]} md={size.account[1]}
            lg={size.account[1]} xl={size.account[1]} xxl={size.account[1]}>
            <button className='btn btn-md btn-primary' disabled={disable.pay} onClick={(ev)=>{
              self.click(ev);
            }}>Pay</button>
          </Col>
        </Row>
        <Bill />
      </Container>
    </div>
  );
}
export default Payment;