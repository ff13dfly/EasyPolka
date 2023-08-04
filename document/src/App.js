
import Nav from './layout/nav';
import Crumbs from './layout/crumbs';
import Content from './layout/content';

function App() {
  return (
    <div id="container">
      <div id="nav">
        <div id="logo"></div>
        <Nav />
      </div>
      <div id="body">
        <Crumbs />
        <Content />
      </div>
    </div>
  );
}

export default App;
