import { useEffect, useState } from 'react';

import Nav from './layout/nav';
import Crumbs from './layout/crumbs';
import Mark from './layout/mark';

import Content from './layout/content';
import Footer from './layout/footer';

//import getMKTitles from './lib/tree';

//1.load Anchor then decode them
//2.sent to the components 
const APIs={
  AnchorJS:window.AnchorJS,
  Easy:window.Easy,
  Polkadot:window.Polkadot,
}

const list=[
  {title:"AnchorJS SDK",link:"anchor://anchorjs_md",children:[]},
  {title:"Loader",link:"anchor://loader_md",children:[
    {title:"Convertor",link:"anchor://convertor_md"},
    {title:"Downloader",link:"anchor://downloader_md"},
  ]},
  {title:"Easy Protocol",link:"anchor://easy_md",children:[]},
  {title:"Gateway",link:"anchor://gateway_md",children:[
    {title:"Hub",link:"anchor://g_hub"},
    {title:"Service",link:"anchor://g_service"},
    {title:"UI",link:"anchor://g_ui"},
  ]},
]

const config={
  logo:"logo.png",
  title:"Easy Blockchain Network",
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
  menu:list,
  start:"anchor_MD_index",
  server:"ws://127.0.0.1:9944",
};

let websocket = null;
function App() {
  let [navs, setNavs] = useState([]);
  let [sub, setSub ]= useState([]);
  let [link, setLink] = useState("");
  let [active, setActive] = useState("");
  console.log(window.location.hash);
  const self={
    auto: (ck) => {
      if (websocket !== null) return ck && ck();
      const server =config.server ? config.server : "wss://dev.metanchor.net";
      APIs.Polkadot.ApiPromise.create({ provider: new APIs.Polkadot.WsProvider(server) }).then((api) => {
        websocket = api;
        APIs.AnchorJS.set(api);
        return ck && ck();
      });
    },
    getAnchorData:(link)=>{
  
    },
    updateTopics:(topics)=>{
      setSub(topics);
    },
    updateNavIndex:(target)=>{
      setActive(target.id);
      setLink(self.getDefaultLink(list,target.id));
      window.location.hash="#"+target.id;
    },

    getStartIndex:()=>{
      const list=localStorage.getItem(config.start);
      if(list===null) return null;
      try {
        const arr=JSON.parse(list);
        return arr[0];
      } catch (error) {
        localStorage.removeItem(config.start);
        return null;
      }
    },

    getDefaultLink:(list,anchor)=>{
      if(list.length===0) return "";
      if(!anchor) return list[0].link;
      
      for(let i=0;i<list.length;i++){
        const row=list[i];
        if(row.link===`anchor://${anchor}`) return row.link
        if(row.children.length!==0){
          for(let j=0;j<row.children.length;j++){
            const sub=row.children[j];
            if(sub.link===`anchor://${anchor}`) return sub.link
          }
        }
      }
      //console.log(anchor);
      return "";
    },
  }

  useEffect(() => {
    const index=self.getStartIndex();
    console.log(index);

    self.auto(() => {
      const anchor=window.location.hash.substring(1);
      setNavs(list);
      setActive(anchor);
      setLink(self.getDefaultLink(list,anchor));
    });
  }, [list]);

  return (
    <div id="container">
      <div id="nav">
        <div id="logo">
          <img src={config.logo} alt="Plinth logo" className='img-fluid' />
          <p><small className='text-secondary'>{config.title}</small></p>
        </div>
        <Nav data={navs} sub={sub} active={active} update={self.updateNavIndex}/>
        <Mark websocket={websocket}/>
      </div>
      <div id="body">
        <Crumbs API={APIs} anchor={active} />
        <Content link={link} API={APIs} config={config} update={self.updateTopics} websocket={websocket} />
        <Footer pre={0} next={0}/>
      </div>
    </div>
  );
}

export default App;
