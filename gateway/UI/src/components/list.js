import { Row,Col,Button } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function List(props) {
  const server=props.server;
  //console.log(server);

  let [svcs,setServers]=useState([
    {name:"vHistory",funs:{
      "view":{
        "intro":"",
        "params":{
            "name":"string"
        }
      },
      "target":{
          "intro":"",
          "params":{
              "name":"string",
              "block":"blocknumber"
          }
      },
      "history":{
          "intro":"",
          "params":{
              "name":"string",
              "page":"u32",
              "step":"u32"
          }
      },
    },nodes:["http://localhost:5600","http://localhost:5601"]},
    {name:"vSocial",funs:{
      "fav":{
        "intro":"",
        "params":{
            "name":"string"
        }
      },
    },nodes:["http://localhost:8843"]},
  ]);

  const self={
    removeService:(uri)=>{
      console.log(uri);
    },
  }

  useEffect(() => {

  }, []);

  return (
    <Row>
      {svcs.map((item,index) => (
        <Col md={12} lg={12} xl={12} xxl={12} className="pt-2" key={index}>
          <Row>
            <Col md={2} lg={2} xl={2} xxl={2} className="pt-2">{item.name}</Col>
            <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
              {item.nodes.map((node,key) => (
                <p id={key}>
                  <Button size="sm" variant="danger" key={key} onClick={(ev)=>{
                    self.removeService(node)
                  }}>X</Button>
                  {node}
                </p>
              ))}
            </Col>
            <Col md={6} lg={6} xl={6} xxl={6} className="pt-2">
              {
                Object.keys(item.funs).map((key,val) => (
                  <Row>
                    <Col md={3} lg={3} xl={3} xxl={3} className="pt-2">
                      <Button size="sm" variant="info" key={key}>{key}</Button>
                    </Col>
                    <Col md={9} lg={9} xl={9} xxl={9} className="pt-2 text-end">
                    {JSON.stringify(item.funs[key].params)}
                    </Col>
                  </Row>
                ))
              }
            </Col>
            <Col md={12} lg={12} xl={12} xxl={12}><hr /></Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
export default List;