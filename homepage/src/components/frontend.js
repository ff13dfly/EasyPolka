import { Container, Row, Col, Card } from 'react-bootstrap';

function Frontend() {
  return (
    <Container>
      <Row className='pb-4'>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
          <ul>
            <li>
              One single html file.
            </li>
            <li>
              Easy deploy, only http server needed.
            </li>
            <li>
              Meanful hash.
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}
export default Frontend;