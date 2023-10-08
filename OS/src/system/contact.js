import { Navbar,Container,Row, Col } from 'react-bootstrap';
import { useState,useEffect } from 'react';
//import RUNTIME from '../lib/runtime';

import ContactAdd from '../components/contact_add';
import ContactList from '../components/contact_list';
import ContactSetting from '../components/contact_setting';

import RUNTIME from '../lib/runtime';
import CHAT from '../lib/chat';

let selected=null;

let websocket = null;
let spam = "";

let chats={};

function Contact(props) {
  const size = [3, 6, 3];
  const funs = props.funs;

  let [editing, setEditing] = useState(false);
  let [count, setCount] = useState(0);

  const self = {
    clickSetting:(ev)=>{
      funs.dialog.show((<ContactSetting funs={funs}/>),"Contact setting")
    },
    clickEdit:(ev)=>{
      setEditing(!editing);
      if(editing && selected!==null){
        const list=[];
        for(var address in selected){
          if(selected[address]===true){
            list.push(address);
          }
        }
        //console.log(list);
        RUNTIME.removeContact(list,(res)=>{
          selected=null;
          self.fresh();
        });
      }
    },
    send: (obj) => {
      if(!spam ) return setTimeout(()=>{
        self.send(obj);
      },200);
      obj.spam=spam;
      websocket.send(JSON.stringify(obj));
    },
    linkChatting:(ev)=>{
      RUNTIME.getSetting((cfg) => {
        const config = cfg.apps.contact,uri = config.node[0];
        const agent = {
          open: (res) => {},
          message: (res) => {
            const str = res.data;
            try {
              const input = JSON.parse(str);
              //console.log(input);
              switch (input.act) {
                case "init":
                  spam = input.spam;
                  RUNTIME.setSpam(uri,input.spam);
                  break;
                case "chat":
                    console.log(input);
                    if(!chats[input.address]) chats[input.address]=[];
                    chats[input.address].push(input);

                    RUNTIME.getAccount((acc) => {
                      //console.log(acc)
                      CHAT.save(acc.address,input.from,input.msg,(res)=>{
                        console.log(res);
                      })
                    })

                    setCount(count++);
                    break;
                case "reg":

                  break;
                case "notice":
                  break;
                default:
                  break;
              }
  
            } catch (error) {
  
            }
          },
          close: (res) => {
            websocket=null;   //remove websocket link
          },
          error: (res) => {
  
          }
        }
        RUNTIME.websocket(uri, (ws) => {
          websocket = ws;
          RUNTIME.getAccount((acc) => {
            if(acc===null || !acc.address) return false;
            const data = {
              act: "active",
              acc: acc.address,
            }
            self.send(data);
          });
        },agent);
      });
    },
    fresh:()=>{
      const n=count+1;
      setCount(n);
    },
    select:(map)=>{
      selected=map;
    },
  };

  useEffect(() => {
    //INDEXED.test();
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
        <ContactAdd  funs={funs} fresh={self.fresh} /> 
        <ContactList funs={funs} fresh={self.fresh} select={self.select} edit={editing} count={count}/>
      </Container>
        <div className="opts">
          <img src="icons/remove.svg" className='opt_button' alt="" onClick={(ev)=>{
            self.clickEdit(ev)
          }}/>
          <img src="icons/setting.svg" className='opt_button' alt="" onClick={(ev)=>{
            self.clickSetting(ev)
          }}/>
          <img src="icons/link.svg" className='opt_button' alt="" onClick={(ev)=>{
            self.linkChatting(ev)
          }}/>
        </div>
    </div>
  );
}
export default Contact;