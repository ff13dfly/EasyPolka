import { useEffect,useState } from 'react';

function Crumbs(props) {
  let [owner, setOwner ]= useState("");
  let [block, setBlock ]= useState(0);

  const API=props.API;
  //console.log(API);
  
  //let count=0;
  //const max=50,step=100;

  useEffect(() => {
    if(props.anchor && API.AnchorJS.ready()){
      API.AnchorJS.search(props.anchor,(res)=>{
        //console.log(res);
        setOwner(res.signer);
        setBlock(res.block);
      })
    }
  }, [props.anchor]);

  return (
    <p id="ownship"> Anchor Name: {props.anchor} on {!block?0:block.toLocaleString()} signer: {owner}</p>
  );
}

export default Crumbs;