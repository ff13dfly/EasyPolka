import { useEffect, useState } from 'react';

import Nav from './layout/nav';
import Crumbs from './layout/crumbs';
import Content from './layout/content';
import Footer from './layout/footer';


//1.load Anchor then decode them
//2.sent to the components 

const APIs={
  AnchorJS:"",
  Easy:"",
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
};

const list=[
  {title:"AnchorJS SDK",link:"anchor://anchorjs",children:[]},
  {title:"Loader",link:"anchor://loader",children:[
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
const md=`#hello
## good day
- hahahah
### what to do
### how to do
**today** is a good day
## bad day
- topic 1
- topic 2
`+'```hello world```'
let more=[];



function App() {
  let [navs, setNavs] = useState([]);
  let [content, setContent] = useState("Loading...");
  let [link, setLink] = useState("");

  const self={
    getAnchorData:(link)=>{
  
    },
    updateTopics:(topics)=>{
      console.log(topics);
      more=topics;
    },
    updateNavIndex:(link)=>{
      setLink(link);
    },
  }

  useEffect(() => {
    setNavs(list);
    setLink(list[0].link);
    // setContent(`#hello
    // ## good day
    // - hahahah
    // ### what to do
    // ### how to do
    // **today** is a good day
    // ## bad day
    // - topic 1
    // - topic 2
    // `+'```hello world```');
  }, []);

  return (
    <div id="container">
      <div id="nav">
        <div id="logo">
          <img src="logo.png" alt="Plinth logo" className='img-fluid' />
          <p><small className='text-secondary'>Your Slogon here</small></p>
        </div>
        <Nav data={navs} update={self.updateNavIndex} />
      </div>
      <div id="body">
        <Crumbs />
        <Content link={link}/>
        <Footer pre={0} next={0}/>
      </div>
    </div>
  );
}

export default App;
