import { Navbar, Container, Row, Col } from 'react-bootstrap';
import { useEffect,useState } from 'react';

import Login from '../components/login';
import User from '../components/user';
import RUNTIME from '../lib/runtime';

function Account(props) {
  const size = [3, 6, 3];
  const funs=props.funs;
  
  let [details, setDetails] = useState("");
  let [animation,setAnimation]=useState("ani_scale_in");

  const self = {
    fresh:()=>{
      RUNTIME.getAccount((sign)=>{
        if(sign===null){
          setDetails(<Login fresh={self.fresh} funs={funs} />);
        }else{
          setDetails(<User fresh={self.fresh} balance={self.balance}/>);
        }
      });
    },
    balance:(address,ck)=>{
      RUNTIME.getAPIs((API) => {
        if(API.AnchorJS.ready()){
          return API.AnchorJS.balance(address,ck);
        }
        setTimeout(()=>{
          self.balance(address,ck);
        },100);
      });
    },
  }

  useEffect(() => {
    self.fresh();
    RUNTIME.networkStatus("anchor",(res)=>{
      //console.log(res);
    });
  }, []);

  return (
    <div id="page" className={animation}>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Row style={{"width":"100%","margin":"0 auto"}}>
            <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
            style={{"paddingTop":"6px"}}>
              <Navbar.Brand href="#">W<span className='logo'>3</span>OS</Navbar.Brand>
            </Col>
            <Col xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]}
              style={{"paddingTop":"10px"}} className='text-center'>
              Account Setting</Col>
            <Col xs={size[2]} sm={size[2]} md={size[2]} lg={size[2]} xl={size[2]} xxl={size[2]} 
              className="text-end pb-2" style={{"paddingTop":"10px"}}>
              <span className="close" onClick={(ev) => {
                setAnimation("ani_scale_out");
                setTimeout(()=>{
                  props.funs.page("");
                },300);
              }}><button className='btn btn-sm btn-default'>X</button></span>
            </Col>
          </Row>
        </Container>
      </Navbar>
      <Container>
        {details}
      </Container>
    </div>
  );
}
export default Account;