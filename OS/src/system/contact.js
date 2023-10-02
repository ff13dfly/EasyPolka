import { Navbar,Container,Row, Col } from 'react-bootstrap';
import { useState,useEffect } from 'react';
//import RUNTIME from '../lib/runtime';

import ContactAdd from '../components/contact_add';
import ContactList from '../components/contact_list';
import ContactSetting from '../components/contact_setting';

function Contact(props) {
  const size = [3, 6, 3];
  const funs = props.funs;

  let [editing, setEditing] = useState(false);

  const self = {
    clickSetting:(ev)=>{
      funs.dialog.show((<ContactSetting funs={funs}/>),"Contact setting")
    },
    clickEdit:(ev)=>{
      setEditing(!editing);
    },
  };

  useEffect(() => {
    // RUNTIME.getAPIs((APIs)=>{
    //   console.log(APIs);
    //   const link="anchor://hello";
    //   APIs.Easy(link,(res)=>{
    //     console.log(res);
    //   });
    // });
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
              Contacts</Col>
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
        <ContactAdd  funs={funs} /> 
        <ContactList funs={funs} edit={editing}/>
      </Container>
        <div className="opts">
          <img src="icons/remove.svg" className='opt_button' alt="" onClick={(ev)=>{
            self.clickEdit(ev)
          }}/>
          <img src="icons/setting.svg" className='opt_button' alt="" onClick={(ev)=>{
            self.clickSetting(ev)
          }}/>
        </div>
    </div>
  );
}
export default Contact;