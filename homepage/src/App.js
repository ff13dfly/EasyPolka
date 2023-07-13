
//import { useState, useEffect } from 'react';

import Navigator from './components/navigator';
import Slide from './components/slide';
import Points from './components/points';
import Protocol from './components/protocol';
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
      <Loader />
      <Join />
      <Footer />
    </div>
  );
}

export default App;
