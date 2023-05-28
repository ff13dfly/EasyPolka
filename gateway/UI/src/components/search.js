import { Form } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function Search(props) {

  let [uri,setURI]=useState("");
  
  const self={
    onChange:(ev)=>{
      setURI(ev.target.value);
    },
    onKeydown:(ev)=>{
      if(ev.key==='Enter'){
        //previous=name;
        self.dock(uri);
      }
    },
    dock:(uri)=>{
      
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Form.Control 
      size="md" 
      type="text" 
      placeholder="vService URI to add..." 
      onChange={(ev) => { self.onChange(ev) }} 
      onKeyDown={(ev)=>{self.onKeydown(ev)}}
    />
  );
}
export default Search;