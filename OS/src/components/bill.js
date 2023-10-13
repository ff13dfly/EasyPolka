
import { Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import tools from '../lib/tools';

function Bill(props) {
  const size = {
    row: [12],
    divide: [4, 4, 4],
    bill: [2,10],
  }

  let [hide, setHide] = useState(false);
  let [history, setHistory] = useState([]);

  useEffect(() => {
    const list = [
      {
        to: "5CSTSUDaBdmET2n6ju9mmpEKwFVqaFtmB8YdB23GMYCJSgmw",
        amount: 123456.223435,
        block: 234456,
        hash: "0x809cb2b23924d4428e0c4b42ded08dd4e6bb7504bf7ede317372d98fc941d200",
        stamp: 1696990110577
      }
    ]
    setHistory(list);
  }, [props.list])
  return (
    <Row className='pt-2'>
      <Col hidden={hide} xs={size.divide[0]} sm={size.divide[0]} md={size.divide[0]}
        lg={size.divide[0]} xl={size.divide[0]} xxl={size.divide[0]} className="pt-2"><hr /></Col>
      <Col hidden={hide} xs={size.divide[1]} sm={size.divide[1]} md={size.divide[1]}
        lg={size.divide[1]} xl={size.divide[1]} xxl={size.divide[1]} className="pt-2 text-center">
        <span style={{ color: "#BBBBBB", fontWeight: "500" }}>Bill List</span>
      </Col>
      <Col hidden={hide} xs={size.divide[2]} sm={size.divide[2]} md={size.divide[2]}
        lg={size.divide[2]} xl={size.divide[2]} xxl={size.divide[2]} className="pt-2"><hr /></Col>
      {history.map((row, index) => (
        <Col key={index} className='pb-4' xs={size.row[0]} sm={size.row[0]} md={size.row[0]} lg={size.row[0]} xl={size.row[0]} xxl={size.row[0]}>
          <Row>
            <Col xs={size.bill[0]} sm={size.bill[0]} md={size.bill[0]}
              lg={size.bill[0]} xl={size.bill[0]} xxl={size.bill[0]} onClick={(ev)=>{
                console.log("Ready to chat");
                //funs.dialog.show(<Chat address={row.address} mailer={props.mailer}/>,tools.shorten(address,6));
              }}>
              <img style={{ width: "60px" }} src={`https://robohash.org/${row.to}.png`} alt="user logo" />
            </Col>
            <Col xs={size.bill[1]} sm={size.bill[1]} md={size.bill[1]}
              lg={size.bill[1]} xl={size.bill[1]} xxl={size.bill[1]} onClick={(ev)=>{
                console.log("Ready to show details")
                //funs.dialog.show(<Chat address={row.address} mailer={props.mailer}/>,tools.shorten(address,6));
              }}>
              <table>
                <thead></thead>
                <tbody>
                  <tr>
                    <td>$</td>
                    <td>{row.amount}</td>
                  </tr>
                  <tr>
                    <td>T</td>
                    <td>{row.stamp}</td>
                  </tr>
                  <tr>
                    <td>X</td>
                    <td>{tools.shorten(row.hash)}</td>
                  </tr>
                </tbody>

              </table>
              {/* <p>
                Amount:{row.amount} <br />
                Date:{row.stamp} <br />
                Block:{row.block} <br />
                Hash:{row.hash}
              </p> */}
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  )
}

export default Bill;