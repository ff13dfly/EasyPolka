import { useEffect, useState } from 'react';

import Nav from './layout/nav';
import Crumbs from './layout/crumbs';
import Mark from './layout/mark';

import Content from './layout/content';
import Footer from './layout/footer';
import Decode from './lib/decode';

//import getMKTitles from './lib/tree';

//1.load Anchor then decode them
//2.sent to the components 
const APIs={
  AnchorJS:window.AnchorJS,
  Easy:window.Easy,
  Polkadot:window.Polkadot,
}

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
  start:"anchor_MD_index",
  server:"ws://127.0.0.1:9944",
};

let websocket = null;
function App() {
  let [navs, setNavs] = useState([]);
  let [sub, setSub ]= useState([]);
  let [link, setLink] = useState("");
  let [active, setActive] = useState("");
  let [current,setCurrent]=useState([]);
  //console.log(window.location.hash);

  const Storage={
    getStartIndex:()=>{
      const idata=localStorage.getItem(config.start);
      if(idata===null) return null;
      try {
        const arr=JSON.parse(idata);
        return arr[0];
      } catch (error) {
        localStorage.removeItem(config.start);
        return null;
      }
    },
    getList:()=>{
      const idata=localStorage.getItem(config.start);
      if(idata===null) return [];
      try {
        const arr=JSON.parse(idata);
        return arr;
      } catch (error) {
        localStorage.removeItem(config.start);
        return [];
      }
    },
    setList:(list)=>{
      localStorage.setItem(config.start,JSON.stringify(list));
      return true;
    },
  }

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
    updateTopics:(topics)=>{
      setSub(topics);
    },
    updateNavIndex:(target)=>{
      setActive(target.id);
      setLink(self.getDefaultLink(current,target.id));
      window.location.hash="#"+target.id;
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
      return "";
    },
    fresh:(link)=>{
      const result=Decode(link);
      if(result===false) return false;
      self.auto(() => {
        if(result.block===0){
          APIs.AnchorJS.search(result.name,(res)=>{
            //console.log(res);
            if(res.raw===null) return false;
            try {
              const map=JSON.parse(res.raw);
              if(map && map.data){
                setCurrent(map.data);
                self.render(map.data);
              }
            } catch (error) {
              
            }
          });
        }else{
          APIs.AnchorJS.target(result.name,result.block,(res)=>{
            if(res.raw===null) return false;
            try {
              const map=JSON.parse(res.raw);
              if(map && map.data){
                setCurrent(map.data);
                self.render(map.data);
              }
            } catch (error) {
              
            }
          });
        }
      });
    },
    render:(list)=>{
      const anchor=window.location.hash.substring(1);
      setNavs(list);
      setActive(anchor);
      setLink(self.getDefaultLink(current,anchor));
    }
  }

  useEffect(() => {
    //const index=Storage.getStartIndex();
    self.fresh(Storage.getStartIndex());
  }, []);

  return (
    <div id="container">
      <div id="nav">
        <div id="logo">
          <img src={config.logo} alt="Plinth logo" className='img-fluid' />
          <p><small className='text-secondary'>{config.title}</small></p>
        </div>
        <Nav data={navs} sub={sub} active={active} update={self.updateNavIndex}/>
        <Mark websocket={websocket} storage={Storage} reload={self.fresh}/>
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
