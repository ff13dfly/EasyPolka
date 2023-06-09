
import { useState,useEffect,useCallback} from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';

import Header from './components/header';
import Search from './components/search';
import Write from './components/write';
import Market from './components/market';
import Setting from './components/setting';
import Summary from './components/summary';
import Loading from './components/loading';

import {anchorJS} from './lib/anchor';
import {Servers} from './config/servers';
import {Accounts} from './config/accounts';

import STORAGE from './lib/storage';
import Keys from './config/keys';

let wsAPI=null;
let linking = false;

function App() {

  let [view,setView]=useState('');

  //persist node storage.
  const map={
    'node_persist':Keys.node_persist,
  };
  STORAGE.setMap(map);

  const handleChangeEvent = useCallback(() => {
    self.router(window.location.hash);
  }, []);

  const self={
    link:(node,ck) => {
      if(linking) return setTimeout(()=>{
        self.link(node,ck);
      },500);
      if(wsAPI!==null) return ck && ck(wsAPI);

      try {
        self.status(`Trying to link node : ${node}`);
        linking=true;
        const provider = new WsProvider(node);
        ApiPromise.create({ provider: provider }).then((api) => {
          if(wsAPI===null) wsAPI=api;
          linking=false;
          return ck && ck(true);
        });
      } catch (error) {
        linking=false;
        return ck && ck(error);
      }
    },
    router:(hash)=>{
      if(hash!=="#home" && !anchorJS.ready()){
        return setTimeout(()=>{
          self.router(hash);
        },200);
      }
      const dom=pages[hash]===undefined?pages['#home']:pages[hash];
      setView(dom);
    },
    status:(info)=>{
      console.log(info);
    },
    fresh:(anchor)=>{
      self.router(window.location.hash);
    },
    
    loadSetting:()=>{
      const ps=STORAGE.getPersist('node_persist');
      let list=[];
      if(ps!==null){
        for(let i=0;i<ps.length;i++){
          list.push(ps[i]);
        }
      }else{
        for(let i=0;i<Servers.nodes.length;i++){
          list.push(Servers.nodes[i]);
        }
        STORAGE.setPersist('node_persist',list);
      }
      STORAGE.setCache(Keys.node,list);
    },
  };

  const pages={
    '#home':(<Search anchorJS={anchorJS} fresh={self.fresh} ></Search>),
    '#write':(<Write  anchorJS={anchorJS} accounts={Accounts}></Write>),
    '#market':(<Market anchorJS={anchorJS} />),
    '#setting':(<Setting anchorJS={anchorJS} list={Accounts}/>),
    '#document':(<Summary anchorJS={anchorJS} />),
  };
  
  useEffect( ()=> {
    //1.Loading page 
    if(window.location.hash!=='' || window.location.hash!=='#home'){
      setView((<Loading page={window.location.hash}></Loading>));
    }

    //2.Router to right page
    window.addEventListener('hashchange', handleChangeEvent);
    self.loadSetting();
    self.router(window.location.hash);

    //3.Link to anchor node
    const list=STORAGE.getCache(Keys.node);
    self.link(list[0],(res)=>{
      if(!res) return self.status(`Failed to link to node ${res}`);
      if(!anchorJS.set(wsAPI)){
        console.log('Error anchor node.');
      }
      anchorJS.setKeyring(Keyring);
    });
  },[]);

  return (<div id="container"><Header />{view}</div>);
}

export default App;
