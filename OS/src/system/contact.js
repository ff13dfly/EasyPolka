import { Navbar, Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
//import RUNTIME from '../lib/runtime';

import ContactAdd from '../components/contact_add';
import ContactList from '../components/contact_list';
import StrangerList from '../components/contact_stranger';
import ContactSetting from '../components/contact_setting';

import RUNTIME from '../lib/runtime';
import CHAT from '../lib/chat';

let selected = {contact:null,stranger:null};

let websocket = null;
let spam = "";
let chats = {};
let active = false;  //account reg to server status
let friend=false;
let fresh_contact=0;
let fresh_stranger=0;

function Contact(props) {
  const size = [3, 6, 3];
  const funs = props.funs;

  let [editing, setEditing] = useState(false);
  let [count, setCount] = useState(0);
  let [stranger, setStranger]= useState(0);
  let [hidelink, setHidelink] = useState(false);
  let [animation,setAnimation]=useState("ani_scale_in");

  const self = {
    clickSetting: (ev) => {
      funs.dialog.show((<ContactSetting funs={funs} />), "Contact setting")
    },
    clickEdit: (ev) => {
      setEditing(!editing);
      if (editing && selected.contact !== null) {
        const list = [];
        for (const address in selected.contact) {
          if (selected.contact[address] === true) {
            list.push(address);
          }
        }

        RUNTIME.removeContact(list, (res) => {
          selected.contact = null;
          self.fresh();
        });
      }

      if (editing && selected.stranger !== null) {
        const list = [];
        for (const address in selected.stranger) {
          if (selected.stranger[address] === true) {
            list.push(address);
          }
        }

        RUNTIME.removeContact(list, (res) => {
          selected.contact = null;
          self.fresh();
        },true);
      }
    },
    send: (obj) => {
      if (!spam) return setTimeout(() => {
        self.send(obj);
      }, 200);
      obj.spam = spam;
      websocket.send(JSON.stringify(obj));
    },
    mailer: (address, fun) => {
      chats[address] = fun;
    },
    linkChatting: (ev) => {
      RUNTIME.getSetting((cfg) => {
        const config = cfg.apps.contact, uri = config.node[0];
        const agent = {
          open: (res) => { },
          message: (res) => {
            const str = res.data;
            try {
              const input = JSON.parse(str);
              console.log(input);
              switch (input.act) {
                case "init":        //websocket init, use is not active yet.
                  spam = input.spam;
                  RUNTIME.setSpam(uri, input.spam);
                  break;

                case "history":
                  RUNTIME.getAccount((acc) => {
                    CHAT.save(acc.address, input.from, input.msg, "from", (res) => {
                      console.log("history added");
                      self.fresh();
                      if(res!==true){
                        RUNTIME.addContact(res,()=>{
                        },true);
                      }
                    })
                  })
                  break;

                case "chat":
                  if (chats[input.from]) chats[input.from](input);
                  RUNTIME.getAccount((acc) => {
                    CHAT.save(acc.address, input.from, input.msg, "from", (res) => {
                      //console.log("chat added");
                      self.fresh();
                      if(res!==true){
                        RUNTIME.addContact(res,()=>{
                        },true);
                      }
                    })
                  });
                  break;
                case "reg":

                  break;
                case "active":
                  if (input.success) {
                    active = true;
                    setHidelink(true);
                    self.fresh();
                  }
                  break;
                case "notice":
                  //console.log(`Notice:${JSON.stringify(input)}`);
                  if (chats[input.from]) chats[input.from](input);
                  break;
                default:
                  break;
              }
            } catch (error) {

            }
          },
          close: (res) => {
            websocket = null;   //remove websocket link
          },
          error: (res) => {

          }
        }

        RUNTIME.getAccount((acc) => {
          if (acc === null || !acc.address){
            setHidelink(true);
            return false;
          } 
          RUNTIME.websocket(uri, (ws) => {
            websocket = ws;

            const data = {
              act: "active",
              acc: acc.address,
            }
            self.send(data);
          }, agent);
        });
      });
    },
    fresh: () => {
      fresh_contact++;
      fresh_stranger++;
      setCount(fresh_contact);
      setStranger(fresh_stranger);
    },
    select: (map,cat) => {
      selected[cat]= map;
    },
    checkActive: () => {
      RUNTIME.getSetting((cfg) => {
        const config = cfg.apps.contact, uri = config.node[0];
        RUNTIME.websocket(uri, (ws) => {
          console.log(ws);
        });
      });
    },
  };

  if(!friend){
    RUNTIME.getContact((fs)=>{
      CHAT.friends(fs);
      friend=true;
    });
  }
  
  // http://localhost/Easypolka/OS/service/chat/
  
  useEffect(() => {
    if (!active) {
      self.linkChatting();
    }
  }, []);

  return (
    <div id="page" className={animation}>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Row style={{ "width": "100%", "margin": "0 auto" }}>
            <Col xs={size[0]} sm={size[0]} md={size[0]} lg={size[0]} xl={size[0]} xxl={size[0]}
              style={{ "paddingTop": "6px" }}>
              <Navbar.Brand href="#">W<span className='logo'>3</span>OS</Navbar.Brand>
            </Col>
            <Col xs={size[1]} sm={size[1]} md={size[1]} lg={size[1]} xl={size[1]} xxl={size[1]}
              style={{ "paddingTop": "10px" }} className='text-center'>
              Contacts</Col>
            <Col xs={size[2]} sm={size[2]} md={size[2]} lg={size[2]} xl={size[2]} xxl={size[2]}
              className="text-end pb-2" style={{ "paddingTop": "10px" }}>
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
        <ContactAdd funs={funs} fresh={self.fresh} />
        <ContactList funs={funs} fresh={self.fresh} select={self.select} edit={editing} count={count} mailer={self.mailer} />
        <StrangerList funs={funs} fresh={self.fresh} select={self.select} edit={editing} count={stranger} mailer={self.mailer} />
      </Container>
      <div className="opts">
        <img src="icons/remove.svg" className='opt_button' alt="" onClick={(ev) => {
          self.clickEdit(ev)
        }} />
        <img src="icons/setting.svg" hidden={editing} className='opt_button' alt="" onClick={(ev) => {
          self.clickSetting(ev)
        }} />
        <img src="icons/link.svg" hidden={hidelink || active || editing} className='opt_button' alt="" onClick={(ev) => {
          self.linkChatting(ev)
        }} />
      </div>
    </div>
  );
}
export default Contact;