import { Container, Row, Col, Card } from 'react-bootstrap';

function Backend() {
  return (
    <Container>
      <Row>
        <Col md={6} lg={6} xl={6} xxl={6} className='pt-4'>
        <ul>
            <li>
            Anchor link support.
            </li>
            <li>
            Parameters from command line.
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}
export default Backend;