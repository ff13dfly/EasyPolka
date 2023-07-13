import { Carousel } from 'react-bootstrap';

function Slide() {
  return (
    <Carousel>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="imgs/001.svg"
          alt="First slide"
        />
        <Carousel.Caption>
          <h3>Self Bootstrap Web3.0 Network</h3>
          <p>You can access the whole Web3.0 world by single loader.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="imgs/002.svg"
          alt="Second slide"
        />

        <Carousel.Caption>
          <h3>No-finance Blockchain</h3>
          <p>This is a blockchain network to deploy the dApp UI and SDK, without Smart Contract.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="imgs/003.svg"
          alt="Third slide"
        />

        <Carousel.Caption>
          <h3>Free To Join Web3.0</h3>
          <p>Free to browser the data on chain and easy to join fether.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}
export default Slide;