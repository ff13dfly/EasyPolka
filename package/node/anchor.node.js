var d=null,m=null,p=null,g={key:40,protocol:256,raw:4*1024*1024,address:48},n={limited:(r,e,t,s)=>r!==void 0?r.length>g.key:t!==void 0?t.length>g.protocol:e!==void 0?e.length>g.raw:s!==void 0?s.length!==g.address:!1,setWebsocket:r=>!r.query.anchor||!r.tx.anchor?!1:(d=r,!0),setKeyring:r=>(m=new r({type:"sr25519"}),!0),ready:()=>d!==null,unlistening:r=>(p!==null&&p(),r&&r()),clean:()=>(p!=null&&(p(),p=null),!0),block:r=>{if(!n.ready())return r&&r(!1);let e=null;d.rpc.chain.subscribeFinalizedHeads(t=>{let s=t.hash.toHex(),o=t.number.toJSON();e!==null&&e(),r&&r(o,s)}).then(t=>{e=t})},listening:r=>n.ready()?(n.clean(),d.rpc.chain.subscribeFinalizedHeads(e=>{let t=e.hash.toHex(),s=e.number.toJSON(),o=[],l=n.format;n.specific(t,i=>{for(let a=0;a<i.length;a++){let f=i[a],u=f.args;u.key.substr(0,2).toLowerCase()==="0x"&&(u.key=n.decodeUTF8(u.key)),u.signer=f.owner,u.block=s;let y=l(u.key,n.decor(u));y.empty=!1,o.push(y)}return r&&r(o,s)})}).then(e=>{p=e}),n.unlistening):r&&r(!1),balance:(r,e)=>{if(!n.ready())return e&&e({error:"No websocke link."});if(n.limited(void 0,void 0,void 0,r))return e&&e(!1);let t=null;d.query.system.account(r,s=>{t?.();let o=s.toJSON().data;return e&&e(o)}).then(s=>{t=s})},load:(r,e,t)=>{if(!e)return t&&t({error:"Invalid password."});if(!r.address||!r.encoded)return t&&t({error:"Invalid encry data."});if(r.address.length!==48)return t&&t({error:"Invalid address."});if(r.encoded.length!==268)return t&&t({error:"Invalid encoded data."});let s=m.createFromJson(r);try{return s.decodePkcs8(e),t&&t(s)}catch{return t&&t({error:"Wrong password."})}},owner:(r,e)=>{let t=null;d.query.anchor.anchorOwner(r,s=>{if(t(),s.isEmpty)return e&&e(!1);let o=s.value[0].toHuman(),l=s.value[1].words[0];return e&&e(o,l)}).then(s=>{t=s})},latest:(r,e)=>{if(!n.ready())return e&&e({error:"No websocke link."});if(r=r.toLocaleLowerCase(),r.substr(0,2)==="0x"&&(r=n.decodeUTF8(r)),n.limited(r))return e&&e(!1);n.owner(r,(t,s)=>{if(t===!1)return e&&e(!1);n.target(r,s,e)})},target:(r,e,t)=>{if(!n.ready())return t&&t({error:"No websocke link."});if(r=r.toLocaleLowerCase(),r.substr(0,2)==="0x"&&(r=n.decodeUTF8(r)),n.limited(r))return t&&t(!1);n.owner(r,s=>{let o={block:e};if(s===!1)return t&&t(n.format(r,o));d.rpc.chain.getBlockHash(e,l=>{let i=l.toHex();if(!i)return t&&t(n.format(r,o));n.specific(i,a=>{if(a===!1)return t&&t(n.format(r,o));o.empty=!1;for(let u in a)o[u]=a[u];o.owner=s;let f=null;d.query.anchor.sellList(r,u=>(f(),u.value.isEmpty||(o.sell=!0,o.cost=u.value[1].words[0],o.target=u.value[2].toHuman()),t&&t(n.format(r,o)))).then(u=>{f=u})},{anchor:r})})})},history:(r,e,t)=>{if(!n.ready())return e&&e({error:"No websocke link."});if(r=r.toLocaleLowerCase(),n.limited(r))return e&&e(!1);n.owner(r,(s,o)=>{if(s===!1)return e&&e(!1);n.loop(r,o,t,l=>{if(l.length===0)return e&&e(l);let i=[],a=n.format;for(let f=0;f<l.length;f++){let u=l[f];i.push(a(u.key,u))}return e&&e(i)})})},loop:(r,e,t,s,o)=>{t=t||0,o||(o=[]),d.rpc.chain.getBlockHash(e,l=>{let i=l.toHex();n.owner(r,a=>{n.specific(i,f=>(f.block=e,f.owner=a,o.push(f),f.pre===t||parseInt(f.pre)===0?s&&s(o):n.loop(r,f.pre,t,s,o)),{anchor:r})})})},footprint:(r,e)=>{},multi:(r,e,t,s)=>{if(!n.ready())return e&&e({error:"No websocke link."});if(r.length===0)return[];t||(t=[]),s||(s={});let o=r.shift();t.push(o),typeof o=="string"?n.latest(o,l=>(s[o]=l,r.length===0?e&&e(n.groupMulti(t,s)):n.multi(r,e,t,s))):n.target(o[0],o[1],l=>(s[o[0]+"_"+o[1]]=l,r.length===0?e&&e(n.groupMulti(t,s)):n.multi(r,e,t,s)))},groupMulti:(r,e)=>{let t=[],s=n.format;for(let o=0;o<r.length;o++){let l=r[o],i=e[typeof l=="string"?l:l[0]+"_"+l[1]];t.push(i||s(r[o]))}return t},specific:(r,e,t)=>{if(t!==void 0&&t.anchor!==void 0&&n.limited(t.anchor))return e&&e(!1);d.rpc.chain.getBlock(r).then(s=>{if(s.block.extrinsics.length===1)return e&&e(!1);d.query.system.events.at(r,o=>{let l=n.filter(s,"setAnchor",n.status(o));if(l.length===0)return e&&e(!1);if(t===void 0||t.anchor===void 0)return e&&e(l);let i=null;for(let a=0;a<l.length;a++){let f=l[a],u=f.args;u.key.substr(0,2).toLowerCase()==="0x"&&(u.key=n.decodeUTF8(u.key)),u.key.toLowerCase()===t.anchor.toLowerCase()&&(i=u,i.signer=f.owner,i.stamp=parseInt(f.stamp))}return i===null?e&&e(!1):e&&e(n.decor(i))})})},write:(r,e,t,s,o)=>{if(!n.ready())return o&&o({error:"No websocke link."});if(typeof s!="string"&&(s=JSON.stringify(s)),typeof t!="string"&&(t=JSON.stringify(t)),n.limited(e,t,s))return o&&o({error:"Params error"});n.owner(e,(l,i)=>{if(l!==!1&&l!==r.address)return o&&o({error:`Not the owner of ${e}`});n.balance(r.address,a=>{if(a.free<100*1e12)return o&&o({error:"Low balance"});let f=l===!1?0:i;try{d.tx.anchor.setAnchor(e,t,s,f).signAndSend(r,u=>o&&o(n.process(u)))}catch(u){return o&&o({error:u})}})})},market:r=>{if(!n.ready())return r&&r({error:"No websocke link."});d.query.anchor.sellList.entries().then(e=>{let t=[];if(!e)return r&&r(t);for(let s=0;s<e.length;s++){let o=e[s],l=o[0].toHuman(),i=o[1].toHuman();t.push({name:l[0],owner:i[0],price:i[1],target:i[2],free:i[0]===i[2]})}return r&&r(t)})},sell:(r,e,t,s,o)=>{if(!n.ready())return s&&s({error:"No websocke link."});if(e=e.toLocaleLowerCase(),n.limited(e))return s&&s(!1);n.owner(e,(l,i)=>{if(l===!1)return s&&s({error:"No target anchor."});if(l!==r.address)return s&&s({error:`Not the owner of ${e}`});try{d.tx.anchor.sellAnchor(e,t,o||l).signAndSend(r,a=>s&&s(n.process(a)))}catch(a){return s&&s({error:a})}})},unsell:(r,e,t)=>{if(!n.ready())return t&&t({error:"No websocke link."});if(e=e.toLocaleLowerCase(),n.limited(e))return t&&t({error:"Name error"});n.owner(e,s=>{if(!s)return t&&t({error:"No such anchor."});if(s!==r.address)return t&&t({error:`Not the owner of ${e}`});try{d.tx.anchor.unsellAnchor(e).signAndSend(r,o=>t&&t(n.process(o)))}catch(o){return t&&t({error:o})}})},buy:(r,e,t)=>{if(!n.ready())return t&&t({error:"No websocke link."});if(e=e.toLocaleLowerCase(),n.limited(e))return t&&t({error:"Name error"});n.owner(e,s=>{if(s===r.address)return t&&t({error:"Your own anchor"});let o=null;d.query.anchor.sellList(e,l=>{if(o(),l.value.isEmpty)return t&&t({error:`'${e}' is not on sell`});let i=l.toJSON(),a=i[1]*1e12;if(i[0]!==i[2]&&i[2]!==r.address)return t&&t({error:"Not target account"});n.balance(r.address,f=>{if(f.free<a)return t&&t({error:"Low balance"});try{d.tx.anchor.buyAnchor(e).signAndSend(r,u=>t&&t(n.process(u)))}catch(u){return t&&t({error:u})}})}).then(l=>{o=l})})},process:r=>{let e={step:"",message:""},t=r.status.toHuman();return typeof t=="string"?(e.step=t,e.message="Ready to interact with node.",e):t.InBlock?(e.step="InBlock",e.message="Packaged to block, nearly done. Waiting for finalizing.",e):(t.Finalized&&(e.step="Finalized",e.message="Finalized, done."),e)},decor:r=>{if(r.key.substr(0,2).toLowerCase()==="0x"&&(r.key=n.decodeUTF8(r.key)),r.raw.substr(0,2).toLowerCase()==="0x"&&(r.raw=n.decodeUTF8(r.raw)),r.protocol)try{let e=JSON.parse(r.protocol);r.protocol=e,e.type==="data"&&e.format==="JSON"&&(r.raw=JSON.parse(r.raw))}catch{console.log("Failed to parse JSON.")}return r.pre=parseInt(r.pre.replace(/,/gi,"")),r.block&&typeof r.block=="string"&&(r.block=parseInt(r.block.replace(/,/gi,""))),r},filter:(r,e,t)=>{let s=[],o=0;return r.block.extrinsics.forEach((l,i)=>{if(i===0&&(o=l.toHuman().method.args.now.replace(/,/gi,"")),i===0||t[i]!=="ExtrinsicSuccess")return!1;let a=l.toHuman();if(a.method.method===e){let f=a.method;f.owner=a.signer.Id,f.stamp=o,s.push(f)}}),s},status:r=>{let e=r.toHuman(),t={};for(let s=0;s<e.length;s++){let o=e[s],l=o.phase.ApplyExtrinsic;o.event.section==="system"&&(t[l]=o.event.method)}return t},decodeUTF8:r=>decodeURIComponent(r.slice(2).replace(/\s+/g,"").replace(/[0-9a-f]{2}/g,"%$&")),format:(r,e)=>({name:r||"",protocol:e&&e.protocol?e.protocol:null,raw:e&&e.raw?e.raw:null,block:e&&e.block?e.block:0,stamp:e&&e.stamp?e.stamp:0,pre:e&&e.pre?e.pre:0,signer:e&&e.signer?e.signer:"",empty:e&&e.empty===!1?e.empty:!0,owner:e&&e.owner?e.owner:"",sell:e&&e.sell?e.sell:!1,cost:e&&e.cost?e.cost:0,target:e&&e.target?e.target:""})};module.exports={set:n.setWebsocket,setKeyring:n.setKeyring,ready:n.ready,subcribe:n.listening,block:n.block,load:n.load,balance:n.balance,search:n.latest,latest:n.latest,target:n.target,history:n.history,multi:n.multi,owner:n.owner,write:n.write,market:n.market,sell:n.sell,unsell:n.unsell,buy:n.buy};
//!important, The minify lib file can be used in html file by script tag
//!important, when using esbuild to minify this as lib for avoiding the anchorJS=anchorJS.anchorJS，
//!important, need to exports like this. Esbuild command like this
//!important, yarn add esbuild
//!important, ../playground/node_modules/.bin/esbuild anchor.js --bundle --minify --outfile=anchor.min.js --global-name=anchorJS
