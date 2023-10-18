import { Modal } from 'react-bootstrap';
import { useState,useEffect } from 'react';

function Dialog(props) {

  let [show,setShow]=useState(false);

  useEffect(() => {
    setShow(props.show)
    //document.body.style.overflow = props.show ? "hidden" : "unset";
  }, [props.show,props.callback]);

  //<Modal show={props.show} size="lg" onHide={funs.dialog.hide()}>

  return (
    <Modal show={show} size="lg" onHide={(ev)=>{
      props.funs.dialog.hide();
    }} centered={!props.center?false:true}>
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