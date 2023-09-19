import { Container,Row, Col } from 'react-bootstrap';
import { useEffect,useState} from 'react';

function Stage(props) {
  const self={
    router:(page)=>{
      //setInfo(page);
    },
  };

  useEffect(() => {
    //self.router(router);
  }, []);

  const cmap={
    //display:"none",
    top:`${props.y}px`,
  }

  return (
    <div id="stage" style={cmap}>
      <Container>
        Stage here.Stage here.Stage here.Stage here.Stage here.Stage here.Stage here.Stage here.Stage here.Stage here.
      </Container>
    </div>
  );
}
export default Stage;