import { useEffect, useState } from 'react';

import Nav from './layout/nav';
import Crumbs from './layout/crumbs';
import Content from './layout/content';
import Footer from './layout/footer';

import getMKTitles from './lib/tree';

//1.load Anchor then decode them
//2.sent to the components 
const APIs={
  AnchorJS:window.AnchorJS,
  Easy:window.Easy,
  Polkadot:window.Polkadot,
}

const config={
  logo:"",
  title:"",
  theme:{
    nav:{
      h1:"",
      h2:"",
      h3:"",
      background:"",
    },
    body:{
      font:"",
      background:"",
    },
  },
  server:"ws://127.0.0.1:9944",
};

const list=[
  {title:"AnchorJS SDK",link:"anchor://anchorjs_md",children:[]},
  {title:"Loader",link:"anchor://loader_md",children:[
    {title:"Convertor",link:"anchor://convertor",children:[]},
    {title:"Downloader",link:"anchor://downloader",children:[]},
  ]},
  {title:"Easy Protocol",link:"anchor://easy",children:[]},
  {title:"Gateway",link:"anchor://gateway",children:[
    {title:"Hub",link:"anchor://g_hub",children:[]},
    {title:"Service",link:"anchor://g_service",children:[]},
    {title:"UI",link:"anchor://g_ui",children:[]},
  ]},
]

function App() {
  let [navs, setNavs] = useState([]);
  let [sub, setSub ]= useState([]);
  let [link, setLink] = useState("");
  let [active, setActive] = useState("");

  const self={
    getAnchorData:(link)=>{
  
    },
    updateTopics:(topics)=>{
      setSub(topics);
    },
    updateNavIndex:(target,link)=>{
      setActive(target.id);
      setLink(link);
      window.location.hash="#"+target.id;
    },

    getDefaultLink:(list)=>{
      
      return list[0].link;
    },
  }

  useEffect(() => {
    setNavs(list);
    const anchor=window.location.hash.substring(1);
    setActive(anchor);
    setLink(`anchor://${anchor}`);
  }, [list]);

  return (
    <div id="container">
      <div id="nav">
        <div id="logo">
          <img src="logo.png" alt="Plinth logo" className='img-fluid' />
          <p><small className='text-secondary'>Your Slogon here</small></p>
        </div>
        <Nav data={navs} sub={sub} active={active} update={self.updateNavIndex}/>
      </div>
      <div id="body">
        {/* <Crumbs /> */}
        <Content link={link} API={APIs} config={config} update={self.updateTopics} />
        <Footer pre={0} next={0}/>
      </div>
    </div>
  );
}

export default App;
