import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function Points() {
  //sample icon url
  //https://www.iconfont.cn/illustrations_3d/detail?spm=a313x.7781069.1998910419.d9df05512&cid=45524
  
  return (
    <Container id="anchor">
      <Row className='pb-4'>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/p_name_service.jpg" />
            <Card.Body>
              <Card.Title>Name Service</Card.Title>
              <Card.Text>
                Unique name as domain on blockchain network, new digital asset.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/p_key_value.jpg" />
            <Card.Body>
              <Card.Title>Key-value Storage</Card.Title>
              <Card.Text>
                Easy way to use blockchain. Then blockchain network become a DB.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/p_linked_list.jpg" />
            <Card.Body>
              <Card.Title>On-Chain Linked List</Card.Title>
              <Card.Text>
                New way to use the historical data on-chain, not just droppable data.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/p_anchor_link.jpg" />
            <Card.Body>
              <Card.Title>Anchor Link</Card.Title>
              <Card.Text>
                Similar as HTTP link, make the data on-chain to be a complex net.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/p_easy_protocol.jpg" />
            <Card.Body>
              <Card.Title>Easy Protocol</Card.Title>
              <Card.Text>
                Solving the relationship between data on chain.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={4} xl={4} xxl={4} className='pt-4'>
          <Card>
            <Card.Img variant="top" src="imgs/p_full_chain.jpg" />
            <Card.Body>
              <Card.Title>Full Blockchain</Card.Title>
              <Card.Text>
                All data on-chain even the dApp UI and SDK.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Points;