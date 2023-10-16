import { Container, Row, Col, Button,Badge } from 'react-bootstrap';

import { useState, useEffect } from 'react';

import RUNTIME from '../lib/runtime';
import tools from '../lib/tools';
import BILL from '../lib/bill';

function Paybill(props) {
  const size = {
    row: [12],
    head: [4, 4, 4],
    password: [8, 4]
  };

  const funs = props.funs;

  let [info, setInfo] = useState('');
  let [password, setPassword] = useState('');
  let [disable, setDisable]= useState(true);

  const avatar_from = `https://robohash.org/${props.from}.png`;
  const avatar_to = `https://robohash.org/${props.target}.png`;

  const self = {
    change: (ev) => {
      setPassword(ev.target.value);
    },
    onClick: (ev) => {
      setInfo("");
      setDisable(true);

      setInfo("Decode signature...");
      RUNTIME.getActive((wsAPI, Keyring) => {
        const to = props.target;
        const n = props.amount;
        RUNTIME.getAccount((acc) => {
          if (!acc){
            setInfo("No acitve account");
            return false;
          } 
          const keyring = new Keyring({ type: 'sr25519' });
          const pair = keyring.createFromJson(acc);
          try {
            pair.decodePkcs8(password);
            self.transfer(wsAPI, to, n, pair, (res) => {
              if(res===false){
                setInfo("Payment failed.");
                setDisable(false);
                return false;
              }else{
                console.log(res);
                switch (res.status) {
                  case 'InBlock':
                    setInfo("Payment is on progress.");

                    break;
                  case 'Finalized':
                    setInfo("Payment done.");
                    setDisable(false);
                    if(props.callback) props.callback();

                    setTimeout(()=>{
                      funs.dialog.hide();
                    },1500);
                    break;
                  default:
                    break;
                }
              }
            });
            return pair
          } catch (error) {
            console.log(error);
            setInfo("Invalid password.");
            setDisable(false);
            return false;
          }
        });
      });
    },
    transfer: function (wsAPI, ss58, amount, pair, ck) {
      let unsub = null;
      wsAPI.query.system.account(pair.address, ({ nonce, data: balance }) => {
        unsub();
        //console.log(`balance.free: ${balance.free}`);
        if (balance.free < self.tranform(200)) return ck && ck(false);
        try {
          //注意，如果目标账户的coin小于100的时候，会转账失败
          wsAPI.tx.balances.transfer(ss58, self.tranform(amount)).signAndSend(pair, ({ events = [], status, txHash }) => {
            if (status.type === 'InBlock') {
              console.log(`Ready to create a bill row`);
              funs.dialog.hide();
              const row={
                amount:amount,
                status:status.type,
                hash:txHash.toHex()
              };
              BILL.save(pair.address,ss58,row,(res)=>{
                console.log("Saved, force list to fresh");
              });
              ck && ck({status:status.type});
            } else if (status.type === 'Finalized') {
              const block_hash=status.asFinalized.toHex();
              const transfer_hash=txHash.toHex();
              const row={
                amount:amount,
                status:status.type,
                block:block_hash,
                hash:transfer_hash,
                stamp:tools.stamp(),
                more:{
                  blocknumber:3345
                },
              };
              BILL.update(pair.address,[row],(res)=>{

              });
              // BILL.save(pair.address,ss58,row,(res)=>{
              //   console.log("Updated, force list to fresh");
              // });
              ck && ck({status:status.type,hash:transfer_hash,block:block_hash});
              unsub();
            }
          });
        } catch (error) {
          //console.log(error);
          return ck && ck(false);
        }
      }).then((fun) => {
        unsub = fun;
      });
    },
    tranform: function (amount) {
      return amount * 1000000000000;
    },
  }

  useEffect(() => {
    setDisable(false);
  },[]);

  const amap = {
    "width": "81px",
    "height": "81px",
    "borderRadius": "30px",
    "background": "#FFAABB",
  };

  const cmap = {
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    fontSize:"14px",
  }

  return (
    <Container>
      <Row>
        <Col xs={size.head[0]} sm={size.head[0]} md={size.head[0]}
          lg={size.head[0]} xl={size.head[0]} xxl={size.head[0]} >
          <img style={amap} src={avatar_from} alt="user logo" />
          <p style={cmap} className='pt-2'>{props.from}</p>
        </Col>
        <Col className='text-center' xs={size.head[1]} sm={size.head[1]} md={size.head[1]}
          lg={size.head[1]} xl={size.head[1]} xxl={size.head[1]} >
          <h5 className='pt-4'>{props.amount}</h5>
          <p>{"------>"}</p>
        </Col>
        <Col xs={size.head[2]} sm={size.head[2]} md={size.head[2]}
          lg={size.head[2]} xl={size.head[2]} xxl={size.head[2]} >
          <img style={amap} src={avatar_to} alt="user logo" />
          <p style={cmap} className='pt-2'>{props.target}</p>
        </Col>

        <Col xs={size.row[0]} sm={size.row[0]} md={size.row[0]}
          lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
          <Badge bg="warning">Warning</Badge>  <h5>{props.desc}</h5>
        </Col>

        <Col className='pt-2' xs={size.row[0]} sm={size.row[0]} md={size.row[0]}
          lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]} >
          <input type="password" className='form-control' placeholder={`Password of ${tools.shorten(props.from)}`} onChange={(ev) => {
            self.change(ev);
          }} />
        </Col>

        <Col className='pt-2' xs={size.password[0]} sm={size.password[0]} md={size.password[0]}
          lg={size.password[0]} xl={size.password[0]} xxl={size.password[0]} >
          {info}
        </Col>

        <Col className='pt-2 text-end' xs={size.password[1]} sm={size.password[1]} md={size.password[1]}
          lg={size.password[1]} xl={size.password[1]} xxl={size.password[1]} >
          <Button size="md" variant="primary" disabled={disable} onClick={(ev) => {
            self.onClick(ev);
          }}> Pay Now </Button>
        </Col>
      </Row>
    </Container>
  );
}
export default Paybill;