"use strict";var LE=(()=>{var M=Object.defineProperty;var xr=Object.getOwnPropertyDescriptor;var br=Object.getOwnPropertyNames;var Ar=Object.prototype.hasOwnProperty;var P=(e,n)=>()=>(e&&(n=e(e=0)),n);var O=(e,n)=>()=>(n||e((n={exports:{}}).exports,n),n.exports),S=(e,n)=>{for(var r in n)M(e,r,{get:n[r],enumerable:!0})},mr=(e,n,r,t)=>{if(n&&typeof n=="object"||typeof n=="function")for(let i of br(n))!Ar.call(e,i)&&i!==r&&M(e,i,{get:()=>n[i],enumerable:!(t=xr(n,i))||t.enumerable});return e};var I=e=>mr(M({},"__esModule",{value:!0}),e);var $={};S($,{codeType:()=>Q,errorLevel:()=>z,formatType:()=>Z,keysApp:()=>Y,rawType:()=>K,relatedIndex:()=>k});var z,K,Z,Q,Y,k,J=P(()=>{"use strict";z=(t=>(t.ERROR="error",t.WARN="warning",t.UNEXCEPT="unexcept",t))(z||{}),K=(i=>(i.DATA="data",i.APP="app",i.LIB="lib",i.NONE="unknow",i))(K||{}),Z=(c=>(c.JAVASCRIPT="js",c.CSS="css",c.MARKDOWN="md",c.JSON="json",c.MIX="mix",c.NONE="",c))(Z||{}),Q=(i=>(i.ASCII="ascii",i.UTF8="utf8",i.HEX="hex",i.NONE="",i))(Q||{}),Y=(e=>{})(Y||{}),k=(u=>(u[u.AUTH=0]="AUTH",u[u.HIDE=1]="HIDE",u[u.TRUST=2]="TRUST",u[u.NAME=0]="NAME",u[u.BLOCK=1]="BLOCK",u))(k||{});});var rr={};S(rr,{linkCreator:()=>Lr,linkDecoder:()=>Tr});var B,j,Lr,Tr,tr=P(()=>{"use strict";B={check:!1,utf8:!0,pre:"anchor://"},j={getParams:e=>{let n={},r=e.split("&");for(let t=0;t<r.length;t++){let u=r[t].split("=");if(u.length!==2)return{error:"error parameter"};n[u[0]]=u[1]}return n},combineParams:e=>{if(!e)return"";let n=[];for(var r in e)n.push(`${r}=${e[r]}`);return n.length===0?"":n.join("&")}},Lr=(e,n)=>{let r=j.combineParams(n);return Array.isArray(e)?e[1]!==0?`${B.pre}${e[0]}/${e[1]}${r&&"?"+r}`:`${B.pre}${e[0]}${r&&"?"+r}`:`${B.pre}${e}${r&&"?"+r}`},Tr=e=>{let n={location:["",0]},r=e.toLocaleLowerCase(),t=B.pre;if(r.length<=t.length+1)return{error:"invalid string"};if(r.substring(0,t.length)!==t)return{error:"invalid protocol"};let u=r.substring(t.length,r.length),c=u.split("?");if(c.length>2)return{error:"error request, please check anchor name"};if(c.length!==1){let l=j.getParams(c[1]);if(l.error)return l;n.param=j.getParams(c[1])}u=c[0];let f=u.split("/"),a=[];for(let l=0;l<f.length;l++)f[l]!==""&&a.push(f[l]);if(a.length===1)n.location[0]=a[0],n.location[1]=0;else{let l=a.pop(),h=parseInt(l);if(isNaN(h))return{error:"block number error"};n.location[1]=h,n.location[0]=a.join("/")}return n}});var er=O((Ur,nr)=>{(function(){var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n={rotl:function(r,t){return r<<t|r>>>32-t},rotr:function(r,t){return r<<32-t|r>>>t},endian:function(r){if(r.constructor==Number)return n.rotl(r,8)&16711935|n.rotl(r,24)&4278255360;for(var t=0;t<r.length;t++)r[t]=n.endian(r[t]);return r},randomBytes:function(r){for(var t=[];r>0;r--)t.push(Math.floor(Math.random()*256));return t},bytesToWords:function(r){for(var t=[],i=0,u=0;i<r.length;i++,u+=8)t[u>>>5]|=r[i]<<24-u%32;return t},wordsToBytes:function(r){for(var t=[],i=0;i<r.length*32;i+=8)t.push(r[i>>>5]>>>24-i%32&255);return t},bytesToHex:function(r){for(var t=[],i=0;i<r.length;i++)t.push((r[i]>>>4).toString(16)),t.push((r[i]&15).toString(16));return t.join("")},hexToBytes:function(r){for(var t=[],i=0;i<r.length;i+=2)t.push(parseInt(r.substr(i,2),16));return t},bytesToBase64:function(r){for(var t=[],i=0;i<r.length;i+=3)for(var u=r[i]<<16|r[i+1]<<8|r[i+2],c=0;c<4;c++)i*8+c*6<=r.length*8?t.push(e.charAt(u>>>6*(3-c)&63)):t.push("=");return t.join("")},base64ToBytes:function(r){r=r.replace(/[^A-Z0-9+\/]/ig,"");for(var t=[],i=0,u=0;i<r.length;u=++i%4)u!=0&&t.push((e.indexOf(r.charAt(i-1))&Math.pow(2,-2*u+8)-1)<<u*2|e.indexOf(r.charAt(i))>>>6-u*2);return t}};nr.exports=n})()});var q=O((Hr,or)=>{var G={utf8:{stringToBytes:function(e){return G.bin.stringToBytes(unescape(encodeURIComponent(e)))},bytesToString:function(e){return decodeURIComponent(escape(G.bin.bytesToString(e)))}},bin:{stringToBytes:function(e){for(var n=[],r=0;r<e.length;r++)n.push(e.charCodeAt(r)&255);return n},bytesToString:function(e){for(var n=[],r=0;r<e.length;r++)n.push(String.fromCharCode(e[r]));return n.join("")}}};or.exports=G});var ur=O((Mr,ar)=>{ar.exports=function(e){return e!=null&&(ir(e)||wr(e)||!!e._isBuffer)};function ir(e){return!!e.constructor&&typeof e.constructor.isBuffer=="function"&&e.constructor.isBuffer(e)}function wr(e){return typeof e.readFloatLE=="function"&&typeof e.slice=="function"&&ir(e.slice(0,0))}});var V=O(($r,lr)=>{(function(){var e=er(),n=q().utf8,r=ur(),t=q().bin,i=function(u,c){u.constructor==String?c&&c.encoding==="binary"?u=t.stringToBytes(u):u=n.stringToBytes(u):r(u)?u=Array.prototype.slice.call(u,0):!Array.isArray(u)&&u.constructor!==Uint8Array&&(u=u.toString());for(var o=e.bytesToWords(u),f=u.length*8,a=1732584193,l=-271733879,h=-1732584194,s=271733878,p=0;p<o.length;p++)o[p]=(o[p]<<8|o[p]>>>24)&16711935|(o[p]<<24|o[p]>>>8)&4278255360;o[f>>>5]|=128<<f%32,o[(f+64>>>9<<4)+14]=f;for(var v=i._ff,g=i._gg,d=i._hh,x=i._ii,p=0;p<o.length;p+=16){var w=a,_=l,E=h,C=s;a=v(a,l,h,s,o[p+0],7,-680876936),s=v(s,a,l,h,o[p+1],12,-389564586),h=v(h,s,a,l,o[p+2],17,606105819),l=v(l,h,s,a,o[p+3],22,-1044525330),a=v(a,l,h,s,o[p+4],7,-176418897),s=v(s,a,l,h,o[p+5],12,1200080426),h=v(h,s,a,l,o[p+6],17,-1473231341),l=v(l,h,s,a,o[p+7],22,-45705983),a=v(a,l,h,s,o[p+8],7,1770035416),s=v(s,a,l,h,o[p+9],12,-1958414417),h=v(h,s,a,l,o[p+10],17,-42063),l=v(l,h,s,a,o[p+11],22,-1990404162),a=v(a,l,h,s,o[p+12],7,1804603682),s=v(s,a,l,h,o[p+13],12,-40341101),h=v(h,s,a,l,o[p+14],17,-1502002290),l=v(l,h,s,a,o[p+15],22,1236535329),a=g(a,l,h,s,o[p+1],5,-165796510),s=g(s,a,l,h,o[p+6],9,-1069501632),h=g(h,s,a,l,o[p+11],14,643717713),l=g(l,h,s,a,o[p+0],20,-373897302),a=g(a,l,h,s,o[p+5],5,-701558691),s=g(s,a,l,h,o[p+10],9,38016083),h=g(h,s,a,l,o[p+15],14,-660478335),l=g(l,h,s,a,o[p+4],20,-405537848),a=g(a,l,h,s,o[p+9],5,568446438),s=g(s,a,l,h,o[p+14],9,-1019803690),h=g(h,s,a,l,o[p+3],14,-187363961),l=g(l,h,s,a,o[p+8],20,1163531501),a=g(a,l,h,s,o[p+13],5,-1444681467),s=g(s,a,l,h,o[p+2],9,-51403784),h=g(h,s,a,l,o[p+7],14,1735328473),l=g(l,h,s,a,o[p+12],20,-1926607734),a=d(a,l,h,s,o[p+5],4,-378558),s=d(s,a,l,h,o[p+8],11,-2022574463),h=d(h,s,a,l,o[p+11],16,1839030562),l=d(l,h,s,a,o[p+14],23,-35309556),a=d(a,l,h,s,o[p+1],4,-1530992060),s=d(s,a,l,h,o[p+4],11,1272893353),h=d(h,s,a,l,o[p+7],16,-155497632),l=d(l,h,s,a,o[p+10],23,-1094730640),a=d(a,l,h,s,o[p+13],4,681279174),s=d(s,a,l,h,o[p+0],11,-358537222),h=d(h,s,a,l,o[p+3],16,-722521979),l=d(l,h,s,a,o[p+6],23,76029189),a=d(a,l,h,s,o[p+9],4,-640364487),s=d(s,a,l,h,o[p+12],11,-421815835),h=d(h,s,a,l,o[p+15],16,530742520),l=d(l,h,s,a,o[p+2],23,-995338651),a=x(a,l,h,s,o[p+0],6,-198630844),s=x(s,a,l,h,o[p+7],10,1126891415),h=x(h,s,a,l,o[p+14],15,-1416354905),l=x(l,h,s,a,o[p+5],21,-57434055),a=x(a,l,h,s,o[p+12],6,1700485571),s=x(s,a,l,h,o[p+3],10,-1894986606),h=x(h,s,a,l,o[p+10],15,-1051523),l=x(l,h,s,a,o[p+1],21,-2054922799),a=x(a,l,h,s,o[p+8],6,1873313359),s=x(s,a,l,h,o[p+15],10,-30611744),h=x(h,s,a,l,o[p+6],15,-1560198380),l=x(l,h,s,a,o[p+13],21,1309151649),a=x(a,l,h,s,o[p+4],6,-145523070),s=x(s,a,l,h,o[p+11],10,-1120210379),h=x(h,s,a,l,o[p+2],15,718787259),l=x(l,h,s,a,o[p+9],21,-343485551),a=a+w>>>0,l=l+_>>>0,h=h+E>>>0,s=s+C>>>0}return e.endian([a,l,h,s])};i._ff=function(u,c,o,f,a,l,h){var s=u+(c&o|~c&f)+(a>>>0)+h;return(s<<l|s>>>32-l)+c},i._gg=function(u,c,o,f,a,l,h){var s=u+(c&f|o&~f)+(a>>>0)+h;return(s<<l|s>>>32-l)+c},i._hh=function(u,c,o,f,a,l,h){var s=u+(c^o^f)+(a>>>0)+h;return(s<<l|s>>>32-l)+c},i._ii=function(u,c,o,f,a,l,h){var s=u+(o^(c|~f))+(a>>>0)+h;return(s<<l|s>>>32-l)+c},i._blocksize=16,i._digestsize=16,lr.exports=function(u,c){if(u==null)throw new Error("Illegal argument "+u);var o=e.wordsToBytes(i(u,c));return c&&c.asBytes?o:c&&c.asString?t.bytesToString(o):e.bytesToHex(o)}})()});var sr={};S(sr,{checkAuth:()=>Nr,checkTrust:()=>Fr,easyAuth:()=>Or});var cr,Or,Nr,Fr,fr=P(()=>{"use strict";cr=V(),Or=(e,n,r)=>{},Nr=(e,n,r)=>{let t={list:null,anchor:null};return n.auth?typeof n.auth=="string"||Array.isArray(n.auth)?t.anchor=n.auth:t.list=n.auth:n.salt&&(t.anchor=cr(e+n.salt[0])),r&&r(t)},Fr=(e,n,r)=>{let t={list:null,anchor:null};return n.trust?typeof n.trust=="string"||Array.isArray(n.trust)?t.anchor=n.trust:t.list=n.trust:n.salt&&(t.anchor=cr(e+n.salt[0])),r&&r(t)}});var hr={};S(hr,{checkHide:()=>Rr,easyHide:()=>Ir});var _r,Ir,Rr,pr=P(()=>{"use strict";_r=V(),Ir=e=>{},Rr=(e,n,r)=>{let t={list:null,anchor:null};return n.hide?typeof n.hide=="string"?t.anchor=n.hide:Array.isArray(n.hide)&&(t.list=n.hide):n.salt&&(t.anchor=_r(e+n.salt[1])),r&&r(t)}});var dr=O(D=>{var W=null,X=null,L={getLibs:(e,n,r,t)=>{r||(r={}),t||(t=[]);let i=e.shift(),u=(Array.isArray(i)?i[0]:i).toLocaleLowerCase(),c=Array.isArray(i)?i[1]:0;if(r[u])return L.getLibs(e,n,r,t);L.getAnchor(u,c,(o,f)=>{if(r[o]=f||{error:"no such anchor"},!f.protocol||!f.protocol.ext&&!f.protocol.lib)t.push(o);else{let a={entry:o,lib:f.protocol&&f.protocol.lib?f.protocol.lib:[],ext:f.protocol&&f.protocol.ext?f.protocol.ext:[]};t.push(a)}if(f.protocol&&f.protocol.ext)for(let a=f.protocol.ext.length;a>0;a--)e.unshift(f.protocol.ext[a-1]);if(f.protocol&&f.protocol.lib)for(let a=f.protocol.lib.length;a>0;a--)e.unshift(f.protocol.lib[a-1]);if(e.length===0)return n&&n(r,t);L.getLibs(e,n,r,t)})},getAnchor:(e,n,r)=>{if(!e)return r&&r(e,"");(n===0?W:X)(e,i=>{if(!i||!i.owner)return r&&r(e,"");if(!i.empty)return r&&r(e,i)})},decodeLib:e=>{let n={type:"error",data:""};if(e.error)return n.error=e.error,n;if(!e.protocol)return n.error="Unexcept data format",n;let r=e.protocol;return r.fmt?(n.type=r.fmt,e.raw.substr(0,2).toLowerCase()==="0x"?n.data=decodeURIComponent(e.raw.slice(2).replace(/\s+/g,"").replace(/[0-9a-f]{2}/g,"%$&")):n.data=e.raw,n):(n.error="Anchor format lost",n)},getComplexOrder:(e,n,r,t)=>{if(r||(r=[]),t||(t=[]),n[e]===!0&&t.length===0)return r;let i=n[e],u=t.length!==0?t[t.length-1]:null,c=u!==null&&u.name===e?t.pop():null;if(i.lib&&i.lib.length>0){if(c===null)for(let o=0;o<i.lib.length;o++){let f=i.lib[o];if(n[f]===!0)r.push(f);else return t.push({lib:o,name:e}),L.getComplexOrder(f,n,r,t)}else if(c.lib!==void 0&&c.lib!==i.lib.length)for(let o=c.lib+1;o<i.lib.length;o++){let f=i.lib[o];if(n[f]===!0)r.push(f);else return t.push({lib:o,name:e}),L.getComplexOrder(f,n,r,t)}}if(c===null&&r.push(e),i.ext&&i.ext.length>0)if(c!==null){if(c.ext!==void 0&&c.ext!==i.ext.length)for(let o=c.ext+1;o<i.ext.length;o++){let f=i.ext[o];if(n[f]===!0)r.push(f);else return t.push({ext:o,name:e}),L.getComplexOrder(f,n,r,t)}}else for(let o=0;o<i.ext.length;o++){let f=i.ext[o];if(n[f]===!0)r.push(f);else return t.push({ext:o,name:e}),L.getComplexOrder(f,n,r,t)}if(t.length!==0){let o=t[t.length-1];return L.getComplexOrder(o.name,n,r,t)}return r},mergeOrder:e=>{let n={},r={},t={},i=[];for(let u=0;u<e.length;u++){let c=e[u];typeof c!="string"&&c.entry!==void 0?(n[c.entry]=!0,r[c.entry]=c):r[c]=!0}for(let u=0;u<e.length;u++){let c=e[u];if(typeof c=="string"||c instanceof String){if(t[c])continue;i.push(c),t[c]=!0}else{if(c.lib&&c.lib.length>0)for(let o=0;o<c.lib.length;o++){let f=c.lib[o];if(!t[f])if(n[f]){let a=L.getComplexOrder(f,r);console.log(`${f}:${JSON.stringify(a)}`);for(let l=0;l<a.length;l++){let h=a[l];t[h]||(i.push(h),t[h]=!0)}}else i.push(f),t[f]=!0}if(t[c.entry]||(i.push(c.entry),t[c.entry]=!0),c.ext&&c.ext.length>0)for(let o=0;o<c.ext.length;o++){let f=c.ext[o];if(!t[f])if(n[f]){let a=L.getComplexOrder(f,r);for(let l=0;l<a.length;l++){let h=a[l];t[h]||(i.push(h),t[h]=!0)}}else i.push(f),t[f]=!0}}}return i},regroupCode:(e,n)=>{let r=L.decodeLib,t="",i="",u={},c={},o=!1,f=L.mergeOrder(n);for(let a=0;a<f.length;a++){let l=f[a];if(u[l])continue;let h=e[l],s=r(h);if(u[l]=!0,s.error){c[l]=s.error,o=!0;continue}t+=s.type==="js"?s.data:"",i+=s.type==="css"?s.data:""}return{js:t,css:i,failed:c,order:f,error:o}}};D.Loader=(e,n,r)=>{W=n.search,X=n.target,L.getLibs(e,r)};D.Group=L.regroupCode;D.Libs=(e,n,r)=>{W=n.search,X=n.target,L.getLibs(e,(t,i)=>{let u=L.regroupCode(t,i);return r&&r(u)})}});var Br=O(H=>{Object.defineProperty(H,"__esModule",{value:!0});H.easyRun=void 0;var b=(J(),I($)),m=(J(),I($)),U=(tr(),I(rr)),gr=(fr(),I(sr)),Er=(pr(),I(hr)),yr=dr(),vr=yr.Group,Cr=yr.Loader,A=null,T={disable:!0,cache:!0,search:[],start:0,end:0,stamp:function(){return new Date().getTime()}},F={data:{},set:function(e,n,r){return F.data["".concat(e,"_").concat(n)]=r,!0},get:function(e,n){return F.data["".concat(e,"_").concat(n)]},clear:function(){F.data={}}},y={getAnchor:function(e,n){if(A===null)return n&&n({error:"No API to get data.",level:b.errorLevel.ERROR});var r=e[0],t=e[1];if(!T.cache){var i=F.get(r,t);if(i!==void 0)return n&&n(i)}t!==0?A.common.target(r,t,function(u){y.filterAnchor(u,n)}):A.common.latest(r,function(u){y.filterAnchor(u,n)})},filterAnchor:function(e,n){if(!e)return n&&n({error:"No such anchor.",level:b.errorLevel.ERROR});var r=e;if(r.error)return n&&n({error:r.error,level:b.errorLevel.ERROR});var t=e;if(T.disable||T.search.push([t.name,t.block]),T.cache||F.set(t.name,t.block,t),t.empty)return n&&n({error:"Empty anchor.",level:b.errorLevel.ERROR});if(!t.protocol)return n&&n({error:"No-protocol anchor."});var i=t.protocol;return i.type?n&&n(t):n&&n({error:"Not EasyProtocol anchor."})},decodeData:function(e,n){e.type=b.rawType.DATA;var r=e.data["".concat(e.location[0],"_").concat(e.location[1])],t=r.protocol;return t!==null&&t.call&&(e.call=t.call),n&&n(e)},decodeApp:function(e,n){e.type=b.rawType.APP;var r=e.data["".concat(e.location[0],"_").concat(e.location[1])],t=r.protocol;if(e.code=r.raw,t!==null&&t.lib)y.getLibs(t.lib,function(i,u){for(var c in i){var o=i[c];e.data["".concat(o.name,"_").concat(o.block)]=o}return e.libs=vr(i,u),n&&n(e)});else return n&&n(e)},decodeLib:function(e,n){e.type=b.rawType.LIB;var r=e.data["".concat(e.location[0],"_").concat(e.location[1])],t=r.protocol;if(t!==null&&t.lib)y.getLibs(t.lib,function(i,u){return e.libs=vr(i,u),n&&n(e)});else return n&&n(e)},getLibs:function(e,n){if(A===null)return n&&n({error:"No API to get data.",level:b.errorLevel.ERROR});var r={search:A.common.latest,target:A.common.target};Cr(e,r,n)},getHistory:function(e,n){var r=[],t=[];if(A===null)return t.push({error:"No API to get data.",level:b.errorLevel.ERROR}),n&&n(r,t);var i=e[0],u=e[1];A.common.history(i,function(c){var o=c;if(o.error)return t.push(o),n&&n(r,t);var f=c;return f.length===0?(t.push({error:"Empty history"}),n&&n(r,t)):n&&n(f,t)})},merge:function(e,n,r){if(A===null)return r&&r({error:"No API to get data.",level:b.errorLevel.ERROR});var t={hide:[],auth:null,trust:null,error:[],index:[null,null,null],map:{}};y.singleRule(e,n,m.relatedIndex.HIDE,function(i,u,c,o){var f;c!==null&&(t.index[m.relatedIndex.HIDE]=c);for(var a in u)t.map[a]=u[a];o.length!==0&&(f=t.error).push.apply(f,o),t.hide=i,y.singleRule(e,n,m.relatedIndex.AUTH,function(l,h,s,p){var v;s!==null&&(t.index[m.relatedIndex.AUTH]=s);for(var g in h)t.map[g]=h[g];p.length!==0&&(v=t.error).push.apply(v,p),t.auth=l,y.singleRule(e,n,m.relatedIndex.TRUST,function(d,x,w,_){var E;w!==null&&(t.index[m.relatedIndex.TRUST]=w);for(var C in x)t.map[C]=x[C];return _.length!==0&&(E=t.error).push.apply(E,_),t.trust=d,r&&r(t)})})})},singleRule:function(e,n,r,t){var i=null,u={},c=null,o=[];switch(r){case m.relatedIndex.HIDE:(0,Er.checkHide)(e,n,function(f){if(f.anchor===null&&f.list!==null)return i=f.list,t&&t(i,u,c,o);if(f.anchor!==null&&f.list===null)y.singleExtend(f.anchor,!1,function(a,l,h){i=a;for(var s in l)u[s]=l[s];return o.push.apply(o,h),t&&t(i,u,c,o)});else return f.anchor!==null&&f.list!==null&&o.push({error:"Format error."}),t&&t(i,u,c,o)});break;case m.relatedIndex.AUTH:(0,gr.checkAuth)(e,n,function(f){if(f.anchor===null&&f.list!==null)return i=f.list,t&&t(i,u,c,o);if(f.anchor!==null&&f.list===null)y.singleExtend(f.anchor,!0,function(a,l,h){i=a;for(var s in l)u[s]=l[s];return o.push.apply(o,h),t&&t(i,u,c,o)});else return f.anchor!==null&&f.list!==null&&o.push({error:"Format error."}),t&&t(i,u,c,o)});break;case m.relatedIndex.TRUST:(0,gr.checkTrust)(e,n,function(f){if(f.anchor===null&&f.list!==null)return i=f.list,t&&t(i,u,c,o);if(f.anchor!==null&&f.list===null)y.singleExtend(f.anchor,!0,function(a,l,h){i=a;for(var s in l)u[s]=l[s];return o.push.apply(o,h),t&&t(i,u,c,o)});else return f.anchor!==null&&f.list!==null&&o.push({error:"Format error."}),t&&t(i,u,c,o)});break;default:o.push({error:"unknow related index."}),t&&t(i,u,c,o);break}},singleExtend:function(e,n,r){var t=null,i={},u=[],c=Array.isArray(e)?[e[0],0]:[e,0];n?y.getLatestDeclaredHidden(c,function(o,f){var a=o;a!==void 0&&a.error&&u.push(a),f!==void 0&&(i["".concat(f.name,"_").concat(f.block)]=f);var l=o,h={};if(Array.isArray(l))for(var s=0;s<l.length;s++)h[l[s]]=!0;y.getHistory([Array.isArray(e)?e[0]:e,0],function(p,v){v!==void 0&&u.push.apply(u,v);for(var g=0;g<p.length;g++){var d=p[g];if(i["".concat(d.name,"_").concat(d.block)]=d,!h[d.block]){if(!d.protocol||!d.raw||d.protocol.type!==b.rawType.DATA){u.push({error:"Not valid anchor. ".concat(d.name,":").concat(d.block)});continue}try{var x=JSON.parse(d.raw);t===null&&(t={});for(var w in x)t[w]=x[w]}catch{u.push({error:"JSON format failed. ".concat(d.name,":").concat(d.block)});continue}}}return r&&r(t,i,u)})}):y.getAnchor(Array.isArray(e)?e:[e,0],function(o){var f=o;if(f!==void 0&&f.error)return u.push(f),r&&r(t,i,u);var a=o;if(i["".concat(a.name,"_").concat(a.block)]=a,!a.protocol||!a.raw||a.protocol.type!==b.rawType.DATA)return u.push({error:"Not valid anchor."}),r&&r(t,i,u);try{return t=JSON.parse(a.raw),r&&r(t,i,u)}catch(l){return u.push({error:JSON.stringify(l)}),r&&r(t,i,u)}})},decodeHideAnchor:function(e){var n=[],r=e.protocol;if(r?.fmt==="json")try{var t=JSON.parse(e.raw);if(Array.isArray(t))for(var i=0;i<t.length;i++){var u=parseInt(t[i]);isNaN(u)||n.push(u)}}catch{return{error:"failed to parse JSON"}}return n},checkAuthority:function(e,n,r){if(n.type!==b.rawType.APP)return e.error.push({error:"Answer is not cApp."}),r&&r(e);var t=e.data["".concat(e.location[0],"_").concat(e.location[1])],i=t.signer,u=n.auth;if(u===void 0)return e.app=n,r&&r(e);if(y.empty(u))return e.app=n,r&&r(e);if(u[i]===void 0)return e.error.push({error:"No authority of caller."}),r&&r(e);if(u[i]===0)return e.app=n,r&&r(e);A?.common.block(function(c,o){return c>u[i]?(e.error.push({error:"Authority out of time."}),r&&r(e)):(e.app=n,r&&r(e))})},getLatestDeclaredHidden:function(e,n){y.getAnchor([e[0],0],function(r){var t=r;if(t.error)return n&&n([]);var i=r,u=i.protocol;if(u===null||!u.hide)return n&&n([]);if(Array.isArray(u.hide))return n&&n(u.hide);y.getAnchor([u.hide,0],function(c){var o=r;if(o.error)return n&&n([]);var f=c;if(f===null||!f.raw)return n&&n([],f);try{var a=JSON.parse(f.raw);return n&&n(a,f)}catch(l){return n&&n({error:l})}})})},isValidAnchor:function(e,n,r,t){var i=[],u=n.block,c=!1;if(Array.isArray(e)){for(var o=e,f=0;f<o.length;f++)if(u===o[f]){if(n.pre===0)return i.push({error:"Out of ".concat(n.name," limited")}),c=!0,r&&r(null,i,c);var a=(0,U.linkCreator)([n.name,n.pre],t);return r&&r(a,i,c)}return r&&r(null,i)}else{var l=[e,0];y.getAnchor(l,function(h){var s=y.decodeHideAnchor(h),p=s;p.error&&i.push(p);for(var v=s,g=0;g<v.length;g++)if(u===v[g]){if(n.pre===0)return i.push({error:"Out of ".concat(n.name," limited")}),c=!0,r&&r(null,i,c);var d=(0,U.linkCreator)([n.name,n.pre],t);return r&&r(d,i,c)}return r&&r(null,i,c)})}},getParams:function(e){for(var n={},r=e.split("&"),t=0;t<r.length;t++){var i=r[t],u=i.split("=");if(u.length!==2)return{error:"error parameter"};n[u[0]]=u[1]}return n},empty:function(e){for(var n in e)return!1;return!0}},R={};R[b.rawType.APP]=y.decodeApp;R[b.rawType.DATA]=y.decodeData;R[b.rawType.LIB]=y.decodeLib;var N=function(e,n,r,t,i){A===null&&n!==null&&(A=n);var u=(0,U.linkDecoder)(e);if(u.error)return r&&r(u);if(t===void 0)return y.getLatestDeclaredHidden(u.location,function(o,f){var a={type:b.rawType.NONE,location:[u.location[0],u.location[1]!==0?u.location[1]:0],error:[],data:{},index:[null,null,null]},l=o;if(l!==void 0&&l.error)return a.error.push(l),N(e,A,r,[]);var h=o;return N(e,A,r,h)});var c={type:b.rawType.NONE,location:[u.location[0],u.location[1]!==0?u.location[1]:0],error:[],data:{},index:[null,null,null],hide:t};u.param&&(c.parameter=u.param),y.getAnchor(u.location,function(o){var f=o;if(f.error)return c.error.push(f),r&&r(c);var a=o;if(c.location[1]===0&&(c.location[1]=a.block),c.data["".concat(c.location[0],"_").concat(c.location[1])]=a,a.protocol===null)return c.error.push({error:"No valid protocol"}),r&&r(c);var l=a.protocol.type?a.protocol.type:"";if(!R[l])return c.error.push({error:"Not easy protocol type"}),r&&r(c);if(a.protocol)y.isValidAnchor(t,a,function(s,p,v){var g;return(g=c.error).push.apply(g,p),v?r&&r(c):s!==null?N(s,A,r,t):h(l)},c.parameter===void 0?{}:c.parameter);else return h(l);function h(s){y.merge(a.name,a.protocol,function(p){var v;p.auth!==null&&(c.auth=p.auth),p.trust!==null&&(c.trust=p.trust),p.hide!=null&&p.hide.length!==0&&(c.hide=p.hide),p.error.length!==0&&(v=c.error).push.apply(v,p.error),p.index[m.relatedIndex.AUTH]!==null&&c.index&&(c.index[m.relatedIndex.AUTH]=p.index[m.relatedIndex.AUTH]),p.index[m.relatedIndex.HIDE]!==null&&c.index&&(c.index[m.relatedIndex.HIDE]=p.index[m.relatedIndex.HIDE]),p.index[m.relatedIndex.TRUST]!==null&&c.index&&(c.index[m.relatedIndex.TRUST]=p.index[m.relatedIndex.TRUST]);for(var g in p.map)c.data[g]=p.map[g];return R[s](c,function(d){if(d.call&&!i){var x=(0,U.linkCreator)(d.call,d.parameter===void 0?{}:d.parameter);return N(x,A,function(w){return y.checkAuthority(d,w,r)},t,!0)}else return r&&r(d)})})}})},Pr=function(e,n,r){T.search=[],T.start=T.stamp(),N(e,n,function(t){return T.disable||(t.debug=T),T.end=T.stamp(),F.clear(),r&&r(t)})},Sr=T.disable?N:Pr;H.easyRun=Sr});return Br();})();
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
