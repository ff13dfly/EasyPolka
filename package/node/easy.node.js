"use strict";var H=Object.defineProperty;var yr=Object.getOwnPropertyDescriptor;var xr=Object.getOwnPropertyNames;var br=Object.prototype.hasOwnProperty;var P=(e,n)=>()=>(e&&(n=e(e=0)),n);var _=(e,n)=>()=>(n||e((n={exports:{}}).exports,n),n.exports),S=(e,n)=>{for(var r in n)H(e,r,{get:n[r],enumerable:!0})},mr=(e,n,r,t)=>{if(n&&typeof n=="object"||typeof n=="function")for(let i of xr(n))!br.call(e,i)&&i!==r&&H(e,i,{get:()=>n[i],enumerable:!(t=yr(n,i))||t.enumerable});return e};var I=e=>mr(H({},"__esModule",{value:!0}),e);var M={};S(M,{codeType:()=>Z,errorLevel:()=>X,formatType:()=>K,keysApp:()=>Q,rawType:()=>z,relatedIndex:()=>Y});var X,z,K,Z,Q,Y,$=P(()=>{"use strict";X=(t=>(t.ERROR="error",t.WARN="warning",t.UNEXCEPT="unexcept",t))(X||{}),z=(i=>(i.DATA="data",i.APP="app",i.LIB="lib",i.NONE="unknow",i))(z||{}),K=(l=>(l.JAVASCRIPT="js",l.CSS="css",l.MARKDOWN="md",l.JSON="json",l.MIX="mix",l.NONE="",l))(K||{}),Z=(i=>(i.ASCII="ascii",i.UTF8="utf8",i.HEX="hex",i.NONE="",i))(Z||{}),Q=(e=>{})(Q||{}),Y=(u=>(u[u.AUTH=0]="AUTH",u[u.HIDE=1]="HIDE",u[u.TRUST=2]="TRUST",u[u.NAME=0]="NAME",u[u.BLOCK=1]="BLOCK",u))(Y||{});});var k={};S(k,{linkCreator:()=>Ar,linkDecoder:()=>Lr});var B,J,Ar,Lr,rr=P(()=>{"use strict";B={check:!1,utf8:!0,pre:"anchor://"},J={getParams:e=>{let n={},r=e.split("&");for(let t=0;t<r.length;t++){let u=r[t].split("=");if(u.length!==2)return{error:"error parameter"};n[u[0]]=u[1]}return n},combineParams:e=>{if(!e)return"";let n=[];for(var r in e)n.push(`${r}=${e[r]}`);return n.length===0?"":n.join("&")}},Ar=(e,n)=>{let r=J.combineParams(n);return Array.isArray(e)?e[1]!==0?`${B.pre}${e[0]}/${e[1]}${r&&"?"+r}`:`${B.pre}${e[0]}${r&&"?"+r}`:`${B.pre}${e}${r&&"?"+r}`},Lr=e=>{let n={location:["",0]},r=e.toLocaleLowerCase(),t=B.pre;if(r.length<=t.length+1)return{error:"invalid string"};if(r.substring(0,t.length)!==t)return{error:"invalid protocol"};let u=r.substring(t.length,r.length),l=u.split("?");if(l.length>2)return{error:"error request, please check anchor name"};if(l.length!==1){let c=J.getParams(l[1]);if(c.error)return c;n.param=J.getParams(l[1])}u=l[0];let h=u.split("/"),a=[];for(let c=0;c<h.length;c++)h[c]!==""&&a.push(h[c]);if(a.length===1)n.location[0]=a[0],n.location[1]=0;else{let c=a.pop(),f=parseInt(c);if(isNaN(f))return{error:"block number error"};n.location[1]=f,n.location[0]=a.join("/")}return n}});var nr=_((Br,tr)=>{(function(){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n={rotl:function(r,t){return r<<t|r>>>32-t},rotr:function(r,t){return r<<32-t|r>>>t},endian:function(r){if(r.constructor==Number)return n.rotl(r,8)&16711935|n.rotl(r,24)&4278255360;for(var t=0;t<r.length;t++)r[t]=n.endian(r[t]);return r},randomBytes:function(r){for(var t=[];r>0;r--)t.push(Math.floor(Math.random()*256));return t},bytesToWords:function(r){for(var t=[],i=0,u=0;i<r.length;i++,u+=8)t[u>>>5]|=r[i]<<24-u%32;return t},wordsToBytes:function(r){for(var t=[],i=0;i<r.length*32;i+=8)t.push(r[i>>>5]>>>24-i%32&255);return t},bytesToHex:function(r){for(var t=[],i=0;i<r.length;i++)t.push((r[i]>>>4).toString(16)),t.push((r[i]&15).toString(16));return t.join("")},hexToBytes:function(r){for(var t=[],i=0;i<r.length;i+=2)t.push(parseInt(r.substr(i,2),16));return t},bytesToBase64:function(r){for(var t=[],i=0;i<r.length;i+=3)for(var u=r[i]<<16|r[i+1]<<8|r[i+2],l=0;l<4;l++)i*8+l*6<=r.length*8?t.push(e.charAt(u>>>6*(3-l)&63)):t.push("=");return t.join("")},base64ToBytes:function(r){r=r.replace(/[^A-Z0-9+\/]/ig,"");for(var t=[],i=0,u=0;i<r.length;u=++i%4)u!=0&&t.push((e.indexOf(r.charAt(i-1))&Math.pow(2,-2*u+8)-1)<<u*2|e.indexOf(r.charAt(i))>>>6-u*2);return t}};tr.exports=n})()});var G=_((Dr,er)=>{var j={utf8:{stringToBytes:function(e){return j.bin.stringToBytes(unescape(encodeURIComponent(e)))},bytesToString:function(e){return decodeURIComponent(escape(j.bin.bytesToString(e)))}},bin:{stringToBytes:function(e){for(var n=[],r=0;r<e.length;r++)n.push(e.charCodeAt(r)&255);return n},bytesToString:function(e){for(var n=[],r=0;r<e.length;r++)n.push(String.fromCharCode(e[r]));return n.join("")}}};er.exports=j});var ir=_((Ur,ar)=>{ar.exports=function(e){return e!=null&&(or(e)||Tr(e)||!!e._isBuffer)};function or(e){return!!e.constructor&&typeof e.constructor.isBuffer=="function"&&e.constructor.isBuffer(e)}function Tr(e){return typeof e.readFloatLE=="function"&&typeof e.slice=="function"&&or(e.slice(0,0))}});var q=_((Hr,ur)=>{(function(){var e=nr(),n=G().utf8,r=ir(),t=G().bin,i=function(u,l){u.constructor==String?l&&l.encoding==="binary"?u=t.stringToBytes(u):u=n.stringToBytes(u):r(u)?u=Array.prototype.slice.call(u,0):!Array.isArray(u)&&u.constructor!==Uint8Array&&(u=u.toString());for(var o=e.bytesToWords(u),h=u.length*8,a=1732584193,c=-271733879,f=-1732584194,s=271733878,p=0;p<o.length;p++)o[p]=(o[p]<<8|o[p]>>>24)&16711935|(o[p]<<24|o[p]>>>8)&4278255360;o[h>>>5]|=128<<h%32,o[(h+64>>>9<<4)+14]=h;for(var v=i._ff,g=i._gg,d=i._hh,x=i._ii,p=0;p<o.length;p+=16){var w=a,F=c,E=f,C=s;a=v(a,c,f,s,o[p+0],7,-680876936),s=v(s,a,c,f,o[p+1],12,-389564586),f=v(f,s,a,c,o[p+2],17,606105819),c=v(c,f,s,a,o[p+3],22,-1044525330),a=v(a,c,f,s,o[p+4],7,-176418897),s=v(s,a,c,f,o[p+5],12,1200080426),f=v(f,s,a,c,o[p+6],17,-1473231341),c=v(c,f,s,a,o[p+7],22,-45705983),a=v(a,c,f,s,o[p+8],7,1770035416),s=v(s,a,c,f,o[p+9],12,-1958414417),f=v(f,s,a,c,o[p+10],17,-42063),c=v(c,f,s,a,o[p+11],22,-1990404162),a=v(a,c,f,s,o[p+12],7,1804603682),s=v(s,a,c,f,o[p+13],12,-40341101),f=v(f,s,a,c,o[p+14],17,-1502002290),c=v(c,f,s,a,o[p+15],22,1236535329),a=g(a,c,f,s,o[p+1],5,-165796510),s=g(s,a,c,f,o[p+6],9,-1069501632),f=g(f,s,a,c,o[p+11],14,643717713),c=g(c,f,s,a,o[p+0],20,-373897302),a=g(a,c,f,s,o[p+5],5,-701558691),s=g(s,a,c,f,o[p+10],9,38016083),f=g(f,s,a,c,o[p+15],14,-660478335),c=g(c,f,s,a,o[p+4],20,-405537848),a=g(a,c,f,s,o[p+9],5,568446438),s=g(s,a,c,f,o[p+14],9,-1019803690),f=g(f,s,a,c,o[p+3],14,-187363961),c=g(c,f,s,a,o[p+8],20,1163531501),a=g(a,c,f,s,o[p+13],5,-1444681467),s=g(s,a,c,f,o[p+2],9,-51403784),f=g(f,s,a,c,o[p+7],14,1735328473),c=g(c,f,s,a,o[p+12],20,-1926607734),a=d(a,c,f,s,o[p+5],4,-378558),s=d(s,a,c,f,o[p+8],11,-2022574463),f=d(f,s,a,c,o[p+11],16,1839030562),c=d(c,f,s,a,o[p+14],23,-35309556),a=d(a,c,f,s,o[p+1],4,-1530992060),s=d(s,a,c,f,o[p+4],11,1272893353),f=d(f,s,a,c,o[p+7],16,-155497632),c=d(c,f,s,a,o[p+10],23,-1094730640),a=d(a,c,f,s,o[p+13],4,681279174),s=d(s,a,c,f,o[p+0],11,-358537222),f=d(f,s,a,c,o[p+3],16,-722521979),c=d(c,f,s,a,o[p+6],23,76029189),a=d(a,c,f,s,o[p+9],4,-640364487),s=d(s,a,c,f,o[p+12],11,-421815835),f=d(f,s,a,c,o[p+15],16,530742520),c=d(c,f,s,a,o[p+2],23,-995338651),a=x(a,c,f,s,o[p+0],6,-198630844),s=x(s,a,c,f,o[p+7],10,1126891415),f=x(f,s,a,c,o[p+14],15,-1416354905),c=x(c,f,s,a,o[p+5],21,-57434055),a=x(a,c,f,s,o[p+12],6,1700485571),s=x(s,a,c,f,o[p+3],10,-1894986606),f=x(f,s,a,c,o[p+10],15,-1051523),c=x(c,f,s,a,o[p+1],21,-2054922799),a=x(a,c,f,s,o[p+8],6,1873313359),s=x(s,a,c,f,o[p+15],10,-30611744),f=x(f,s,a,c,o[p+6],15,-1560198380),c=x(c,f,s,a,o[p+13],21,1309151649),a=x(a,c,f,s,o[p+4],6,-145523070),s=x(s,a,c,f,o[p+11],10,-1120210379),f=x(f,s,a,c,o[p+2],15,718787259),c=x(c,f,s,a,o[p+9],21,-343485551),a=a+w>>>0,c=c+F>>>0,f=f+E>>>0,s=s+C>>>0}return e.endian([a,c,f,s])};i._ff=function(u,l,o,h,a,c,f){var s=u+(l&o|~l&h)+(a>>>0)+f;return(s<<c|s>>>32-c)+l},i._gg=function(u,l,o,h,a,c,f){var s=u+(l&h|o&~h)+(a>>>0)+f;return(s<<c|s>>>32-c)+l},i._hh=function(u,l,o,h,a,c,f){var s=u+(l^o^h)+(a>>>0)+f;return(s<<c|s>>>32-c)+l},i._ii=function(u,l,o,h,a,c,f){var s=u+(o^(l|~h))+(a>>>0)+f;return(s<<c|s>>>32-c)+l},i._blocksize=16,i._digestsize=16,ur.exports=function(u,l){if(u==null)throw new Error("Illegal argument "+u);var o=e.wordsToBytes(i(u,l));return l&&l.asBytes?o:l&&l.asString?t.bytesToString(o):e.bytesToHex(o)}})()});var cr={};S(cr,{checkAuth:()=>Nr,checkTrust:()=>Or,easyAuth:()=>wr});var lr,wr,Nr,Or,sr=P(()=>{"use strict";lr=q(),wr=(e,n,r)=>{},Nr=(e,n,r)=>{let t={list:null,anchor:null};return n.auth?typeof n.auth=="string"||Array.isArray(n.auth)?t.anchor=n.auth:t.list=n.auth:n.salt&&(t.anchor=lr(e+n.salt[0])),r&&r(t)},Or=(e,n,r)=>{let t={list:null,anchor:null};return n.trust?typeof n.trust=="string"||Array.isArray(n.trust)?t.anchor=n.trust:t.list=n.trust:n.salt&&(t.anchor=lr(e+n.salt[0])),r&&r(t)}});var fr={};S(fr,{checkHide:()=>Ir,easyHide:()=>_r});var Fr,_r,Ir,hr=P(()=>{"use strict";Fr=q(),_r=e=>{},Ir=(e,n,r)=>{let t={list:null,anchor:null};return n.hide?typeof n.hide=="string"?t.anchor=n.hide:Array.isArray(n.hide)&&(t.list=n.hide):n.salt&&(t.anchor=Fr(e+n.salt[1])),r&&r(t)}});var pr=_(D=>{var V=null,W=null,L={getLibs:(e,n,r,t)=>{r||(r={}),t||(t=[]);let i=e.shift(),u=(Array.isArray(i)?i[0]:i).toLocaleLowerCase(),l=Array.isArray(i)?i[1]:0;if(r[u])return L.getLibs(e,n,r,t);L.getAnchor(u,l,(o,h)=>{if(r[o]=h||{error:"no such anchor"},!h.protocol||!h.protocol.ext&&!h.protocol.lib)t.push(o);else{let a={entry:o,lib:h.protocol&&h.protocol.lib?h.protocol.lib:[],ext:h.protocol&&h.protocol.ext?h.protocol.ext:[]};t.push(a)}if(h.protocol&&h.protocol.ext)for(let a=h.protocol.ext.length;a>0;a--)e.unshift(h.protocol.ext[a-1]);if(h.protocol&&h.protocol.lib)for(let a=h.protocol.lib.length;a>0;a--)e.unshift(h.protocol.lib[a-1]);if(e.length===0)return n&&n(r,t);L.getLibs(e,n,r,t)})},getAnchor:(e,n,r)=>{if(!e)return r&&r(e,"");(n===0?V:W)(e,i=>{if(!i||!i.owner)return r&&r(e,"");if(!i.empty)return r&&r(e,i)})},decodeLib:e=>{let n={type:"error",data:""};if(e.error)return n.error=e.error,n;if(!e.protocol)return n.error="Unexcept data format",n;let r=e.protocol;return r.fmt?(n.type=r.fmt,e.raw.substr(0,2).toLowerCase()==="0x"?n.data=decodeURIComponent(e.raw.slice(2).replace(/\s+/g,"").replace(/[0-9a-f]{2}/g,"%$&")):n.data=e.raw,n):(n.error="Anchor format lost",n)},getComplexOrder:(e,n,r,t)=>{if(r||(r=[]),t||(t=[]),n[e]===!0&&t.length===0)return r;let i=n[e],u=t.length!==0?t[t.length-1]:null,l=u!==null&&u.name===e?t.pop():null;if(i.lib&&i.lib.length>0){if(l===null)for(let o=0;o<i.lib.length;o++){let h=i.lib[o];if(n[h]===!0)r.push(h);else return t.push({lib:o,name:e}),L.getComplexOrder(h,n,r,t)}else if(l.lib!==void 0&&l.lib!==i.lib.length)for(let o=l.lib+1;o<i.lib.length;o++){let h=i.lib[o];if(n[h]===!0)r.push(h);else return t.push({lib:o,name:e}),L.getComplexOrder(h,n,r,t)}}if(l===null&&r.push(e),i.ext&&i.ext.length>0)if(l!==null){if(l.ext!==void 0&&l.ext!==i.ext.length)for(let o=l.ext+1;o<i.ext.length;o++){let h=i.ext[o];if(n[h]===!0)r.push(h);else return t.push({ext:o,name:e}),L.getComplexOrder(h,n,r,t)}}else for(let o=0;o<i.ext.length;o++){let h=i.ext[o];if(n[h]===!0)r.push(h);else return t.push({ext:o,name:e}),L.getComplexOrder(h,n,r,t)}if(t.length!==0){let o=t[t.length-1];return L.getComplexOrder(o.name,n,r,t)}return r},mergeOrder:e=>{let n={},r={},t={},i=[];for(let u=0;u<e.length;u++){let l=e[u];typeof l!="string"&&l.entry!==void 0?(n[l.entry]=!0,r[l.entry]=l):r[l]=!0}for(let u=0;u<e.length;u++){let l=e[u];if(typeof l=="string"||l instanceof String){if(t[l])continue;i.push(l),t[l]=!0}else{if(l.lib&&l.lib.length>0)for(let o=0;o<l.lib.length;o++){let h=l.lib[o];if(!t[h])if(n[h]){let a=L.getComplexOrder(h,r);for(let c=0;c<a.length;c++){let f=a[c];t[f]||(i.push(f),t[f]=!0)}}else i.push(h),t[h]=!0}if(t[l.entry]||(i.push(l.entry),t[l.entry]=!0),l.ext&&l.ext.length>0)for(let o=0;o<l.ext.length;o++){let h=l.ext[o];if(!t[h])if(n[h]){let a=L.getComplexOrder(h,r);for(let c=0;c<a.length;c++){let f=a[c];t[f]||(i.push(f),t[f]=!0)}}else i.push(h),t[h]=!0}}}return i},regroupCode:(e,n)=>{let r=L.decodeLib,t="",i="",u={},l={},o=!1,h=L.mergeOrder(n);for(let a=0;a<h.length;a++){let c=h[a];if(u[c])continue;let f=e[c],s=r(f);if(u[c]=!0,s.error){l[c]=s.error,o=!0;continue}t+=s.type==="js"?s.data:"",i+=s.type==="css"?s.data:""}return{js:t,css:i,failed:l,order:h,error:o}}};D.Loader=(e,n,r)=>{V=n.search,W=n.target,L.getLibs(e,r)};D.Group=L.regroupCode;D.Libs=(e,n,r)=>{V=n.search,W=n.target,L.getLibs(e,(t,i)=>{console.log(t);let u=L.regroupCode(t,i);return r&&r(u)})}});Object.defineProperty(exports,"__esModule",{value:!0});exports.easyRun=void 0;var b=($(),I(M)),A=($(),I(M)),U=(rr(),I(k)),dr=(sr(),I(cr)),Rr=(hr(),I(fr)),vr=pr(),gr=vr.Group,Er=vr.Loader,m=null,T={disable:!0,cache:!0,search:[],start:0,end:0,stamp:function(){return new Date().getTime()}},O={data:{},set:function(e,n,r){return O.data["".concat(e,"_").concat(n)]=r,!0},get:function(e,n){return O.data["".concat(e,"_").concat(n)]},clear:function(){O.data={}}},y={getAnchor:function(e,n){if(m===null)return n&&n({error:"No API to get data.",level:b.errorLevel.ERROR});var r=e[0],t=e[1];if(!T.cache){var i=O.get(r,t);if(i!==void 0)return n&&n(i)}t!==0?m.common.target(r,t,function(u){y.filterAnchor(u,n)}):m.common.latest(r,function(u){y.filterAnchor(u,n)})},filterAnchor:function(e,n){if(!e)return n&&n({error:"No such anchor.",level:b.errorLevel.ERROR});var r=e;if(r.error)return n&&n({error:r.error,level:b.errorLevel.ERROR});var t=e;if(T.disable||T.search.push([t.name,t.block]),T.cache||O.set(t.name,t.block,t),t.empty)return n&&n({error:"Empty anchor.",level:b.errorLevel.ERROR});if(!t.protocol)return n&&n({error:"No-protocol anchor."});var i=t.protocol;return i.type?n&&n(t):n&&n({error:"Not EasyProtocol anchor."})},decodeData:function(e,n){e.type=b.rawType.DATA;var r=e.data["".concat(e.location[0],"_").concat(e.location[1])],t=r.protocol;return t!==null&&t.call&&(e.call=t.call),n&&n(e)},decodeApp:function(e,n){e.type=b.rawType.APP;var r=e.data["".concat(e.location[0],"_").concat(e.location[1])],t=r.protocol;if(e.code=r.raw,t!==null&&t.lib)y.getLibs(t.lib,function(i,u){var l=gr(i,u),o={};for(var h in i){console.log(h);var a=i[h];a.name!==void 0&&(e.data["".concat(a.name,"_").concat(a.block)]=a,o[a.name]=[a.name,a.block])}if(l.order.length!==0){for(var c=[],f=0;f<l.order.length;f++){var s=l.order[f];o[s]!==void 0&&c.push(o[s])}l.order=c}return e.libs=l,n&&n(e)});else return n&&n(e)},decodeLib:function(e,n){e.type=b.rawType.LIB;var r=e.data["".concat(e.location[0],"_").concat(e.location[1])],t=r.protocol;if(t!==null&&t.lib)y.getLibs(t.lib,function(i,u){var l=gr(i,u),o={};for(var h in i){console.log(h);var a=i[h];a.name!==void 0&&(e.data["".concat(a.name,"_").concat(a.block)]=a,o[a.name]=[a.name,a.block])}if(l.order.length!==0){for(var c=[],f=0;f<l.order.length;f++){var s=l.order[f];o[s]!==void 0&&c.push(o[s])}l.order=c}return e.libs=l,n&&n(e)});else return n&&n(e)},formatLibs:function(){},getLibs:function(e,n){if(m===null)return n&&n({error:"No API to get data.",level:b.errorLevel.ERROR});var r={search:m.common.latest,target:m.common.target};Er(e,r,n)},getHistory:function(e,n){var r=[],t=[];if(m===null)return t.push({error:"No API to get data.",level:b.errorLevel.ERROR}),n&&n(r,t);var i=e[0],u=e[1];m.common.history(i,function(l){var o=l;if(o.error)return t.push(o),n&&n(r,t);var h=l;return h.length===0?(t.push({error:"Empty history"}),n&&n(r,t)):n&&n(h,t)})},merge:function(e,n,r){if(m===null)return r&&r({error:"No API to get data.",level:b.errorLevel.ERROR});var t={hide:[],auth:null,trust:null,error:[],index:[null,null,null],map:{}};y.singleRule(e,n,A.relatedIndex.HIDE,function(i,u,l,o){var h;l!==null&&(t.index[A.relatedIndex.HIDE]=l);for(var a in u)t.map[a]=u[a];o.length!==0&&(h=t.error).push.apply(h,o),t.hide=i,y.singleRule(e,n,A.relatedIndex.AUTH,function(c,f,s,p){var v;s!==null&&(t.index[A.relatedIndex.AUTH]=s);for(var g in f)t.map[g]=f[g];p.length!==0&&(v=t.error).push.apply(v,p),t.auth=c,y.singleRule(e,n,A.relatedIndex.TRUST,function(d,x,w,F){var E;w!==null&&(t.index[A.relatedIndex.TRUST]=w);for(var C in x)t.map[C]=x[C];return F.length!==0&&(E=t.error).push.apply(E,F),t.trust=d,r&&r(t)})})})},singleRule:function(e,n,r,t){var i=null,u={},l=null,o=[];switch(r){case A.relatedIndex.HIDE:(0,Rr.checkHide)(e,n,function(h){if(h.anchor===null&&h.list!==null)return i=h.list,t&&t(i,u,l,o);if(h.anchor!==null&&h.list===null)y.singleExtend(h.anchor,!1,function(a,c,f){i=a;for(var s in c)u[s]=c[s];return o.push.apply(o,f),t&&t(i,u,l,o)});else return h.anchor!==null&&h.list!==null&&o.push({error:"Format error."}),t&&t(i,u,l,o)});break;case A.relatedIndex.AUTH:(0,dr.checkAuth)(e,n,function(h){if(h.anchor===null&&h.list!==null)return i=h.list,t&&t(i,u,l,o);if(h.anchor!==null&&h.list===null)y.singleExtend(h.anchor,!0,function(a,c,f){i=a;for(var s in c)u[s]=c[s];return o.push.apply(o,f),t&&t(i,u,l,o)});else return h.anchor!==null&&h.list!==null&&o.push({error:"Format error."}),t&&t(i,u,l,o)});break;case A.relatedIndex.TRUST:(0,dr.checkTrust)(e,n,function(h){if(h.anchor===null&&h.list!==null)return i=h.list,t&&t(i,u,l,o);if(h.anchor!==null&&h.list===null)y.singleExtend(h.anchor,!0,function(a,c,f){i=a;for(var s in c)u[s]=c[s];return o.push.apply(o,f),t&&t(i,u,l,o)});else return h.anchor!==null&&h.list!==null&&o.push({error:"Format error."}),t&&t(i,u,l,o)});break;default:o.push({error:"unknow related index."}),t&&t(i,u,l,o);break}},singleExtend:function(e,n,r){var t=null,i={},u=[],l=Array.isArray(e)?[e[0],0]:[e,0];n?y.getLatestDeclaredHidden(l,function(o,h){var a=o;a!==void 0&&a.error&&u.push(a),h!==void 0&&(i["".concat(h.name,"_").concat(h.block)]=h);var c=o,f={};if(Array.isArray(c))for(var s=0;s<c.length;s++)f[c[s]]=!0;y.getHistory([Array.isArray(e)?e[0]:e,0],function(p,v){v!==void 0&&u.push.apply(u,v);for(var g=0;g<p.length;g++){var d=p[g];if(i["".concat(d.name,"_").concat(d.block)]=d,!f[d.block]){if(!d.protocol||!d.raw||d.protocol.type!==b.rawType.DATA){u.push({error:"Not valid anchor. ".concat(d.name,":").concat(d.block)});continue}try{var x=JSON.parse(d.raw);t===null&&(t={});for(var w in x)t[w]=x[w]}catch{u.push({error:"JSON format failed. ".concat(d.name,":").concat(d.block)});continue}}}return r&&r(t,i,u)})}):y.getAnchor(Array.isArray(e)?e:[e,0],function(o){var h=o;if(h!==void 0&&h.error)return u.push(h),r&&r(t,i,u);var a=o;if(i["".concat(a.name,"_").concat(a.block)]=a,!a.protocol||!a.raw||a.protocol.type!==b.rawType.DATA)return u.push({error:"Not valid anchor."}),r&&r(t,i,u);try{return t=JSON.parse(a.raw),r&&r(t,i,u)}catch(c){return u.push({error:JSON.stringify(c)}),r&&r(t,i,u)}})},decodeHideAnchor:function(e){var n=[],r=e.protocol;if(r?.fmt==="json")try{var t=JSON.parse(e.raw);if(Array.isArray(t))for(var i=0;i<t.length;i++){var u=parseInt(t[i]);isNaN(u)||n.push(u)}}catch{return{error:"failed to parse JSON"}}return n},checkAuthority:function(e,n,r){if(n.type!==b.rawType.APP)return e.error.push({error:"Answer is not cApp."}),r&&r(e);var t=e.data["".concat(e.location[0],"_").concat(e.location[1])],i=t.signer,u=n.auth;if(u===void 0)return e.app=n,r&&r(e);if(y.empty(u))return e.app=n,r&&r(e);if(u[i]===void 0)return e.error.push({error:"No authority of caller."}),r&&r(e);if(u[i]===0)return e.app=n,r&&r(e);m?.common.block(function(l,o){return l>u[i]?(e.error.push({error:"Authority out of time."}),r&&r(e)):(e.app=n,r&&r(e))})},getLatestDeclaredHidden:function(e,n){y.getAnchor([e[0],0],function(r){var t=r;if(t.error)return n&&n([]);var i=r,u=i.protocol;if(u===null||!u.hide)return n&&n([]);if(Array.isArray(u.hide))return n&&n(u.hide);y.getAnchor([u.hide,0],function(l){var o=r;if(o.error)return n&&n([]);var h=l;if(h===null||!h.raw)return n&&n([],h);try{var a=JSON.parse(h.raw);return n&&n(a,h)}catch(c){return n&&n({error:c})}})})},isValidAnchor:function(e,n,r,t){var i=[],u=n.block,l=!1;if(Array.isArray(e)){for(var o=e,h=0;h<o.length;h++)if(u===o[h]){if(n.pre===0)return i.push({error:"Out of ".concat(n.name," limited")}),l=!0,r&&r(null,i,l);var a=(0,U.linkCreator)([n.name,n.pre],t);return r&&r(a,i,l)}return r&&r(null,i)}else{var c=[e,0];y.getAnchor(c,function(f){var s=y.decodeHideAnchor(f),p=s;p.error&&i.push(p);for(var v=s,g=0;g<v.length;g++)if(u===v[g]){if(n.pre===0)return i.push({error:"Out of ".concat(n.name," limited")}),l=!0,r&&r(null,i,l);var d=(0,U.linkCreator)([n.name,n.pre],t);return r&&r(d,i,l)}return r&&r(null,i,l)})}},getParams:function(e){for(var n={},r=e.split("&"),t=0;t<r.length;t++){var i=r[t],u=i.split("=");if(u.length!==2)return{error:"error parameter"};n[u[0]]=u[1]}return n},empty:function(e){for(var n in e)return!1;return!0}},R={};R[b.rawType.APP]=y.decodeApp;R[b.rawType.DATA]=y.decodeData;R[b.rawType.LIB]=y.decodeLib;var N=function(e,n,r,t,i){m===null&&n!==null&&(m=n);var u=(0,U.linkDecoder)(e);if(u.error)return r&&r(u);if(t===void 0)return y.getLatestDeclaredHidden(u.location,function(o,h){var a={type:b.rawType.NONE,location:[u.location[0],u.location[1]!==0?u.location[1]:0],error:[],data:{},index:[null,null,null]},c=o;if(c!==void 0&&c.error)return a.error.push(c),N(e,m,r,[]);var f=o;return N(e,m,r,f)});var l={type:b.rawType.NONE,location:[u.location[0],u.location[1]!==0?u.location[1]:0],error:[],data:{},index:[null,null,null],hide:t};u.param&&(l.parameter=u.param),y.getAnchor(u.location,function(o){var h=o;if(h.error)return l.error.push(h),r&&r(l);var a=o;if(l.location[1]===0&&(l.location[1]=a.block),l.data["".concat(l.location[0],"_").concat(l.location[1])]=a,a.protocol===null)return l.error.push({error:"No valid protocol"}),r&&r(l);var c=a.protocol.type?a.protocol.type:"";if(!R[c])return l.error.push({error:"Not easy protocol type"}),r&&r(l);if(a.protocol)y.isValidAnchor(t,a,function(s,p,v){var g;return(g=l.error).push.apply(g,p),v?r&&r(l):s!==null?N(s,m,r,t):f(c)},l.parameter===void 0?{}:l.parameter);else return f(c);function f(s){y.merge(a.name,a.protocol,function(p){var v;p.auth!==null&&(l.auth=p.auth),p.trust!==null&&(l.trust=p.trust),p.hide!=null&&p.hide.length!==0&&(l.hide=p.hide),p.error.length!==0&&(v=l.error).push.apply(v,p.error),p.index[A.relatedIndex.AUTH]!==null&&l.index&&(l.index[A.relatedIndex.AUTH]=p.index[A.relatedIndex.AUTH]),p.index[A.relatedIndex.HIDE]!==null&&l.index&&(l.index[A.relatedIndex.HIDE]=p.index[A.relatedIndex.HIDE]),p.index[A.relatedIndex.TRUST]!==null&&l.index&&(l.index[A.relatedIndex.TRUST]=p.index[A.relatedIndex.TRUST]);for(var g in p.map)l.data[g]=p.map[g];return R[s](l,function(d){if(d.call&&!i){var x=(0,U.linkCreator)(d.call,d.parameter===void 0?{}:d.parameter);return N(x,m,function(w){return y.checkAuthority(d,w,r)},t,!0)}else return r&&r(d)})})}})},Cr=function(e,n,r){T.search=[],T.start=T.stamp(),N(e,n,function(t){return T.disable||(t.debug=T),T.end=T.stamp(),O.clear(),r&&r(t)})},Pr=T.disable?N:Cr;exports.easyRun=Pr;
//!important This is the Typescript implement of Esay Protocol version 1.0.
//!important Easy Protocol is a simple protocol to launch cApp via Anchor network.
//!important All functions implement, but this implement only support JS with CSS application 
//!important this is not part of easy protocol, develop can limit the function freely
//!important This is the library for decoding anchor link
//!important 3 format of anchor linker. The "/" is optional.
//!important `anchor://${anchor}/${block}[/]`;
//!important `anchor://${anchor}[/]`;
//!important `anchor://${anchor}/${block}[/]?${key_1}=${value_1}&${key_2}=${value_2}`;
//!important This is the library for creating auth data
//!important This is the library for Esay Protocol v1.0
//!important All data come from `Anchor Link`
//!important This implement extend `auth` and `hide` by salt way to load data
//!important, as support `declared hidden`, this function may redirect many times, be careful.
/*! Bundled license information:

is-buffer/index.js:
  (*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
