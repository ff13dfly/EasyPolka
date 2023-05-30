import { Row,Col,Form,Button } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function Link(props) {

  let [hub,setHub]=useState("");
  const storage=props.storage;
  const fresh=props.fresh;

  const self={
    onChange:(ev)=>{
        setHub(ev.target.value);
    },
    onClean:(ev)=>{
      storage.saveNodes([]);
      setHub("");
      fresh();
    },
    onClick:(ev)=>{
      if(!hub) return false;
      const list=storage.loadNodes();
      const nlist=[{URI:hub,name:"new node"}];
      for(let i=0;i<list.length;i++){
        const row=list[i];
        if(row.URI===hub){
          nlist[0].name=row.name
        }else{
          nlist.push(row);
        }
      }
      storage.saveNodes(nlist);
      setHub("");
      fresh();
    },
  };

  useEffect(() => {

  }, []);

  return (
    <Row>
         <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
          <h5 className="pt-2">Gateway UI</h5>
        </Col>
        <Col md={2} lg={2} xl={2} xxl={2} className="pt-2 text-end">
          <Button variant="default" onClick={() => {
              self.onClean()
              }}>Clean</Button>
        </Col>
        <Col md={5} lg={5} xl={5} xxl={5} className="pt-2">
          
          <Form.Control 
            size="md" 
            type="text" 
            placeholder="Gateway Hub URI to add..." 
            onChange={(ev) => {
                self.onChange(ev)
            }} 
            onKeyDown={(ev)=>{}}
          />
        </Col>
        <Col md={1} lg={1} xl={1} xxl={1} className="pt-2 text-end">
          <Button onClick={() => {
            self.onClick()
            }}>Save</Button>
        </Col>
        <Col md={12} lg={12} xl={12} xxl={12}><hr /></Col>
      </Row>
  );
}
export default Link;