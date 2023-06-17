import { Row, Col } from 'react-bootstrap';
import { useEffect } from 'react';

//const tools = require('../lib/tools');

const keys={
  active:"Active vService",
  flow:"Flow length",
  last:"Last update",
  manage:"Manage actions",
  req:"Request count",
  service:"Service count",
  spam:"Spam amount",
  start:"Hub start at",
}

const self={
  getName:(name)=>{
    if(keys[name]!==undefined) return keys[name];
    return 'Unkown';
  },
  getArray:(obj)=>{
    const list=[];
    if(!obj) return list;
    for(var k in obj){
      //list.push({title:self.getName(k),value:obj[k],origin:k});
      if(k==="start" || k==="last"){
        //console.log(obj[k]);
        list.push({title:self.getName(k),value:obj[k]});
      }else{
        list.push({title:self.getName(k),value:obj[k]});
      }
    }
    return list;
  },
}

function Status(props) {
  const data=props.data;
  const monitor=self.getArray(data.monitor);
  //console.log(monitor);
  useEffect(() => {

  }, []);

  return (
    <Row>
      {monitor.map((item, key) => (
        <Col md={6} lg={6} xl={6} xxl={6} className="pt-2" key={key}>
          {item.title} : {item.value}</Col>
      ))}
    </Row>
  );
}
export default Status;