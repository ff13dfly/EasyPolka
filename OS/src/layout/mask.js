function Mask(props) {

  return (
    <div id="mask" onClick={(ev)=>{
        if(props.callback) props.callback();
      }}>
  </div>
  );
}
export default Mask;