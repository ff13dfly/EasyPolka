const self={
  decode:(input)=>{
    const check=input+'';
    const pre=check.substring(0,9);
    const body=check.substring(9,check.length);
    if(pre!=="anchor://") return false;

    const result={
      prefix:pre,
      body:body,
    }

    const network=self.checkNetwork(result.body);
    if(network!==false){
      const arr=result.body.split("@");
      arr.pop();
      let nbody=arr.join("@");
      if(nbody.substring(nbody.length-1,nbody.length)==="/" 
      && nbody.substring(nbody.length-2,nbody.length-1)!=="/") nbody=nbody.substring(0,nbody.length-1);
      result.body=nbody;
    }

    const location=self.checkLocation(result.body);
    result.name=location.name;
    result.block=location.block;
    if(location.key) result.key=location.key;
    return result;
  },
  checkLocation:(body)=>{
    const tmp=body.split("|");
    let key="";
    let nbody=body;
    if(tmp.length!==1){
      key=tmp.pop();
      nbody=tmp.join("");
    }

    const result={
      name:"",
      block:0,
      key:key,
    }

    const arr=nbody.split("/");
    if(arr.length!==1 && !isNaN(parseInt(arr[arr.length-1]))){
      result.block=parseInt(arr[arr.length-1]);
      arr.pop();
      result.name=arr.join("/");
    }else{
      result.name=arr.join("/");
    }
    return result;
  },
  
  checkNetwork:(body)=>{
    const tmp=body.split("@");
    if(tmp.length===1) return false;

    const net=tmp[1];
    const arr=net.split("://");
    if(arr.length===1) {
      return {network:net}
    }
    return {access:arr[0],name:arr[1]}
  },
}

const Decode=self.decode

export default Decode;