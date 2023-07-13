import { Container, Row, Col, Card,Button } from 'react-bootstrap';

function Points() {
  return (
    <Container id="anchor">
      <Row className='pb-4'>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
              <Card.Title>Name Service</Card.Title>
              <Card.Text>
                Unique name as domain on blockchain network, new digital asset.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
              <Card.Title>Key-value Storage</Card.Title>
              <Card.Text>
                Easy way to use blockchain. Then blockchain network become a DB.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
              <Card.Title>On-Chain Linked List</Card.Title>
              <Card.Text>
                New way to use the historical data on-chain, not just droppable data.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
              <Card.Title>Anchor Link</Card.Title>
              <Card.Text>
                Similar as HTTP link, make the data on-chain to be a complex net.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
              <Card.Title>Easy Protocol</Card.Title>
              <Card.Text>
                Solving the relationship between data on chain. 
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
              <Card.Title>Totally Blockchain</Card.Title>
              <Card.Text>
                All data on-chain even the dApp UI and SDK.
              </Card.Text>
              <Button variant="primary">Go somewhere</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Points;