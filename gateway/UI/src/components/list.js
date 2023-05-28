import { Row,Col,Button } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function List(props) {
  const uri=props.uri;

  let [servers,setServers]=useState([
    {name:"vHistory",funs:{},nodes:["http://localhost:5600","http://localhost:5601"]},
    {name:"vSocial",funs:{},nodes:["http://localhost:8843å"]},
  ]);

  const self={
    jsonp:(server,data,ck)=>{
      var uri=server+'?';
      if(data.id) uri += `id=${data.id}&`;
      if(data.method) uri += `method=${data.method}&`;
      for(var k in data.params) uri += `${k}=${data.params[k]}&`;
      uri+='callback=?';
      console.log(`${uri}`);
      window.$.getJSON({type:'get',url:uri,async:false,success:function(res){
          return ck && ck(res);
      }});
    },
  }

  useEffect(() => {
    const data={id:"abc",method:"spam"}
    const URL="http://127.0.0.1:8001/";
    self.jsonp(URL,data,(res)=>{
      console.log(res);
      const data={id:"address_ss58",method:"list",params:{v:"vhistory",a:"view",spam:res.result.spam}}
      self.jsonp(URL+'manage',data,(res)=>{
        console.log(res);
      });
    });
  }, []);

  return (
    <Row>
      {servers.map((item,index) => (
        <Col md={12} lg={12} xl={12} xxl={12} className="pt-2" key={index}>
          <Row>
            <Col md={2} lg={2} xl={2} xxl={2} className="pt-2">name</Col>
            <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">http://localhost:port</Col>
            <Col md={4} lg={4} xl={4} xxl={4} className="pt-2">
              funs list
            </Col>
            <Col md={2} lg={2} xl={2} xxl={2} className="pt-2 text-end">
              <Button size="sm" variant="danger">X</Button>
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  );
}
export default List;