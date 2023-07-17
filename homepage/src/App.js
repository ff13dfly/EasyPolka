
//import { useState, useEffect } from 'react';

import Navigator from './components/navigator';
import Slide from './components/slide';
import Points from './components/points';
import Protocol from './components/protocol';
import Demo from './components/demo';
import Plinth from './components/plinth';
import Loader from './components/loader';
import Backend from './components/backend';
import Frontend from './components/frontend';
import Join from './components/join';
import Gateway from './components/gateway';
import Sample from './components/sample';

import Footer from './components/footer';

function App() {

  // useEffect(() => {

  // }, []);

  return (
    <div>
      <Navigator />
      <Slide/>
      <Points />
      <Protocol />
      <Loader />
      {/* <Frontend />
      <Backend /> */}
      <Plinth />
      <Demo />
      <Gateway />
      <Sample />
      <Join />
      <Footer />
    </div>
  );
}

export default App;
