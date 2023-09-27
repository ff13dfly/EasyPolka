import { Row, Col, Button } from 'react-bootstrap';

import { useEffect } from 'react';

import { mnemonicGenerate } from '@polkadot/util-crypto';

import RUNTIME from '../lib/runtime';
import Password from './password';

function User_Add(props) {
  const funs = props.funs;

  const self = {
    onClick: (ev) => {
      //const mnemonic = mnemonicGenerate(12,undefined,true);
      //const arr=mnemonic.split(' ');

      RUNTIME.getAPIs((API) => {
        //console.log(API);
        const mnemonic = mnemonicGenerate(12, undefined, true);
        const keyring = new API.Polkadot.Keyring({ type: 'sr25519' });
        const pair = keyring.addFromUri(mnemonic);
        funs.dialog.show(
          (<Password callback={(pass) => {
            console.log(pass);
          }} account={pair.address} mnemonic={mnemonic} funs={funs} />)
        );
      });


    },
  }

  useEffect(() => {


  });

  return (
    <Row>
      <Col className='text-center' xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} >
        <Button size="md" variant="primary" onClick={(ev) => {
          self.onClick(ev);
        }}> New Account </Button>
      </Col>
    </Row>
  );
}
export default User_Add;