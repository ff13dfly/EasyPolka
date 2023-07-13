
//import { useState, useEffect } from 'react';

import Navigator from './components/navigator';
import Slide from './components/slide';
import Points from './components/points';
import Protocol from './components/protocol';
import Plinth from './components/plinth';
import Loader from './components/loader';
import Join from './components/join';

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
      <Plinth />
      <Loader />
      <Join />
      <Footer />
    </div>
  );
}

export default App;
