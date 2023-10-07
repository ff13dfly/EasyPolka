import { Modal } from 'react-bootstrap';
import { useState,useEffect } from 'react';

function Dialog(props) {

  let [show,setShow]=useState(false);
  const self={
    hide:(ev)=>{
      console.log(props)
      setShow(false);
      if(props.update) props.update();
      if(props.callback) props.callback(false);
    },
  }

  //setShow(props.show)

  useEffect(() => {
    //console.log(props.show);
    setShow(props.show)
  }, [props.show,props.callback]);

  //<Modal show={props.show} size="lg" onHide={funs.dialog.hide()}>

  return (
    <Modal show={show} size="lg" onHide={(ev)=>{
      self.hide(ev);
    }}>
      <Modal.Header closeButton>
        <Modal.Title >{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body >
        {props.content}
      </Modal.Body>
    </Modal>
  );
}
export default Dialog;