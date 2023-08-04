

import Nav from './layout/nav';
import Crumbs from './layout/crumbs';
import Content from './layout/content';

//import Cherry from 'cherry-markdown';
import Cherry from 'cherry-markdown/dist/cherry-markdown.core';

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

function App() {
  const cherryInstance = new Cherry({
    id: "md_container",
    value: `#hello
    ## good day
    - hahahah
    ## bad day
    - topic 1
    - topic 2
    `,
    forceAppend:true,
  });
  console.log(cherryInstance);

  const htm=cherryInstance.getToc();
  console.log(htm);
  return (
    <div id="container">
      <div id="nav">
        <div id="logo"></div>
        <Nav data={list}/>
      </div>
      <div id="body">
        <Crumbs />
        <Content />
      </div>
    </div>
  );
}

export default App;
