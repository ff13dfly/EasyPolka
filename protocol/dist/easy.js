/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/loader.js":
/*!***********************!*\
  !*** ./lib/loader.js ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {

let search=null;
let target=null;
const self={
    getLibs:(list,ck,cache,order)=>{
        //console.log(`Start:${JSON.stringify(list)}`);
        if(!cache) cache={};
        if(!order) order=[];
        const row=list.shift();
        const anchor=(Array.isArray(row)?row[0]:row).toLocaleLowerCase();
        const block=Array.isArray(row)?row[1]:0;

        //1.check lib loading status
        if(cache[anchor]) return self.getLibs(list,ck,cache,order);

        //2.get target anchor
        self.getAnchor(anchor,block,(an,res)=>{
            cache[an]=!res?{error:'no such anchor'}:res;
            if(!res.protocol || (!res.protocol.ext && !res.protocol.lib)){
                order.push(an);
            }else{
                const qu={
                    entry:an,
                    lib:res.protocol && res.protocol.lib?res.protocol.lib:[],
                    ext:res.protocol && res.protocol.ext?res.protocol.ext:[],
                };
                order.push(qu);
            }

            if(res.protocol && res.protocol.ext){
                for(let i=res.protocol.ext.length;i>0;i--) list.unshift(res.protocol.ext[i-1]);
            }
            if(res.protocol && res.protocol.lib){
                for(let i=res.protocol.lib.length;i>0;i--) list.unshift(res.protocol.lib[i-1]);
            }

            if(list.length===0) return ck && ck(cache,order);
            self.getLibs(list,ck,cache,order);
        });
    },
    getAnchor:(anchor,block,ck)=>{
        if(!anchor) return ck && ck(anchor,'');
        const fun=block===0?search:target;
        fun(anchor, (res)=>{
            if(!res || (!res.owner)) return ck && ck(anchor,'');
            if(!res.empty){
                 const dt={
                    key:res.name,
                    raw:res.raw,
                    protocol:res.protocol,
                };
                return ck && ck(anchor,dt);
            }
        });
    },
    decodeLib:(dt)=>{
        const result={type:'error',data:''};
        if(dt.error){
            result.error=dt.error;
            return result;
        }

        if(!dt.protocol){
            result.error='Unexcept data format';
            return result;
        }

        const proto=dt.protocol;
        if(!proto.fmt){
            result.error='Anchor format lost';
            return result;
        }
        result.type=proto.fmt;

        //solve raw problem; hex to ascii
        if(dt.raw.substr(0, 2).toLowerCase()==='0x'){
            result.data=decodeURIComponent(dt.raw.slice(2).replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'));
        }else{
            result.data=dt.raw;
        }
        return result;
    },
    
    getComplexOrder:(name,map,queue,hold)=>{
        if(!queue) queue=[];        //获取的
        if(!hold) hold=[];          //1.用来表达处理状态

        if(map[name]===true && hold.length===0) return queue;
        const row=map[name];

        const last=hold.length!==0?hold[hold.length-1]:null;
        const recover=(last!==null&&last.name===name)?hold.pop():null;

        //1.check lib complex;
        if(row.lib && row.lib.length>0){
            if(recover===null){
                for(let i=0;i<row.lib.length;i++){
                    const lib=row.lib[i];
                    //console.log('ready to check lib:'+lib);
                    if(map[lib]===true){
                        queue.push(lib);
                    }else{
                        hold.push({lib:i,name:name});
                        return self.getComplexOrder(lib,map,queue,hold);
                    }
                }
            }else{
                if(recover.lib!==undefined && recover.lib!==row.lib.length){
                    for(let i=recover.lib+1;i<row.lib.length;i++){
                        const lib=row.lib[i];
                        //console.log('ready to check lib:'+lib);
                        if(map[lib]===true){
                            queue.push(lib);
                        }else{
                            hold.push({lib:i,name:name});
                            return self.getComplexOrder(lib,map,queue,hold);
                        }
                    }
                }
            }
        }

        if(recover===null) queue.push(name);

        //2.check extend complex;
        if(row.ext && row.ext.length>0){
            if(recover!==null){
                if(recover.ext!==undefined && recover.ext!==row.ext.length){
                    for(let i=recover.ext+1;i<row.ext.length;i++){
                        const ext=row.ext[i];
                        if(map[ext]===true){
                            queue.push(ext);
                        }else{
                            hold.push({ext:i,name:name});
                            return self.getComplexOrder(ext,map,queue,hold);
                        }
                    }
                }
            }else{
                for(let i=0;i<row.ext.length;i++){
                    const ext=row.ext[i];
                    if(map[ext]===true){
                        queue.push(ext);
                    }else{
                        hold.push({ext:i,name:name});
                        return self.getComplexOrder(ext,map,queue,hold);
                    }
                }
            }
        }

        if(hold.length!==0){
            const last=hold[hold.length-1];
            return self.getComplexOrder(last.name,map,queue,hold);
        }

        return queue;
    },
    mergeOrder:(order)=>{
        const complex={};
        const map={};
        const done={};
        const queue=[];
        for(let i=0;i<order.length;i++){
            const row=order[i];
            if (typeof row !== 'string' && row.entry!==undefined){
                complex[row.entry]=true;
                map[row.entry]=row;
            }else{
                map[row]=true;
            }
        }

        for(let i=0;i<order.length;i++){
            const row=order[i];
            if (typeof row === 'string' || row instanceof String){
                if(done[row]) continue;
                queue.push(row);
                done[row]=true;
            }else{
                //2.complex lib
                //2.1.add required libs
                if(row.lib && row.lib.length>0){
                    for(let i=0;i<row.lib.length;i++){
                        const lib=row.lib[i];
                        if(done[lib]) continue;
                        if(complex[lib]){
                            const cqueue=self.getComplexOrder(lib,map);
                            console.log(`${lib}:${JSON.stringify(cqueue)}`)
                            for(let j=0;j<cqueue.length;j++){
                                const clib=cqueue[j];
                                if(done[clib]) continue;
                                queue.push(clib);
                                done[clib]=true;
                            }
                        }else{
                            queue.push(lib);
                            done[lib]=true;
                        }
                    }
                }
                //2.2.add lib body
                if(!done[row.entry]){
                    queue.push(row.entry);
                    done[row.entry]=true;
                }

                //2.3.add required extend plugins
                if(row.ext && row.ext.length>0){
                    for(let i=0;i<row.ext.length;i++){
                        const ext=row.ext[i];
                        if(done[ext]) continue;
                        if(complex[ext]){
                            const cqueue=self.getComplexOrder(ext,map);
                            for(let j=0;j<cqueue.length;j++){
                                const cext=cqueue[j];
                                if(done[cext]) continue;
                                queue.push(cext);
                                done[cext]=true;
                            }
                        }else{
                            queue.push(ext);
                            done[ext]=true;
                        }
                    }
                }
            }
        }

        return queue;
    },
    regroupCode:(map,order)=>{
        //console.log(map);
        const decode=self.decodeLib;
        let js='';
        let css='';
        let done={};
        let failed={};
        let error=false;    //标志位输出

        const ods=self.mergeOrder(order);
        for(let i=0;i<ods.length;i++){
            const row=ods[i];
            if(done[row]) continue;
            const dt=map[row];
            const res=decode(dt);
            done[row]=true;
            if(res.error){
                failed[row]=res.error;
                error=true;
                continue;
            }
            js+=res.type==="js"?res.data:'';
            css+=res.type==="css"?res.data:'';
        }
        return {js:js,css:css,failed:failed,order:ods,error:error};
    },
}

exports.Loader =(list,API,ck)=>{
    search=API.search;
    target=API.target;
    self.getLibs(list,ck);
};

exports.Libs=(list,API,ck)=>{
    search=API.search;
    target=API.target;
    self.getLibs(list,(dt,order)=>{                
        const code=self.regroupCode(dt,order);
        return ck && ck(code);
    });
};

/***/ }),

/***/ "./node_modules/charenc/charenc.js":
/*!*****************************************!*\
  !*** ./node_modules/charenc/charenc.js ***!
  \*****************************************/
/***/ ((module) => {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),

/***/ "./node_modules/crypt/crypt.js":
/*!*************************************!*\
  !*** ./node_modules/crypt/crypt.js ***!
  \*************************************/
/***/ ((module) => {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/*!*****************************************!*\
  !*** ./node_modules/is-buffer/index.js ***!
  \*****************************************/
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "./node_modules/md5/md5.js":
/*!*********************************!*\
  !*** ./node_modules/md5/md5.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function(){
  var crypt = __webpack_require__(/*! crypt */ "./node_modules/crypt/crypt.js"),
      utf8 = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").utf8),
      isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/is-buffer/index.js"),
      bin = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").bin),

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message) && message.constructor !== Uint8Array)
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();


/***/ }),

/***/ "./src/auth.js":
/*!*********************!*\
  !*** ./src/auth.js ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

//!important This is the library for creating auth data
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkAuth = exports.easyAuth = void 0;
var md5 = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
// create the anchor hiddeing default data
var creator = function (anchor, ck, isNew) {
};
exports.easyAuth = creator;
// check anchor to get auth list. 
var check = function (anchor, protocol, ck) {
    var data = {
        "list": null,
        "anchor": null, //target anchor to get result
    };
    //TODO, auto MD5 anchor function is not tested yet.
    if (protocol.auth) {
        //1.check wether target anchor 
        if (typeof protocol.auth === "string" || Array.isArray(protocol.auth)) {
            data.anchor = protocol.auth;
        }
        else {
            data.list = protocol.auth;
        }
    }
    else {
        //2.check default anchor
        if (protocol.salt) {
            data.anchor = md5(anchor + protocol.salt[0]);
        }
    }
    return ck && ck(data);
};
exports.checkAuth = check;


/***/ }),

/***/ "./src/decoder.js":
/*!************************!*\
  !*** ./src/decoder.js ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

//!important This is the library for decoding anchor link
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.linkDecoder = exports.linkCreator = void 0;
var setting = {
    "check": false,
    "utf8": true,
    "pre": "anchor://", //protocol prefix
};
var self = {
    getParams: function (str) {
        var map = {};
        var arr = str.split("&");
        for (var i = 0; i < arr.length; i++) {
            var row = arr[i];
            var kv = row.split("=");
            if (kv.length !== 2)
                return { error: "error parameter" };
            map[kv[0]] = kv[1];
        }
        return map;
    },
    combineParams: function (obj) {
        if (!obj)
            return "";
        var list = [];
        for (var k in obj) {
            list.push("".concat(k, "=").concat(obj[k]));
        }
        if (list.length === 0)
            return '';
        return list.join("&");
    },
};
var creator = function (local, params) {
    var str = self.combineParams(params);
    if (Array.isArray(local)) {
        if (local[1] !== 0) {
            return "".concat(setting.pre).concat(local[0], "/").concat(local[1]).concat(!str ? str : "?" + str);
        }
        else {
            return "".concat(setting.pre).concat(local[0]).concat(!str ? str : "?" + str);
        }
    }
    else {
        return "".concat(setting.pre).concat(local).concat(!str ? str : "?" + str);
    }
};
exports.linkCreator = creator;
var decoder = function (link) {
    var res = {
        location: ["", 0],
    };
    var str = link.toLocaleLowerCase();
    var pre = setting.pre;
    //0. format check
    if (str.length <= pre.length + 1)
        return { error: "invalid string" };
    var head = str.substring(0, pre.length);
    if (head !== pre)
        return { error: "invalid protocol" };
    //1. remove prefix `anchor://`
    var body = str.substring(pre.length, str.length);
    //2. check parameter
    var arr = body.split("?");
    if (arr.length > 2)
        return { error: "error request, please check anchor name" };
    var isParam = arr.length === 1 ? false : true;
    if (isParam) {
        var ps = self.getParams(arr[1]);
        if (ps.error) {
            return ps;
        }
        res.param = self.getParams(arr[1]);
    }
    body = arr[0];
    //3. decode anchor location
    var ls = body.split("/");
    var last = [];
    for (var i = 0; i < ls.length; i++) {
        if (ls[i] !== '')
            last.push(ls[i]);
    }
    //4. export result
    if (last.length === 1) {
        res.location[0] = last[0];
        res.location[1] = 0;
    }
    else {
        var ele = last.pop();
        var block = parseInt(ele);
        if (isNaN(block))
            return { error: "block number error" };
        res.location[1] = block;
        res.location[0] = last.join('/');
    }
    return res;
};
exports.linkDecoder = decoder;


/***/ }),

/***/ "./src/hide.js":
/*!*********************!*\
  !*** ./src/hide.js ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkHide = exports.easyHide = void 0;
var md5 = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
var creator = function (anchor) {
};
exports.easyHide = creator;
// check anchor to get hide list
var check = function (anchor, protocol, ck) {
    var data = {
        "list": null,
        "anchor": null, //target anchor to get result
    };
    //TODO, auto MD5 anchor function is not tested yet.
    if (protocol.hide) {
        //1.check wether target anchor 
        if (typeof protocol.hide === "string") {
            data.anchor = protocol.hide;
        }
        else if (Array.isArray(protocol.hide)) {
            data.list = protocol.hide;
        }
        else {
            //data.list=protocol.hide;
        }
    }
    else {
        //2.check default anchor
        if (protocol.salt) {
            data.anchor = md5(anchor + protocol.salt[1]);
        }
    }
    return ck && ck(data);
};
exports.checkHide = check;


/***/ }),

/***/ "./src/protocol.js":
/*!*************************!*\
  !*** ./src/protocol.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

//!important This is the Typescript implement of Esay Protocol version 1.0.
//!important Easy Protocol is a simple protocol to launch cApp via Anchor network.
//!important All functions implement, but this implement only support JS with CSS application 
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.relatedIndex = exports.keysApp = exports.codeType = exports.formatType = exports.rawType = exports.errorLevel = void 0;
var errorLevel;
(function (errorLevel) {
    errorLevel["ERROR"] = "error";
    errorLevel["WARN"] = "warning";
    errorLevel["UNEXCEPT"] = "unexcept";
})(errorLevel = exports.errorLevel || (exports.errorLevel = {}));
/********************************/
/***********format part**********/
/********************************/
var rawType;
(function (rawType) {
    rawType["DATA"] = "data";
    rawType["APP"] = "app";
    rawType["LIB"] = "lib";
    rawType["NONE"] = "unknow";
})(rawType = exports.rawType || (exports.rawType = {}));
var formatType;
(function (formatType) {
    formatType["JAVASCRIPT"] = "js";
    formatType["CSS"] = "css";
    formatType["MARKDOWN"] = "md";
    formatType["JSON"] = "json";
    formatType["MIX"] = "mix";
    formatType["NONE"] = "";
})(formatType = exports.formatType || (exports.formatType = {}));
var codeType;
(function (codeType) {
    codeType["ASCII"] = "ascii";
    codeType["UTF8"] = "utf8";
    codeType["HEX"] = "hex";
    codeType["NONE"] = "";
})(codeType = exports.codeType || (exports.codeType = {}));
var keysApp;
(function (keysApp) {
})(keysApp = exports.keysApp || (exports.keysApp = {}));
var relatedIndex;
(function (relatedIndex) {
    relatedIndex[relatedIndex["AUTH"] = 0] = "AUTH";
    relatedIndex[relatedIndex["HIDE"] = 1] = "HIDE";
    relatedIndex[relatedIndex["TRUST"] = 2] = "TRUST";
    relatedIndex[relatedIndex["NAME"] = 0] = "NAME";
    relatedIndex[relatedIndex["BLOCK"] = 1] = "BLOCK";
})(relatedIndex = exports.relatedIndex || (exports.relatedIndex = {}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
/*!****************************!*\
  !*** ./src/interpreter.js ***!
  \****************************/

//!important This is the library for Esay Protocol v1.0
//!important All data come from `Anchor Link`
//!important This implement extend `auth` and `hide` by salt way to load data
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.easyRun = void 0;
var protocol_1 = __webpack_require__(/*! ./protocol */ "./src/protocol.js");
var protocol_2 = __webpack_require__(/*! ./protocol */ "./src/protocol.js");
var decoder_1 = __webpack_require__(/*! ./decoder */ "./src/decoder.js");
var auth_1 = __webpack_require__(/*! ./auth */ "./src/auth.js");
var hide_1 = __webpack_require__(/*! ./hide */ "./src/hide.js");
var _a = __webpack_require__(/*! ../lib/loader */ "./lib/loader.js"), Loader = _a.Loader, Libs = _a.Libs;
//const {anchorJS} =require("../lib/anchor");
var API = null;
//debug data to improve the development
var debug = {
    disable: false,
    cache: false,
    search: [],
    start: 0,
    end: 0,
    stamp: function () {
        return new Date().getTime();
    },
};
//anchor cache to avoid duplicate request.
var cache = {
    data: {},
    set: function (k, b, v) {
        cache.data["".concat(k, "_").concat(b)] = v;
        return true;
    },
    get: function (k, b) {
        return cache.data["".concat(k, "_").concat(b)];
    },
    clear: function () {
        cache.data = {};
    },
};
//before: 500~700ms
var self = {
    getAnchor: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var anchor = location[0], block = location[1];
        //debug hook
        if (!debug.cache) {
            var cData = cache.get(anchor, block);
            if (cData !== undefined)
                return ck && ck(cData);
        }
        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if (block !== 0) {
            API.common.target(anchor, block, function (data) {
                if (!debug.cache)
                    cache.set(anchor, block, data); //debug hook
                self.filterAnchor(data, ck);
            });
        }
        else {
            API.common.latest(anchor, function (data) {
                if (!debug.cache)
                    cache.set(anchor, block, data); //debug hook
                self.filterAnchor(data, ck);
            });
        }
    },
    filterAnchor: function (data, ck) {
        if (!data)
            return ck && ck({ error: "No such anchor.", level: protocol_1.errorLevel.ERROR });
        var err = data;
        if (err.error)
            return ck && ck({ error: err.error, level: protocol_1.errorLevel.ERROR });
        var anchor = data;
        if (!debug.disable)
            debug.search.push([anchor.name, anchor.block]); //debug hook 
        if (anchor.empty)
            return ck && ck({ error: "Empty anchor.", level: protocol_1.errorLevel.ERROR });
        if (!anchor.protocol)
            return ck && ck({ error: "No-protocol anchor." });
        var protocol = anchor.protocol;
        if (!protocol.type)
            return ck && ck({ error: "Not EasyProtocol anchor." });
        return ck && ck(anchor);
    },
    decodeData: function (cObject, ck) {
        //console.log(`Decode data anchor`);
        //console.log(cObject);
        cObject.type = protocol_1.rawType.DATA;
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        if (protocol !== null && protocol.call) {
            cObject.call = protocol.call;
        }
        return ck && ck(cObject);
    },
    decodeApp: function (cObject, ck) {
        //console.log(`Decode app anchor`);
        cObject.type = protocol_1.rawType.APP;
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        cObject.code = data.raw;
        if (protocol !== null && protocol.lib) {
            //FIXME code should be defined clearly
            self.getLibs(protocol.lib, function (code) {
                //console.log(code);
                cObject.libs = code;
                return ck && ck(cObject);
            });
        }
        else {
            return ck && ck(cObject);
        }
    },
    decodeLib: function (cObject, ck) {
        //console.log(`Decode lib anchor`);
        cObject.type = protocol_1.rawType.LIB;
        var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
        var protocol = data.protocol;
        //1.check and get libs
        if (protocol !== null && protocol.lib) {
            self.getLibs(protocol.lib, function (code) {
                //console.log(code);
                cObject.libs = code;
                return ck && ck(cObject);
            });
        }
        else {
            return ck && ck(cObject);
        }
    },
    getLibs: function (list, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        //console.log(`Ready to get libs: ${JSON.stringify(list)}`);
        var RPC = {
            search: API.common.latest,
            target: API.common.target,
        };
        Libs(list, RPC, ck);
    },
    getHistory: function (location, ck) {
        var list = [];
        var errs = [];
        if (API === null) {
            errs.push({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
            return ck && ck(list, errs);
        }
        //if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        var anchor = location[0], block = location[1];
        API.common.history(anchor, function (res) {
            var err = res;
            if (err.error) {
                errs.push(err);
                return ck && ck(list, errs);
            }
            var alist = res;
            if (alist.length === 0) {
                errs.push({ error: "Empty history" });
                return ck && ck(list, errs);
            }
            return ck && ck(alist, errs);
        });
    },
    /**
     * combine the hide and auth list to result
     * @param {string}      anchor	    //`Anchor` name
     * @param {object}      protocol    //Easy Protocol
     * @param {object}      cfg         //reversed config parameter
     * @param {function}    ck          //callback, will return the merge result, including the related `anchor`
     * */
    merge: function (anchor, protocol, cfg, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var result = {
            "hide": [],
            "auth": null,
            "error": [],
            "index": [null, null],
            "map": {},
        };
        var mlist = [];
        //1. check `declared hidden` and `authority` just by protocol data.
        (0, auth_1.checkAuth)(anchor, protocol, function (resAuth) {
            (0, hide_1.checkHide)(anchor, protocol, function (resHide) {
                if (resAuth.anchor === null && resHide.anchor === null) {
                    if (resAuth.list)
                        result.auth = resAuth.list;
                    if (resHide.list)
                        result.hide = resHide.list;
                    return ck && ck(result);
                }
                else if (resAuth.anchor === null && resHide.anchor !== null) {
                    var hide_anchor = typeof resHide.anchor === "string" ? [resHide.anchor, 0] : [resHide.anchor[0], resHide.anchor[1]];
                    self.getAnchor(hide_anchor, function (res) {
                        var errs = [];
                        var err = res;
                        if (err.error)
                            errs.push({ error: err.error });
                        var data = res;
                        return self.combineHide(result, data, errs, ck);
                    });
                }
                else if (resAuth.anchor !== null && resHide.anchor === null) {
                    var auth_anchor = typeof resAuth.anchor === "string" ? [resAuth.anchor, 0] : [resAuth.anchor[0], resAuth.anchor[1]];
                    self.getHistory(auth_anchor, function (alist, errsA) {
                        return self.combineAuth(result, alist, errsA, ck);
                    });
                }
                else if (resAuth.anchor !== null && resHide.anchor !== null) {
                    var hide_anchor = typeof resHide.anchor === "string" ? [resHide.anchor, 0] : [resHide.anchor[0], resHide.anchor[1]];
                    var auth_anchor_1 = typeof resAuth.anchor === "string" ? [resAuth.anchor, 0] : [resAuth.anchor[0], resAuth.anchor[1]];
                    self.getAnchor(hide_anchor, function (res) {
                        var errs = [];
                        var err = res;
                        if (err.error)
                            errs.push({ error: err.error });
                        var data = res;
                        return self.combineHide(result, data, errs, function (chResult) {
                            self.getHistory(auth_anchor_1, function (alist, errsA) {
                                self.combineAuth(chResult, alist, errsA, ck);
                            });
                        });
                    });
                }
            });
        });
    },
    combineHide: function (result, anchor, errs, ck) {
        if (errs.length !== 0) {
            //FIXME change to simple way to combine the errors.
            for (var i = 0; i < errs.length; i++)
                result.error.push(errs[i]);
        }
        result.map["".concat(anchor.name, "_").concat(anchor.block)] = anchor;
        result.index[protocol_2.relatedIndex.HIDE] = [anchor.name, anchor.block];
        var dhide = self.decodeHideAnchor(anchor);
        if (!Array.isArray(dhide)) {
            result.error.push(dhide);
        }
        else {
            result.hide = dhide;
        }
        return ck && ck(result);
    },
    combineAuth: function (result, list, errs, ck) {
        if (errs.length !== 0) {
            for (var i = 0; i < errs.length; i++)
                result.error.push(errs[i]);
        }
        for (var i = 0; i < list.length; i++) {
            var row = list[i];
            result.map["".concat(row.name, "_").concat(row.block)] = row;
        }
        var last = list[0];
        var hlist = []; //get latest auth anchor hide list.
        self.decodeAuthAnchor(list, hlist, function (map, amap, errs) {
            for (var k in amap)
                result.map[k] = amap[k]; //if hide anchor data, merge to result
            for (var i = 0; i < errs.length; i++)
                result.error.push(errs[i]);
            result.index[protocol_2.relatedIndex.AUTH] = [last.name, 0];
            result.auth = map;
            return ck && ck(result);
        });
    },
    decodeHideAnchor: function (obj) {
        var list = [];
        var protocol = obj.protocol;
        if ((protocol === null || protocol === void 0 ? void 0 : protocol.fmt) === 'json') {
            try {
                var raw = JSON.parse(obj.raw);
                if (Array.isArray(raw)) {
                    for (var i = 0; i < raw.length; i++) {
                        var n = parseInt(raw[i]);
                        if (!isNaN(n))
                            list.push(n);
                    }
                }
            }
            catch (error) {
                return { error: 'failed to parse JSON' };
            }
        }
        return list;
    },
    //!important, by using the history of anchor, `hide` keyword is still support
    //!important, checking the latest anchor data, using the `hide` feild to get data.
    decodeAuthAnchor: function (list, hlist, ck) {
        var map = {};
        var amap = {};
        var errs = [];
        //FIXME, if the latest auth anchor is hidden,need to check next one.
        var last = list[0];
        if (last.protocol === null) {
            errs.push({ error: "Not valid anchor" });
            return ck && ck(map, amap, errs);
        }
        var protocol = last.protocol;
        self.authHideList(protocol, function (hlist, resMap, herrs) {
            errs.push.apply(errs, herrs);
            for (var k in resMap) {
                amap[k] = resMap[k];
            }
            var hmap = {};
            for (var i = 0; i < hlist.length; i++) {
                hmap[hlist[i].toString()] = true;
            }
            for (var i = 0; i < list.length; i++) {
                var row = list[i];
                if (hmap[row.block.toString()])
                    continue;
                if (!row.protocol || row.protocol.fmt !== protocol_1.formatType.JSON || row.raw === null)
                    continue;
                try {
                    var tmap = JSON.parse(row.raw);
                    for (var k in tmap)
                        map[k] = tmap[k];
                }
                catch (error) {
                    errs.push({ error: error });
                }
            }
            return ck && ck(map, amap, errs);
        });
    },
    //check auth anchor's hide list
    authHideList: function (protocol, ck) {
        var map = {};
        var errs = [];
        var list = [];
        if (!protocol.hide)
            return ck && ck(list, map, errs);
        if (Array.isArray(protocol.hide))
            return ck && ck(protocol.hide, map, errs);
        self.getAnchor([protocol.hide, 0], function (anchorH) {
            var err = anchorH;
            if (err.error) {
                errs.push(err);
                return ck && ck(list, map, errs);
            }
            var hlist = self.decodeHideAnchor(anchorH);
            var errH = hlist;
            if (errH.error)
                errs.push(errH);
            var anchor = anchorH;
            //console.log(anchor);
            map["".concat(anchor.name, "_").concat(anchor.block)] = anchor;
            return ck && ck(hlist, map, errs);
        });
    },
    checkLast: function (name, block, ck) {
        API === null || API === void 0 ? void 0 : API.common.owner(name, function (owner, last) {
            return ck && ck(block === last ? true : false);
        });
    },
    //check wether current anchor is in the hide list
    isValidAnchor: function (hide, data, ck, params) {
        //console.log(params);
        var errs = [];
        var cur = data.block;
        var overload = false; //wether to the end of `Anchor` history
        if (Array.isArray(hide)) {
            //1.if the hide is array, check directly
            var hlist = hide;
            for (var i = 0; i < hlist.length; i++) {
                if (cur === hlist[i]) {
                    if (data.pre === 0) {
                        errs.push({ error: "Out of ".concat(data.name, " limited") });
                        overload = true;
                        return ck && ck(null, errs, overload);
                    }
                    var new_link = (0, decoder_1.linkCreator)([data.name, data.pre], params);
                    return ck && ck(new_link, errs, overload);
                }
            }
            return ck && ck(null, errs);
        }
        else {
            //2.get the latest hide anchor data
            var h_location = [hide, 0];
            self.getAnchor(h_location, function (hdata) {
                var res = self.decodeHideAnchor(hdata);
                var err = res;
                if (err.error)
                    errs.push(err);
                var hlist = res;
                for (var i = 0; i < hlist.length; i++) {
                    if (cur === hlist[i]) {
                        if (data.pre === 0) {
                            errs.push({ error: "Out of ".concat(data.name, " limited") });
                            overload = true;
                            return ck && ck(null, errs, overload);
                        }
                        var new_link = (0, decoder_1.linkCreator)([data.name, data.pre], params);
                        return ck && ck(new_link, errs, overload);
                    }
                }
                return ck && ck(null, errs, overload);
            });
        }
    },
    //check the authority between anchors
    checkTrust: function (caller, app, ck) {
    },
    //check the authority to account address
    checkAuthority: function (caller, app, ck) {
        //1.check the called anchor type.
        if (app.type !== protocol_1.rawType.APP) {
            caller.error.push({ error: "Answer is not cApp." });
            return ck && ck(caller);
        }
        //2.check the authority
        var from = caller.data["".concat(caller.location[0], "_").concat(caller.location[1])];
        var signer = from.signer;
        var auths = app.auth;
        //2.1. no authority data, can 
        if (auths === undefined) {
            caller.app = app;
            return ck && ck(caller);
        }
        else {
            if (self.empty(auths)) {
                caller.app = app;
                return ck && ck(caller);
            }
            else {
                if (auths[signer] === undefined) {
                    caller.error.push({ error: "No authority of caller." });
                    return ck && ck(caller);
                }
                else {
                    if (auths[signer] === 0) {
                        caller.app = app;
                        return ck && ck(caller);
                    }
                    else {
                        API === null || API === void 0 ? void 0 : API.common.block(function (block, hash) {
                            console.log(block);
                            if (block > auths[signer]) {
                                caller.error.push({ error: "Authority out of time." });
                                return ck && ck(caller);
                            }
                            else {
                                caller.app = app;
                                return ck && ck(caller);
                            }
                        });
                    }
                }
            }
        }
    },
    //get the latest decared hide anchor list.
    getLatestDeclaredHidden: function (location, ck) {
        self.getAnchor([location[0], 0], function (resLatest) {
            //1. failde to get the hide anchor.
            var err = resLatest;
            //if(err.error) return ck && ck(err);
            if (err.error)
                return ck && ck([]);
            var data = resLatest;
            var protocol = data.protocol;
            if (protocol === null || !protocol.hide)
                return ck && ck([]);
            if (Array.isArray(protocol.hide))
                return ck && ck(protocol.hide);
            self.getAnchor([protocol.hide, 0], function (resHide) {
                var err = resLatest;
                //if(err.error) return ck && ck(err);
                if (err.error)
                    return ck && ck([]);
                var data = resHide;
                if (data === null || !data.raw)
                    return ck && ck([]);
                try {
                    var list = JSON.parse(data.raw);
                    return ck && ck(list);
                }
                catch (error) {
                    return ck && ck({ error: error });
                }
            });
        });
    },
    /**
     * get params from string
     * @param {string}      args	    //String such as `key_a=val&key_b=val&key_c=val`
     * */
    getParams: function (args) {
        var map = {};
        var arr = args.split("&");
        for (var i = 0; i < arr.length; i++) {
            var row = arr[i];
            var kv = row.split("=");
            if (kv.length !== 2)
                return { error: "error parameter" };
            map[kv[0]] = kv[1];
        }
        return map;
    },
    /**
     * check wether object empty
     * @param {object}      obj	    //normal object
     * */
    empty: function (obj) {
        for (var k in obj)
            return false;
        return true;
    },
};
var decoder = {};
decoder[protocol_1.rawType.APP] = self.decodeApp;
decoder[protocol_1.rawType.DATA] = self.decodeData;
decoder[protocol_1.rawType.LIB] = self.decodeLib;
//!important, as support `declared hidden`, this function may redirect many times, be careful.
/**
 * Exposed method of Easy Protocol implement
 * @param {string}      linker	    //Anchor linker, such as `anchor://hello/`
 * @param {object}      inputAPI    //the API needed to access Anchor network, `anchorJS` mainly
 * @param {function}    ck          //callback, will return the decoded result
 * @param {boolean}     [fence]     //if true, treat the run result as cApp. Then end of the loop.
 * */
var run = function (linker, inputAPI, ck, hlist, fence) {
    if (API === null && inputAPI !== null)
        API = inputAPI;
    var target = (0, decoder_1.linkDecoder)(linker);
    if (target.error)
        return ck && ck(target);
    //0.get the latest declared hidden list
    if (hlist === undefined) {
        return self.getLatestDeclaredHidden(target.location, function (lastHide) {
            var cObject = {
                type: protocol_1.rawType.NONE,
                location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
                error: [],
                data: {},
                index: [null, null],
            };
            var res = lastHide;
            if (res.error) {
                cObject.error.push(res);
                return ck && ck(cObject);
            }
            var hResult = lastHide;
            return run(linker, API, ck, hResult);
        });
    }
    //1.decode the `Anchor Link`, prepare the result object.
    var cObject = {
        type: protocol_1.rawType.NONE,
        location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
        error: [],
        data: {},
        index: [null, null],
        hide: hlist,
    };
    if (target.param)
        cObject.parameter = target.param;
    //2.Try to get the target `Anchor` data.
    self.getAnchor(target.location, function (resAnchor) {
        //2.1.error handle.
        var err = resAnchor;
        if (err.error) {
            cObject.error.push(err);
            return ck && ck(cObject);
        }
        var data = resAnchor;
        if (cObject.location[1] === 0)
            cObject.location[1] = data.block;
        cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])] = data;
        //2.2.Wether JSON protocol
        if (data.protocol === null) {
            cObject.error.push({ error: "No valid protocol" });
            return ck && ck(cObject);
        }
        //2.3.Wether Easy Protocol
        var type = !data.protocol.type ? "" : data.protocol.type;
        if (!decoder[type]) {
            cObject.error.push({ error: "Not easy protocol type" });
            return ck && ck(cObject);
        }
        //3. check wether the latest anchor. If not, need to get latest hide data.
        if (data.protocol) {
            self.isValidAnchor(hlist, data, function (validLink, errs, overload) {
                var _a;
                (_a = cObject.error).push.apply(_a, errs);
                if (overload)
                    return ck && ck(cObject);
                if (validLink !== null)
                    return run(validLink, API, ck, hlist);
                return getResult(type);
            }, cObject.parameter === undefined ? {} : cObject.parameter);
        }
        else {
            return getResult(type);
        }
        //inline function to avoid the repetitive code.
        function getResult(type) {
            self.merge(data.name, data.protocol, {}, function (mergeResult) {
                var _a;
                if (mergeResult.auth !== null)
                    cObject.auth = mergeResult.auth;
                if (mergeResult.hide != null && mergeResult.hide.length !== 0) {
                    cObject.hide = mergeResult.hide;
                }
                if (mergeResult.error.length !== 0) {
                    (_a = cObject.error).push.apply(_a, mergeResult.error);
                }
                if (mergeResult.index[protocol_2.relatedIndex.AUTH] !== null && cObject.index) {
                    cObject.index[protocol_2.relatedIndex.AUTH] = mergeResult.index[protocol_2.relatedIndex.AUTH];
                }
                if (mergeResult.index[protocol_2.relatedIndex.HIDE] !== null && cObject.index) {
                    cObject.index[protocol_2.relatedIndex.HIDE] = mergeResult.index[protocol_2.relatedIndex.HIDE];
                }
                for (var k in mergeResult.map) {
                    cObject.data[k] = mergeResult.map[k];
                }
                return decoder[type](cObject, function (resFirst) {
                    if (resFirst.call && !fence) {
                        var app_link = (0, decoder_1.linkCreator)(resFirst.call, resFirst.parameter === undefined ? {} : resFirst.parameter);
                        return run(app_link, API, function (resApp) {
                            return self.checkAuthority(resFirst, resApp, ck);
                        }, hlist, true);
                    }
                    else {
                        return ck && ck(resFirst);
                    }
                });
            });
        }
    });
};
//Debug part to get more details of process.
var debug_run = function (linker, inputAPI, ck) {
    debug.search = [];
    debug.start = debug.stamp();
    run(linker, inputAPI, function (resRun) {
        if (!debug.disable)
            resRun.debug = debug; //add debug information
        debug.end = debug.stamp();
        cache.clear();
        return ck && ck(resRun);
    });
};
var final_run = (debug.disable ? run : debug_run);
exports.easyRun = final_run;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQSxlQUFlIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vbGliL2xvYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY2hhcmVuYy9jaGFyZW5jLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jcnlwdC9jcnlwdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tZDUvbWQ1LmpzIiwid2VicGFjazovLy8uL3NyYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3NyYy9kZWNvZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9oaWRlLmpzIiwid2VicGFjazovLy8uL3NyYy9wcm90b2NvbC5qcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVycHJldGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImxldCBzZWFyY2g9bnVsbDtcbmxldCB0YXJnZXQ9bnVsbDtcbmNvbnN0IHNlbGY9e1xuICAgIGdldExpYnM6KGxpc3QsY2ssY2FjaGUsb3JkZXIpPT57XG4gICAgICAgIC8vY29uc29sZS5sb2coYFN0YXJ0OiR7SlNPTi5zdHJpbmdpZnkobGlzdCl9YCk7XG4gICAgICAgIGlmKCFjYWNoZSkgY2FjaGU9e307XG4gICAgICAgIGlmKCFvcmRlcikgb3JkZXI9W107XG4gICAgICAgIGNvbnN0IHJvdz1saXN0LnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IGFuY2hvcj0oQXJyYXkuaXNBcnJheShyb3cpP3Jvd1swXTpyb3cpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGJsb2NrPUFycmF5LmlzQXJyYXkocm93KT9yb3dbMV06MDtcblxuICAgICAgICAvLzEuY2hlY2sgbGliIGxvYWRpbmcgc3RhdHVzXG4gICAgICAgIGlmKGNhY2hlW2FuY2hvcl0pIHJldHVybiBzZWxmLmdldExpYnMobGlzdCxjayxjYWNoZSxvcmRlcik7XG5cbiAgICAgICAgLy8yLmdldCB0YXJnZXQgYW5jaG9yXG4gICAgICAgIHNlbGYuZ2V0QW5jaG9yKGFuY2hvcixibG9jaywoYW4scmVzKT0+e1xuICAgICAgICAgICAgY2FjaGVbYW5dPSFyZXM/e2Vycm9yOidubyBzdWNoIGFuY2hvcid9OnJlcztcbiAgICAgICAgICAgIGlmKCFyZXMucHJvdG9jb2wgfHwgKCFyZXMucHJvdG9jb2wuZXh0ICYmICFyZXMucHJvdG9jb2wubGliKSl7XG4gICAgICAgICAgICAgICAgb3JkZXIucHVzaChhbik7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb25zdCBxdT17XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5OmFuLFxuICAgICAgICAgICAgICAgICAgICBsaWI6cmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5saWI/cmVzLnByb3RvY29sLmxpYjpbXSxcbiAgICAgICAgICAgICAgICAgICAgZXh0OnJlcy5wcm90b2NvbCAmJiByZXMucHJvdG9jb2wuZXh0P3Jlcy5wcm90b2NvbC5leHQ6W10sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBvcmRlci5wdXNoKHF1KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5leHQpe1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT1yZXMucHJvdG9jb2wuZXh0Lmxlbmd0aDtpPjA7aS0tKSBsaXN0LnVuc2hpZnQocmVzLnByb3RvY29sLmV4dFtpLTFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHJlcy5wcm90b2NvbCAmJiByZXMucHJvdG9jb2wubGliKXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk9cmVzLnByb3RvY29sLmxpYi5sZW5ndGg7aT4wO2ktLSkgbGlzdC51bnNoaWZ0KHJlcy5wcm90b2NvbC5saWJbaS0xXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGxpc3QubGVuZ3RoPT09MCkgcmV0dXJuIGNrICYmIGNrKGNhY2hlLG9yZGVyKTtcbiAgICAgICAgICAgIHNlbGYuZ2V0TGlicyhsaXN0LGNrLGNhY2hlLG9yZGVyKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRBbmNob3I6KGFuY2hvcixibG9jayxjayk9PntcbiAgICAgICAgaWYoIWFuY2hvcikgcmV0dXJuIGNrICYmIGNrKGFuY2hvciwnJyk7XG4gICAgICAgIGNvbnN0IGZ1bj1ibG9jaz09PTA/c2VhcmNoOnRhcmdldDtcbiAgICAgICAgZnVuKGFuY2hvciwgKHJlcyk9PntcbiAgICAgICAgICAgIGlmKCFyZXMgfHwgKCFyZXMub3duZXIpKSByZXR1cm4gY2sgJiYgY2soYW5jaG9yLCcnKTtcbiAgICAgICAgICAgIGlmKCFyZXMuZW1wdHkpe1xuICAgICAgICAgICAgICAgICBjb25zdCBkdD17XG4gICAgICAgICAgICAgICAgICAgIGtleTpyZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcmF3OnJlcy5yYXcsXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sOnJlcy5wcm90b2NvbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhhbmNob3IsZHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRlY29kZUxpYjooZHQpPT57XG4gICAgICAgIGNvbnN0IHJlc3VsdD17dHlwZTonZXJyb3InLGRhdGE6Jyd9O1xuICAgICAgICBpZihkdC5lcnJvcil7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3I9ZHQuZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIWR0LnByb3RvY29sKXtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcj0nVW5leGNlcHQgZGF0YSBmb3JtYXQnO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3RvPWR0LnByb3RvY29sO1xuICAgICAgICBpZighcHJvdG8uZm10KXtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcj0nQW5jaG9yIGZvcm1hdCBsb3N0JztcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnR5cGU9cHJvdG8uZm10O1xuXG4gICAgICAgIC8vc29sdmUgcmF3IHByb2JsZW07IGhleCB0byBhc2NpaVxuICAgICAgICBpZihkdC5yYXcuc3Vic3RyKDAsIDIpLnRvTG93ZXJDYXNlKCk9PT0nMHgnKXtcbiAgICAgICAgICAgIHJlc3VsdC5kYXRhPWRlY29kZVVSSUNvbXBvbmVudChkdC5yYXcuc2xpY2UoMikucmVwbGFjZSgvXFxzKy9nLCAnJykucmVwbGFjZSgvWzAtOWEtZl17Mn0vZywgJyUkJicpKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXN1bHQuZGF0YT1kdC5yYXc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIFxuICAgIGdldENvbXBsZXhPcmRlcjoobmFtZSxtYXAscXVldWUsaG9sZCk9PntcbiAgICAgICAgaWYoIXF1ZXVlKSBxdWV1ZT1bXTsgICAgICAgIC8v6I635Y+W55qEXG4gICAgICAgIGlmKCFob2xkKSBob2xkPVtdOyAgICAgICAgICAvLzEu55So5p2l6KGo6L6+5aSE55CG54q25oCBXG5cbiAgICAgICAgaWYobWFwW25hbWVdPT09dHJ1ZSAmJiBob2xkLmxlbmd0aD09PTApIHJldHVybiBxdWV1ZTtcbiAgICAgICAgY29uc3Qgcm93PW1hcFtuYW1lXTtcblxuICAgICAgICBjb25zdCBsYXN0PWhvbGQubGVuZ3RoIT09MD9ob2xkW2hvbGQubGVuZ3RoLTFdOm51bGw7XG4gICAgICAgIGNvbnN0IHJlY292ZXI9KGxhc3QhPT1udWxsJiZsYXN0Lm5hbWU9PT1uYW1lKT9ob2xkLnBvcCgpOm51bGw7XG5cbiAgICAgICAgLy8xLmNoZWNrIGxpYiBjb21wbGV4O1xuICAgICAgICBpZihyb3cubGliICYmIHJvdy5saWIubGVuZ3RoPjApe1xuICAgICAgICAgICAgaWYocmVjb3Zlcj09PW51bGwpe1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cm93LmxpYi5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGliPXJvdy5saWJbaV07XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3JlYWR5IHRvIGNoZWNrIGxpYjonK2xpYik7XG4gICAgICAgICAgICAgICAgICAgIGlmKG1hcFtsaWJdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGxpYik7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtsaWI6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihsaWIsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaWYocmVjb3Zlci5saWIhPT11bmRlZmluZWQgJiYgcmVjb3Zlci5saWIhPT1yb3cubGliLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT1yZWNvdmVyLmxpYisxO2k8cm93LmxpYi5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpYj1yb3cubGliW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygncmVhZHkgdG8gY2hlY2sgbGliOicrbGliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1hcFtsaWJdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtsaWI6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIobGliLG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHJlY292ZXI9PT1udWxsKSBxdWV1ZS5wdXNoKG5hbWUpO1xuXG4gICAgICAgIC8vMi5jaGVjayBleHRlbmQgY29tcGxleDtcbiAgICAgICAgaWYocm93LmV4dCAmJiByb3cuZXh0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgIGlmKHJlY292ZXIhPT1udWxsKXtcbiAgICAgICAgICAgICAgICBpZihyZWNvdmVyLmV4dCE9PXVuZGVmaW5lZCAmJiByZWNvdmVyLmV4dCE9PXJvdy5leHQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPXJlY292ZXIuZXh0KzE7aTxyb3cuZXh0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0PXJvdy5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihtYXBbZXh0XT09PXRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbGQucHVzaCh7ZXh0OmksbmFtZTpuYW1lfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Q29tcGxleE9yZGVyKGV4dCxtYXAscXVldWUsaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPHJvdy5leHQubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dD1yb3cuZXh0W2ldO1xuICAgICAgICAgICAgICAgICAgICBpZihtYXBbZXh0XT09PXRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChleHQpO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGQucHVzaCh7ZXh0OmksbmFtZTpuYW1lfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIoZXh0LG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGhvbGQubGVuZ3RoIT09MCl7XG4gICAgICAgICAgICBjb25zdCBsYXN0PWhvbGRbaG9sZC5sZW5ndGgtMV07XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIobGFzdC5uYW1lLG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICB9LFxuICAgIG1lcmdlT3JkZXI6KG9yZGVyKT0+e1xuICAgICAgICBjb25zdCBjb21wbGV4PXt9O1xuICAgICAgICBjb25zdCBtYXA9e307XG4gICAgICAgIGNvbnN0IGRvbmU9e307XG4gICAgICAgIGNvbnN0IHF1ZXVlPVtdO1xuICAgICAgICBmb3IobGV0IGk9MDtpPG9yZGVyLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgY29uc3Qgcm93PW9yZGVyW2ldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByb3cgIT09ICdzdHJpbmcnICYmIHJvdy5lbnRyeSE9PXVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgY29tcGxleFtyb3cuZW50cnldPXRydWU7XG4gICAgICAgICAgICAgICAgbWFwW3Jvdy5lbnRyeV09cm93O1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgbWFwW3Jvd109dHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihsZXQgaT0wO2k8b3JkZXIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBjb25zdCByb3c9b3JkZXJbaV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJvdyA9PT0gJ3N0cmluZycgfHwgcm93IGluc3RhbmNlb2YgU3RyaW5nKXtcbiAgICAgICAgICAgICAgICBpZihkb25lW3Jvd10pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gocm93KTtcbiAgICAgICAgICAgICAgICBkb25lW3Jvd109dHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIC8vMi5jb21wbGV4IGxpYlxuICAgICAgICAgICAgICAgIC8vMi4xLmFkZCByZXF1aXJlZCBsaWJzXG4gICAgICAgICAgICAgICAgaWYocm93LmxpYiAmJiByb3cubGliLmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxyb3cubGliLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGliPXJvdy5saWJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lW2xpYl0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY29tcGxleFtsaWJdKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcXVldWU9c2VsZi5nZXRDb21wbGV4T3JkZXIobGliLG1hcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7bGlifToke0pTT04uc3RyaW5naWZ5KGNxdWV1ZSl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGo9MDtqPGNxdWV1ZS5sZW5ndGg7aisrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpYj1jcXVldWVbal07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmVbY2xpYl0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGNsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lW2NsaWJdPXRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVbbGliXT10cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vMi4yLmFkZCBsaWIgYm9keVxuICAgICAgICAgICAgICAgIGlmKCFkb25lW3Jvdy5lbnRyeV0pe1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHJvdy5lbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGRvbmVbcm93LmVudHJ5XT10cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vMi4zLmFkZCByZXF1aXJlZCBleHRlbmQgcGx1Z2luc1xuICAgICAgICAgICAgICAgIGlmKHJvdy5leHQgJiYgcm93LmV4dC5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cm93LmV4dC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dD1yb3cuZXh0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZVtleHRdKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbXBsZXhbZXh0XSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3F1ZXVlPXNlbGYuZ2V0Q29tcGxleE9yZGVyKGV4dCxtYXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaj0wO2o8Y3F1ZXVlLmxlbmd0aDtqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjZXh0PWNxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZVtjZXh0XSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY2V4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVbY2V4dF09dHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZVtleHRdPXRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcXVldWU7XG4gICAgfSxcbiAgICByZWdyb3VwQ29kZToobWFwLG9yZGVyKT0+e1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1hcCk7XG4gICAgICAgIGNvbnN0IGRlY29kZT1zZWxmLmRlY29kZUxpYjtcbiAgICAgICAgbGV0IGpzPScnO1xuICAgICAgICBsZXQgY3NzPScnO1xuICAgICAgICBsZXQgZG9uZT17fTtcbiAgICAgICAgbGV0IGZhaWxlZD17fTtcbiAgICAgICAgbGV0IGVycm9yPWZhbHNlOyAgICAvL+agh+W/l+S9jei+k+WHulxuXG4gICAgICAgIGNvbnN0IG9kcz1zZWxmLm1lcmdlT3JkZXIob3JkZXIpO1xuICAgICAgICBmb3IobGV0IGk9MDtpPG9kcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGNvbnN0IHJvdz1vZHNbaV07XG4gICAgICAgICAgICBpZihkb25lW3Jvd10pIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgZHQ9bWFwW3Jvd107XG4gICAgICAgICAgICBjb25zdCByZXM9ZGVjb2RlKGR0KTtcbiAgICAgICAgICAgIGRvbmVbcm93XT10cnVlO1xuICAgICAgICAgICAgaWYocmVzLmVycm9yKXtcbiAgICAgICAgICAgICAgICBmYWlsZWRbcm93XT1yZXMuZXJyb3I7XG4gICAgICAgICAgICAgICAgZXJyb3I9dHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpzKz1yZXMudHlwZT09PVwianNcIj9yZXMuZGF0YTonJztcbiAgICAgICAgICAgIGNzcys9cmVzLnR5cGU9PT1cImNzc1wiP3Jlcy5kYXRhOicnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7anM6anMsY3NzOmNzcyxmYWlsZWQ6ZmFpbGVkLG9yZGVyOm9kcyxlcnJvcjplcnJvcn07XG4gICAgfSxcbn1cblxuZXhwb3J0cy5Mb2FkZXIgPShsaXN0LEFQSSxjayk9PntcbiAgICBzZWFyY2g9QVBJLnNlYXJjaDtcbiAgICB0YXJnZXQ9QVBJLnRhcmdldDtcbiAgICBzZWxmLmdldExpYnMobGlzdCxjayk7XG59O1xuXG5leHBvcnRzLkxpYnM9KGxpc3QsQVBJLGNrKT0+e1xuICAgIHNlYXJjaD1BUEkuc2VhcmNoO1xuICAgIHRhcmdldD1BUEkudGFyZ2V0O1xuICAgIHNlbGYuZ2V0TGlicyhsaXN0LChkdCxvcmRlcik9PnsgICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvZGU9c2VsZi5yZWdyb3VwQ29kZShkdCxvcmRlcik7XG4gICAgICAgIHJldHVybiBjayAmJiBjayhjb2RlKTtcbiAgICB9KTtcbn07IiwidmFyIGNoYXJlbmMgPSB7XG4gIC8vIFVURi04IGVuY29kaW5nXG4gIHV0Zjg6IHtcbiAgICAvLyBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIHN0cmluZ1RvQnl0ZXM6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgcmV0dXJuIGNoYXJlbmMuYmluLnN0cmluZ1RvQnl0ZXModW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBzdHJpbmdcbiAgICBieXRlc1RvU3RyaW5nOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoY2hhcmVuYy5iaW4uYnl0ZXNUb1N0cmluZyhieXRlcykpKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQmluYXJ5IGVuY29kaW5nXG4gIGJpbjoge1xuICAgIC8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgc3RyaW5nVG9CeXRlczogZnVuY3Rpb24oc3RyKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKylcbiAgICAgICAgYnl0ZXMucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIHN0cmluZ1xuICAgIGJ5dGVzVG9TdHJpbmc6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBzdHIgPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgc3RyLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSkpO1xuICAgICAgcmV0dXJuIHN0ci5qb2luKCcnKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2hhcmVuYztcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIGJhc2U2NG1hcFxuICAgICAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLycsXG5cbiAgY3J5cHQgPSB7XG4gICAgLy8gQml0LXdpc2Ugcm90YXRpb24gbGVmdFxuICAgIHJvdGw6IGZ1bmN0aW9uKG4sIGIpIHtcbiAgICAgIHJldHVybiAobiA8PCBiKSB8IChuID4+PiAoMzIgLSBiKSk7XG4gICAgfSxcblxuICAgIC8vIEJpdC13aXNlIHJvdGF0aW9uIHJpZ2h0XG4gICAgcm90cjogZnVuY3Rpb24obiwgYikge1xuICAgICAgcmV0dXJuIChuIDw8ICgzMiAtIGIpKSB8IChuID4+PiBiKTtcbiAgICB9LFxuXG4gICAgLy8gU3dhcCBiaWctZW5kaWFuIHRvIGxpdHRsZS1lbmRpYW4gYW5kIHZpY2UgdmVyc2FcbiAgICBlbmRpYW46IGZ1bmN0aW9uKG4pIHtcbiAgICAgIC8vIElmIG51bWJlciBnaXZlbiwgc3dhcCBlbmRpYW5cbiAgICAgIGlmIChuLmNvbnN0cnVjdG9yID09IE51bWJlcikge1xuICAgICAgICByZXR1cm4gY3J5cHQucm90bChuLCA4KSAmIDB4MDBGRjAwRkYgfCBjcnlwdC5yb3RsKG4sIDI0KSAmIDB4RkYwMEZGMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEVsc2UsIGFzc3VtZSBhcnJheSBhbmQgc3dhcCBhbGwgaXRlbXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbi5sZW5ndGg7IGkrKylcbiAgICAgICAgbltpXSA9IGNyeXB0LmVuZGlhbihuW2ldKTtcbiAgICAgIHJldHVybiBuO1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmF0ZSBhbiBhcnJheSBvZiBhbnkgbGVuZ3RoIG9mIHJhbmRvbSBieXRlc1xuICAgIHJhbmRvbUJ5dGVzOiBmdW5jdGlvbihuKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdOyBuID4gMDsgbi0tKVxuICAgICAgICBieXRlcy5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBiaWctZW5kaWFuIDMyLWJpdCB3b3Jkc1xuICAgIGJ5dGVzVG9Xb3JkczogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIHdvcmRzID0gW10sIGkgPSAwLCBiID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrLCBiICs9IDgpXG4gICAgICAgIHdvcmRzW2IgPj4+IDVdIHw9IGJ5dGVzW2ldIDw8ICgyNCAtIGIgJSAzMik7XG4gICAgICByZXR1cm4gd29yZHM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYmlnLWVuZGlhbiAzMi1iaXQgd29yZHMgdG8gYSBieXRlIGFycmF5XG4gICAgd29yZHNUb0J5dGVzOiBmdW5jdGlvbih3b3Jkcykge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgYiA9IDA7IGIgPCB3b3Jkcy5sZW5ndGggKiAzMjsgYiArPSA4KVxuICAgICAgICBieXRlcy5wdXNoKCh3b3Jkc1tiID4+PiA1XSA+Pj4gKDI0IC0gYiAlIDMyKSkgJiAweEZGKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBoZXggc3RyaW5nXG4gICAgYnl0ZXNUb0hleDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGhleCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhleC5wdXNoKChieXRlc1tpXSA+Pj4gNCkudG9TdHJpbmcoMTYpKTtcbiAgICAgICAgaGV4LnB1c2goKGJ5dGVzW2ldICYgMHhGKS50b1N0cmluZygxNikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhleC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGhleCBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgaGV4VG9CeXRlczogZnVuY3Rpb24oaGV4KSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBjID0gMDsgYyA8IGhleC5sZW5ndGg7IGMgKz0gMilcbiAgICAgICAgYnl0ZXMucHVzaChwYXJzZUludChoZXguc3Vic3RyKGMsIDIpLCAxNikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIGJhc2UtNjQgc3RyaW5nXG4gICAgYnl0ZXNUb0Jhc2U2NDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGJhc2U2NCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIHZhciB0cmlwbGV0ID0gKGJ5dGVzW2ldIDw8IDE2KSB8IChieXRlc1tpICsgMV0gPDwgOCkgfCBieXRlc1tpICsgMl07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgNDsgaisrKVxuICAgICAgICAgIGlmIChpICogOCArIGogKiA2IDw9IGJ5dGVzLmxlbmd0aCAqIDgpXG4gICAgICAgICAgICBiYXNlNjQucHVzaChiYXNlNjRtYXAuY2hhckF0KCh0cmlwbGV0ID4+PiA2ICogKDMgLSBqKSkgJiAweDNGKSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYmFzZTY0LnB1c2goJz0nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlNjQuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBiYXNlLTY0IHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBiYXNlNjRUb0J5dGVzOiBmdW5jdGlvbihiYXNlNjQpIHtcbiAgICAgIC8vIFJlbW92ZSBub24tYmFzZS02NCBjaGFyYWN0ZXJzXG4gICAgICBiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvW15BLVowLTkrXFwvXS9pZywgJycpO1xuXG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMCwgaW1vZDQgPSAwOyBpIDwgYmFzZTY0Lmxlbmd0aDtcbiAgICAgICAgICBpbW9kNCA9ICsraSAlIDQpIHtcbiAgICAgICAgaWYgKGltb2Q0ID09IDApIGNvbnRpbnVlO1xuICAgICAgICBieXRlcy5wdXNoKCgoYmFzZTY0bWFwLmluZGV4T2YoYmFzZTY0LmNoYXJBdChpIC0gMSkpXG4gICAgICAgICAgICAmIChNYXRoLnBvdygyLCAtMiAqIGltb2Q0ICsgOCkgLSAxKSkgPDwgKGltb2Q0ICogMikpXG4gICAgICAgICAgICB8IChiYXNlNjRtYXAuaW5kZXhPZihiYXNlNjQuY2hhckF0KGkpKSA+Pj4gKDYgLSBpbW9kNCAqIDIpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gY3J5cHQ7XG59KSgpO1xuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG4vLyBUaGUgX2lzQnVmZmVyIGNoZWNrIGlzIGZvciBTYWZhcmkgNS03IHN1cHBvcnQsIGJlY2F1c2UgaXQncyBtaXNzaW5nXG4vLyBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yLiBSZW1vdmUgdGhpcyBldmVudHVhbGx5XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPSBudWxsICYmIChpc0J1ZmZlcihvYmopIHx8IGlzU2xvd0J1ZmZlcihvYmopIHx8ICEhb2JqLl9pc0J1ZmZlcilcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKG9iaikge1xuICByZXR1cm4gISFvYmouY29uc3RydWN0b3IgJiYgdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIob2JqKVxufVxuXG4vLyBGb3IgTm9kZSB2MC4xMCBzdXBwb3J0LiBSZW1vdmUgdGhpcyBldmVudHVhbGx5LlxuZnVuY3Rpb24gaXNTbG93QnVmZmVyIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmoucmVhZEZsb2F0TEUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5zbGljZSA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0J1ZmZlcihvYmouc2xpY2UoMCwgMCkpXG59XG4iLCIoZnVuY3Rpb24oKXtcclxuICB2YXIgY3J5cHQgPSByZXF1aXJlKCdjcnlwdCcpLFxyXG4gICAgICB1dGY4ID0gcmVxdWlyZSgnY2hhcmVuYycpLnV0ZjgsXHJcbiAgICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnaXMtYnVmZmVyJyksXHJcbiAgICAgIGJpbiA9IHJlcXVpcmUoJ2NoYXJlbmMnKS5iaW4sXHJcblxyXG4gIC8vIFRoZSBjb3JlXHJcbiAgbWQ1ID0gZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcclxuICAgIC8vIENvbnZlcnQgdG8gYnl0ZSBhcnJheVxyXG4gICAgaWYgKG1lc3NhZ2UuY29uc3RydWN0b3IgPT0gU3RyaW5nKVxyXG4gICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVuY29kaW5nID09PSAnYmluYXJ5JylcclxuICAgICAgICBtZXNzYWdlID0gYmluLnN0cmluZ1RvQnl0ZXMobWVzc2FnZSk7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBtZXNzYWdlID0gdXRmOC5zdHJpbmdUb0J5dGVzKG1lc3NhZ2UpO1xyXG4gICAgZWxzZSBpZiAoaXNCdWZmZXIobWVzc2FnZSkpXHJcbiAgICAgIG1lc3NhZ2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChtZXNzYWdlLCAwKTtcclxuICAgIGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpICYmIG1lc3NhZ2UuY29uc3RydWN0b3IgIT09IFVpbnQ4QXJyYXkpXHJcbiAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnRvU3RyaW5nKCk7XHJcbiAgICAvLyBlbHNlLCBhc3N1bWUgYnl0ZSBhcnJheSBhbHJlYWR5XHJcblxyXG4gICAgdmFyIG0gPSBjcnlwdC5ieXRlc1RvV29yZHMobWVzc2FnZSksXHJcbiAgICAgICAgbCA9IG1lc3NhZ2UubGVuZ3RoICogOCxcclxuICAgICAgICBhID0gIDE3MzI1ODQxOTMsXHJcbiAgICAgICAgYiA9IC0yNzE3MzM4NzksXHJcbiAgICAgICAgYyA9IC0xNzMyNTg0MTk0LFxyXG4gICAgICAgIGQgPSAgMjcxNzMzODc4O1xyXG5cclxuICAgIC8vIFN3YXAgZW5kaWFuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbVtpXSA9ICgobVtpXSA8PCAgOCkgfCAobVtpXSA+Pj4gMjQpKSAmIDB4MDBGRjAwRkYgfFxyXG4gICAgICAgICAgICAgKChtW2ldIDw8IDI0KSB8IChtW2ldID4+PiAgOCkpICYgMHhGRjAwRkYwMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYWRkaW5nXHJcbiAgICBtW2wgPj4+IDVdIHw9IDB4ODAgPDwgKGwgJSAzMik7XHJcbiAgICBtWygoKGwgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gbDtcclxuXHJcbiAgICAvLyBNZXRob2Qgc2hvcnRjdXRzXHJcbiAgICB2YXIgRkYgPSBtZDUuX2ZmLFxyXG4gICAgICAgIEdHID0gbWQ1Ll9nZyxcclxuICAgICAgICBISCA9IG1kNS5faGgsXHJcbiAgICAgICAgSUkgPSBtZDUuX2lpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkgKz0gMTYpIHtcclxuXHJcbiAgICAgIHZhciBhYSA9IGEsXHJcbiAgICAgICAgICBiYiA9IGIsXHJcbiAgICAgICAgICBjYyA9IGMsXHJcbiAgICAgICAgICBkZCA9IGQ7XHJcblxyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKyAwXSwgIDcsIC02ODA4NzY5MzYpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyAxXSwgMTIsIC0zODk1NjQ1ODYpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKyAyXSwgMTcsICA2MDYxMDU4MTkpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKyAzXSwgMjIsIC0xMDQ0NTI1MzMwKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsgNF0sICA3LCAtMTc2NDE4ODk3KTtcclxuICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIG1baSsgNV0sIDEyLCAgMTIwMDA4MDQyNik7XHJcbiAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBtW2krIDZdLCAxNywgLTE0NzMyMzEzNDEpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKyA3XSwgMjIsIC00NTcwNTk4Myk7XHJcbiAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBtW2krIDhdLCAgNywgIDE3NzAwMzU0MTYpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsxMF0sIDE3LCAtNDIwNjMpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKzExXSwgMjIsIC0xOTkwNDA0MTYyKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsxMl0sICA3LCAgMTgwNDYwMzY4Mik7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krMTNdLCAxMiwgLTQwMzQxMTAxKTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krMTVdLCAyMiwgIDEyMzY1MzUzMjkpO1xyXG5cclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgMV0sICA1LCAtMTY1Nzk2NTEwKTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsgNl0sICA5LCAtMTA2OTUwMTYzMik7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krMTFdLCAxNCwgIDY0MzcxNzcxMyk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krIDBdLCAyMCwgLTM3Mzg5NzMwMik7XHJcbiAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBtW2krIDVdLCAgNSwgLTcwMTU1ODY5MSk7XHJcbiAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBtW2krMTBdLCAgOSwgIDM4MDE2MDgzKTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsxNV0sIDE0LCAtNjYwNDc4MzM1KTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsgNF0sIDIwLCAtNDA1NTM3ODQ4KTtcclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgOV0sICA1LCAgNTY4NDQ2NDM4KTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsxNF0sICA5LCAtMTAxOTgwMzY5MCk7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krIDNdLCAxNCwgLTE4NzM2Mzk2MSk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krIDhdLCAyMCwgIDExNjM1MzE1MDEpO1xyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKzEzXSwgIDUsIC0xNDQ0NjgxNDY3KTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsgMl0sICA5LCAtNTE0MDM3ODQpO1xyXG4gICAgICBjID0gR0coYywgZCwgYSwgYiwgbVtpKyA3XSwgMTQsICAxNzM1MzI4NDczKTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsxMl0sIDIwLCAtMTkyNjYwNzczNCk7XHJcblxyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyA1XSwgIDQsIC0zNzg1NTgpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKyA4XSwgMTEsIC0yMDIyNTc0NDYzKTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsxMV0sIDE2LCAgMTgzOTAzMDU2Mik7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krMTRdLCAyMywgLTM1MzA5NTU2KTtcclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsgMV0sICA0LCAtMTUzMDk5MjA2MCk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krIDRdLCAxMSwgIDEyNzI4OTMzNTMpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKzEwXSwgMjMsIC0xMDk0NzMwNjQwKTtcclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsxM10sICA0LCAgNjgxMjc5MTc0KTtcclxuICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIG1baSsgMF0sIDExLCAtMzU4NTM3MjIyKTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsgM10sIDE2LCAtNzIyNTIxOTc5KTtcclxuICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIG1baSsgNl0sIDIzLCAgNzYwMjkxODkpO1xyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyA5XSwgIDQsIC02NDAzNjQ0ODcpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKzEyXSwgMTEsIC00MjE4MTU4MzUpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKzE1XSwgMTYsICA1MzA3NDI1MjApO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKyAyXSwgMjMsIC05OTUzMzg2NTEpO1xyXG5cclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsgMF0sICA2LCAtMTk4NjMwODQ0KTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsgN10sIDEwLCAgMTEyNjg5MTQxNSk7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krMTRdLCAxNSwgLTE0MTYzNTQ5MDUpO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKyA1XSwgMjEsIC01NzQzNDA1NSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krMTJdLCAgNiwgIDE3MDA0ODU1NzEpO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcclxuICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIG1baSsxMF0sIDE1LCAtMTA1MTUyMyk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krIDFdLCAyMSwgLTIwNTQ5MjI3OTkpO1xyXG4gICAgICBhID0gSUkoYSwgYiwgYywgZCwgbVtpKyA4XSwgIDYsICAxODczMzEzMzU5KTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsxNV0sIDEwLCAtMzA2MTE3NDQpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcclxuICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIG1baSsxM10sIDIxLCAgMTMwOTE1MTY0OSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krIDRdLCAgNiwgLTE0NTUyMzA3MCk7XHJcbiAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBtW2krMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKyAyXSwgMTUsICA3MTg3ODcyNTkpO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKyA5XSwgMjEsIC0zNDM0ODU1NTEpO1xyXG5cclxuICAgICAgYSA9IChhICsgYWEpID4+PiAwO1xyXG4gICAgICBiID0gKGIgKyBiYikgPj4+IDA7XHJcbiAgICAgIGMgPSAoYyArIGNjKSA+Pj4gMDtcclxuICAgICAgZCA9IChkICsgZGQpID4+PiAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjcnlwdC5lbmRpYW4oW2EsIGIsIGMsIGRdKTtcclxuICB9O1xyXG5cclxuICAvLyBBdXhpbGlhcnkgZnVuY3Rpb25zXHJcbiAgbWQ1Ll9mZiAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgJiBjIHwgfmIgJiBkKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9nZyAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgJiBkIHwgYyAmIH5kKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9oaCAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgXiBjIF4gZCkgKyAoeCA+Pj4gMCkgKyB0O1xyXG4gICAgcmV0dXJuICgobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSkpICsgYjtcclxuICB9O1xyXG4gIG1kNS5faWkgID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcclxuICAgIHZhciBuID0gYSArIChjIF4gKGIgfCB+ZCkpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuXHJcbiAgLy8gUGFja2FnZSBwcml2YXRlIGJsb2Nrc2l6ZVxyXG4gIG1kNS5fYmxvY2tzaXplID0gMTY7XHJcbiAgbWQ1Ll9kaWdlc3RzaXplID0gMTY7XHJcblxyXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcclxuICAgIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQgfHwgbWVzc2FnZSA9PT0gbnVsbClcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIGFyZ3VtZW50ICcgKyBtZXNzYWdlKTtcclxuXHJcbiAgICB2YXIgZGlnZXN0Ynl0ZXMgPSBjcnlwdC53b3Jkc1RvQnl0ZXMobWQ1KG1lc3NhZ2UsIG9wdGlvbnMpKTtcclxuICAgIHJldHVybiBvcHRpb25zICYmIG9wdGlvbnMuYXNCeXRlcyA/IGRpZ2VzdGJ5dGVzIDpcclxuICAgICAgICBvcHRpb25zICYmIG9wdGlvbnMuYXNTdHJpbmcgPyBiaW4uYnl0ZXNUb1N0cmluZyhkaWdlc3RieXRlcykgOlxyXG4gICAgICAgIGNyeXB0LmJ5dGVzVG9IZXgoZGlnZXN0Ynl0ZXMpO1xyXG4gIH07XHJcblxyXG59KSgpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBsaWJyYXJ5IGZvciBjcmVhdGluZyBhdXRoIGRhdGFcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY2hlY2tBdXRoID0gZXhwb3J0cy5lYXN5QXV0aCA9IHZvaWQgMDtcbnZhciBtZDUgPSByZXF1aXJlKFwibWQ1XCIpO1xuLy8gY3JlYXRlIHRoZSBhbmNob3IgaGlkZGVpbmcgZGVmYXVsdCBkYXRhXG52YXIgY3JlYXRvciA9IGZ1bmN0aW9uIChhbmNob3IsIGNrLCBpc05ldykge1xufTtcbmV4cG9ydHMuZWFzeUF1dGggPSBjcmVhdG9yO1xuLy8gY2hlY2sgYW5jaG9yIHRvIGdldCBhdXRoIGxpc3QuIFxudmFyIGNoZWNrID0gZnVuY3Rpb24gKGFuY2hvciwgcHJvdG9jb2wsIGNrKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIFwibGlzdFwiOiBudWxsLFxuICAgICAgICBcImFuY2hvclwiOiBudWxsLCAvL3RhcmdldCBhbmNob3IgdG8gZ2V0IHJlc3VsdFxuICAgIH07XG4gICAgLy9UT0RPLCBhdXRvIE1ENSBhbmNob3IgZnVuY3Rpb24gaXMgbm90IHRlc3RlZCB5ZXQuXG4gICAgaWYgKHByb3RvY29sLmF1dGgpIHtcbiAgICAgICAgLy8xLmNoZWNrIHdldGhlciB0YXJnZXQgYW5jaG9yIFxuICAgICAgICBpZiAodHlwZW9mIHByb3RvY29sLmF1dGggPT09IFwic3RyaW5nXCIgfHwgQXJyYXkuaXNBcnJheShwcm90b2NvbC5hdXRoKSkge1xuICAgICAgICAgICAgZGF0YS5hbmNob3IgPSBwcm90b2NvbC5hdXRoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YS5saXN0ID0gcHJvdG9jb2wuYXV0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8yLmNoZWNrIGRlZmF1bHQgYW5jaG9yXG4gICAgICAgIGlmIChwcm90b2NvbC5zYWx0KSB7XG4gICAgICAgICAgICBkYXRhLmFuY2hvciA9IG1kNShhbmNob3IgKyBwcm90b2NvbC5zYWx0WzBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2sgJiYgY2soZGF0YSk7XG59O1xuZXhwb3J0cy5jaGVja0F1dGggPSBjaGVjaztcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8haW1wb3J0YW50IFRoaXMgaXMgdGhlIGxpYnJhcnkgZm9yIGRlY29kaW5nIGFuY2hvciBsaW5rXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmxpbmtEZWNvZGVyID0gZXhwb3J0cy5saW5rQ3JlYXRvciA9IHZvaWQgMDtcbnZhciBzZXR0aW5nID0ge1xuICAgIFwiY2hlY2tcIjogZmFsc2UsXG4gICAgXCJ1dGY4XCI6IHRydWUsXG4gICAgXCJwcmVcIjogXCJhbmNob3I6Ly9cIiwgLy9wcm90b2NvbCBwcmVmaXhcbn07XG52YXIgc2VsZiA9IHtcbiAgICBnZXRQYXJhbXM6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICB2YXIgYXJyID0gc3RyLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3cgPSBhcnJbaV07XG4gICAgICAgICAgICB2YXIga3YgPSByb3cuc3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgaWYgKGt2Lmxlbmd0aCAhPT0gMilcbiAgICAgICAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJlcnJvciBwYXJhbWV0ZXJcIiB9O1xuICAgICAgICAgICAgbWFwW2t2WzBdXSA9IGt2WzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfSxcbiAgICBjb21iaW5lUGFyYW1zOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGlmICghb2JqKVxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBsaXN0LnB1c2goXCJcIi5jb25jYXQoaywgXCI9XCIpLmNvbmNhdChvYmpba10pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIHJldHVybiBsaXN0LmpvaW4oXCImXCIpO1xuICAgIH0sXG59O1xudmFyIGNyZWF0b3IgPSBmdW5jdGlvbiAobG9jYWwsIHBhcmFtcykge1xuICAgIHZhciBzdHIgPSBzZWxmLmNvbWJpbmVQYXJhbXMocGFyYW1zKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShsb2NhbCkpIHtcbiAgICAgICAgaWYgKGxvY2FsWzFdICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQoc2V0dGluZy5wcmUpLmNvbmNhdChsb2NhbFswXSwgXCIvXCIpLmNvbmNhdChsb2NhbFsxXSkuY29uY2F0KCFzdHIgPyBzdHIgOiBcIj9cIiArIHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQoc2V0dGluZy5wcmUpLmNvbmNhdChsb2NhbFswXSkuY29uY2F0KCFzdHIgPyBzdHIgOiBcIj9cIiArIHN0cik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChzZXR0aW5nLnByZSkuY29uY2F0KGxvY2FsKS5jb25jYXQoIXN0ciA/IHN0ciA6IFwiP1wiICsgc3RyKTtcbiAgICB9XG59O1xuZXhwb3J0cy5saW5rQ3JlYXRvciA9IGNyZWF0b3I7XG52YXIgZGVjb2RlciA9IGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgdmFyIHJlcyA9IHtcbiAgICAgICAgbG9jYXRpb246IFtcIlwiLCAwXSxcbiAgICB9O1xuICAgIHZhciBzdHIgPSBsaW5rLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgdmFyIHByZSA9IHNldHRpbmcucHJlO1xuICAgIC8vMC4gZm9ybWF0IGNoZWNrXG4gICAgaWYgKHN0ci5sZW5ndGggPD0gcHJlLmxlbmd0aCArIDEpXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcImludmFsaWQgc3RyaW5nXCIgfTtcbiAgICB2YXIgaGVhZCA9IHN0ci5zdWJzdHJpbmcoMCwgcHJlLmxlbmd0aCk7XG4gICAgaWYgKGhlYWQgIT09IHByZSlcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiaW52YWxpZCBwcm90b2NvbFwiIH07XG4gICAgLy8xLiByZW1vdmUgcHJlZml4IGBhbmNob3I6Ly9gXG4gICAgdmFyIGJvZHkgPSBzdHIuc3Vic3RyaW5nKHByZS5sZW5ndGgsIHN0ci5sZW5ndGgpO1xuICAgIC8vMi4gY2hlY2sgcGFyYW1ldGVyXG4gICAgdmFyIGFyciA9IGJvZHkuc3BsaXQoXCI/XCIpO1xuICAgIGlmIChhcnIubGVuZ3RoID4gMilcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiZXJyb3IgcmVxdWVzdCwgcGxlYXNlIGNoZWNrIGFuY2hvciBuYW1lXCIgfTtcbiAgICB2YXIgaXNQYXJhbSA9IGFyci5sZW5ndGggPT09IDEgPyBmYWxzZSA6IHRydWU7XG4gICAgaWYgKGlzUGFyYW0pIHtcbiAgICAgICAgdmFyIHBzID0gc2VsZi5nZXRQYXJhbXMoYXJyWzFdKTtcbiAgICAgICAgaWYgKHBzLmVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gcHM7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnBhcmFtID0gc2VsZi5nZXRQYXJhbXMoYXJyWzFdKTtcbiAgICB9XG4gICAgYm9keSA9IGFyclswXTtcbiAgICAvLzMuIGRlY29kZSBhbmNob3IgbG9jYXRpb25cbiAgICB2YXIgbHMgPSBib2R5LnNwbGl0KFwiL1wiKTtcbiAgICB2YXIgbGFzdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGxzW2ldICE9PSAnJylcbiAgICAgICAgICAgIGxhc3QucHVzaChsc1tpXSk7XG4gICAgfVxuICAgIC8vNC4gZXhwb3J0IHJlc3VsdFxuICAgIGlmIChsYXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXMubG9jYXRpb25bMF0gPSBsYXN0WzBdO1xuICAgICAgICByZXMubG9jYXRpb25bMV0gPSAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGVsZSA9IGxhc3QucG9wKCk7XG4gICAgICAgIHZhciBibG9jayA9IHBhcnNlSW50KGVsZSk7XG4gICAgICAgIGlmIChpc05hTihibG9jaykpXG4gICAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJibG9jayBudW1iZXIgZXJyb3JcIiB9O1xuICAgICAgICByZXMubG9jYXRpb25bMV0gPSBibG9jaztcbiAgICAgICAgcmVzLmxvY2F0aW9uWzBdID0gbGFzdC5qb2luKCcvJyk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuZXhwb3J0cy5saW5rRGVjb2RlciA9IGRlY29kZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY2hlY2tIaWRlID0gZXhwb3J0cy5lYXN5SGlkZSA9IHZvaWQgMDtcbnZhciBtZDUgPSByZXF1aXJlKFwibWQ1XCIpO1xudmFyIGNyZWF0b3IgPSBmdW5jdGlvbiAoYW5jaG9yKSB7XG59O1xuZXhwb3J0cy5lYXN5SGlkZSA9IGNyZWF0b3I7XG4vLyBjaGVjayBhbmNob3IgdG8gZ2V0IGhpZGUgbGlzdFxudmFyIGNoZWNrID0gZnVuY3Rpb24gKGFuY2hvciwgcHJvdG9jb2wsIGNrKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIFwibGlzdFwiOiBudWxsLFxuICAgICAgICBcImFuY2hvclwiOiBudWxsLCAvL3RhcmdldCBhbmNob3IgdG8gZ2V0IHJlc3VsdFxuICAgIH07XG4gICAgLy9UT0RPLCBhdXRvIE1ENSBhbmNob3IgZnVuY3Rpb24gaXMgbm90IHRlc3RlZCB5ZXQuXG4gICAgaWYgKHByb3RvY29sLmhpZGUpIHtcbiAgICAgICAgLy8xLmNoZWNrIHdldGhlciB0YXJnZXQgYW5jaG9yIFxuICAgICAgICBpZiAodHlwZW9mIHByb3RvY29sLmhpZGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGRhdGEuYW5jaG9yID0gcHJvdG9jb2wuaGlkZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sLmhpZGUpKSB7XG4gICAgICAgICAgICBkYXRhLmxpc3QgPSBwcm90b2NvbC5oaWRlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy9kYXRhLmxpc3Q9cHJvdG9jb2wuaGlkZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8yLmNoZWNrIGRlZmF1bHQgYW5jaG9yXG4gICAgICAgIGlmIChwcm90b2NvbC5zYWx0KSB7XG4gICAgICAgICAgICBkYXRhLmFuY2hvciA9IG1kNShhbmNob3IgKyBwcm90b2NvbC5zYWx0WzFdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2sgJiYgY2soZGF0YSk7XG59O1xuZXhwb3J0cy5jaGVja0hpZGUgPSBjaGVjaztcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8haW1wb3J0YW50IFRoaXMgaXMgdGhlIFR5cGVzY3JpcHQgaW1wbGVtZW50IG9mIEVzYXkgUHJvdG9jb2wgdmVyc2lvbiAxLjAuXG4vLyFpbXBvcnRhbnQgRWFzeSBQcm90b2NvbCBpcyBhIHNpbXBsZSBwcm90b2NvbCB0byBsYXVuY2ggY0FwcCB2aWEgQW5jaG9yIG5ldHdvcmsuXG4vLyFpbXBvcnRhbnQgQWxsIGZ1bmN0aW9ucyBpbXBsZW1lbnQsIGJ1dCB0aGlzIGltcGxlbWVudCBvbmx5IHN1cHBvcnQgSlMgd2l0aCBDU1MgYXBwbGljYXRpb24gXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnJlbGF0ZWRJbmRleCA9IGV4cG9ydHMua2V5c0FwcCA9IGV4cG9ydHMuY29kZVR5cGUgPSBleHBvcnRzLmZvcm1hdFR5cGUgPSBleHBvcnRzLnJhd1R5cGUgPSBleHBvcnRzLmVycm9yTGV2ZWwgPSB2b2lkIDA7XG52YXIgZXJyb3JMZXZlbDtcbihmdW5jdGlvbiAoZXJyb3JMZXZlbCkge1xuICAgIGVycm9yTGV2ZWxbXCJFUlJPUlwiXSA9IFwiZXJyb3JcIjtcbiAgICBlcnJvckxldmVsW1wiV0FSTlwiXSA9IFwid2FybmluZ1wiO1xuICAgIGVycm9yTGV2ZWxbXCJVTkVYQ0VQVFwiXSA9IFwidW5leGNlcHRcIjtcbn0pKGVycm9yTGV2ZWwgPSBleHBvcnRzLmVycm9yTGV2ZWwgfHwgKGV4cG9ydHMuZXJyb3JMZXZlbCA9IHt9KSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqKioqKipmb3JtYXQgcGFydCoqKioqKioqKiovXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG52YXIgcmF3VHlwZTtcbihmdW5jdGlvbiAocmF3VHlwZSkge1xuICAgIHJhd1R5cGVbXCJEQVRBXCJdID0gXCJkYXRhXCI7XG4gICAgcmF3VHlwZVtcIkFQUFwiXSA9IFwiYXBwXCI7XG4gICAgcmF3VHlwZVtcIkxJQlwiXSA9IFwibGliXCI7XG4gICAgcmF3VHlwZVtcIk5PTkVcIl0gPSBcInVua25vd1wiO1xufSkocmF3VHlwZSA9IGV4cG9ydHMucmF3VHlwZSB8fCAoZXhwb3J0cy5yYXdUeXBlID0ge30pKTtcbnZhciBmb3JtYXRUeXBlO1xuKGZ1bmN0aW9uIChmb3JtYXRUeXBlKSB7XG4gICAgZm9ybWF0VHlwZVtcIkpBVkFTQ1JJUFRcIl0gPSBcImpzXCI7XG4gICAgZm9ybWF0VHlwZVtcIkNTU1wiXSA9IFwiY3NzXCI7XG4gICAgZm9ybWF0VHlwZVtcIk1BUktET1dOXCJdID0gXCJtZFwiO1xuICAgIGZvcm1hdFR5cGVbXCJKU09OXCJdID0gXCJqc29uXCI7XG4gICAgZm9ybWF0VHlwZVtcIk1JWFwiXSA9IFwibWl4XCI7XG4gICAgZm9ybWF0VHlwZVtcIk5PTkVcIl0gPSBcIlwiO1xufSkoZm9ybWF0VHlwZSA9IGV4cG9ydHMuZm9ybWF0VHlwZSB8fCAoZXhwb3J0cy5mb3JtYXRUeXBlID0ge30pKTtcbnZhciBjb2RlVHlwZTtcbihmdW5jdGlvbiAoY29kZVR5cGUpIHtcbiAgICBjb2RlVHlwZVtcIkFTQ0lJXCJdID0gXCJhc2NpaVwiO1xuICAgIGNvZGVUeXBlW1wiVVRGOFwiXSA9IFwidXRmOFwiO1xuICAgIGNvZGVUeXBlW1wiSEVYXCJdID0gXCJoZXhcIjtcbiAgICBjb2RlVHlwZVtcIk5PTkVcIl0gPSBcIlwiO1xufSkoY29kZVR5cGUgPSBleHBvcnRzLmNvZGVUeXBlIHx8IChleHBvcnRzLmNvZGVUeXBlID0ge30pKTtcbnZhciBrZXlzQXBwO1xuKGZ1bmN0aW9uIChrZXlzQXBwKSB7XG59KShrZXlzQXBwID0gZXhwb3J0cy5rZXlzQXBwIHx8IChleHBvcnRzLmtleXNBcHAgPSB7fSkpO1xudmFyIHJlbGF0ZWRJbmRleDtcbihmdW5jdGlvbiAocmVsYXRlZEluZGV4KSB7XG4gICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIkFVVEhcIl0gPSAwXSA9IFwiQVVUSFwiO1xuICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJISURFXCJdID0gMV0gPSBcIkhJREVcIjtcbiAgICByZWxhdGVkSW5kZXhbcmVsYXRlZEluZGV4W1wiVFJVU1RcIl0gPSAyXSA9IFwiVFJVU1RcIjtcbiAgICByZWxhdGVkSW5kZXhbcmVsYXRlZEluZGV4W1wiTkFNRVwiXSA9IDBdID0gXCJOQU1FXCI7XG4gICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIkJMT0NLXCJdID0gMV0gPSBcIkJMT0NLXCI7XG59KShyZWxhdGVkSW5kZXggPSBleHBvcnRzLnJlbGF0ZWRJbmRleCB8fCAoZXhwb3J0cy5yZWxhdGVkSW5kZXggPSB7fSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLy8haW1wb3J0YW50IFRoaXMgaXMgdGhlIGxpYnJhcnkgZm9yIEVzYXkgUHJvdG9jb2wgdjEuMFxuLy8haW1wb3J0YW50IEFsbCBkYXRhIGNvbWUgZnJvbSBgQW5jaG9yIExpbmtgXG4vLyFpbXBvcnRhbnQgVGhpcyBpbXBsZW1lbnQgZXh0ZW5kIGBhdXRoYCBhbmQgYGhpZGVgIGJ5IHNhbHQgd2F5IHRvIGxvYWQgZGF0YVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5lYXN5UnVuID0gdm9pZCAwO1xudmFyIHByb3RvY29sXzEgPSByZXF1aXJlKFwiLi9wcm90b2NvbFwiKTtcbnZhciBwcm90b2NvbF8yID0gcmVxdWlyZShcIi4vcHJvdG9jb2xcIik7XG52YXIgZGVjb2Rlcl8xID0gcmVxdWlyZShcIi4vZGVjb2RlclwiKTtcbnZhciBhdXRoXzEgPSByZXF1aXJlKFwiLi9hdXRoXCIpO1xudmFyIGhpZGVfMSA9IHJlcXVpcmUoXCIuL2hpZGVcIik7XG52YXIgX2EgPSByZXF1aXJlKFwiLi4vbGliL2xvYWRlclwiKSwgTG9hZGVyID0gX2EuTG9hZGVyLCBMaWJzID0gX2EuTGlicztcbi8vY29uc3Qge2FuY2hvckpTfSA9cmVxdWlyZShcIi4uL2xpYi9hbmNob3JcIik7XG52YXIgQVBJID0gbnVsbDtcbi8vZGVidWcgZGF0YSB0byBpbXByb3ZlIHRoZSBkZXZlbG9wbWVudFxudmFyIGRlYnVnID0ge1xuICAgIGRpc2FibGU6IGZhbHNlLFxuICAgIGNhY2hlOiBmYWxzZSxcbiAgICBzZWFyY2g6IFtdLFxuICAgIHN0YXJ0OiAwLFxuICAgIGVuZDogMCxcbiAgICBzdGFtcDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfSxcbn07XG4vL2FuY2hvciBjYWNoZSB0byBhdm9pZCBkdXBsaWNhdGUgcmVxdWVzdC5cbnZhciBjYWNoZSA9IHtcbiAgICBkYXRhOiB7fSxcbiAgICBzZXQ6IGZ1bmN0aW9uIChrLCBiLCB2KSB7XG4gICAgICAgIGNhY2hlLmRhdGFbXCJcIi5jb25jYXQoaywgXCJfXCIpLmNvbmNhdChiKV0gPSB2O1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24gKGssIGIpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlLmRhdGFbXCJcIi5jb25jYXQoaywgXCJfXCIpLmNvbmNhdChiKV07XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWNoZS5kYXRhID0ge307XG4gICAgfSxcbn07XG4vL2JlZm9yZTogNTAwfjcwMG1zXG52YXIgc2VsZiA9IHtcbiAgICBnZXRBbmNob3I6IGZ1bmN0aW9uIChsb2NhdGlvbiwgY2spIHtcbiAgICAgICAgaWYgKEFQSSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIGFuY2hvciA9IGxvY2F0aW9uWzBdLCBibG9jayA9IGxvY2F0aW9uWzFdO1xuICAgICAgICAvL2RlYnVnIGhvb2tcbiAgICAgICAgaWYgKCFkZWJ1Zy5jYWNoZSkge1xuICAgICAgICAgICAgdmFyIGNEYXRhID0gY2FjaGUuZ2V0KGFuY2hvciwgYmxvY2spO1xuICAgICAgICAgICAgaWYgKGNEYXRhICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKGBDaGVja2luZyA6ICR7SlNPTi5zdHJpbmdpZnkobG9jYXRpb24pfSB2aWEgJHthZGRyZXNzfWApO1xuICAgICAgICBpZiAoYmxvY2sgIT09IDApIHtcbiAgICAgICAgICAgIEFQSS5jb21tb24udGFyZ2V0KGFuY2hvciwgYmxvY2ssIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkZWJ1Zy5jYWNoZSlcbiAgICAgICAgICAgICAgICAgICAgY2FjaGUuc2V0KGFuY2hvciwgYmxvY2ssIGRhdGEpOyAvL2RlYnVnIGhvb2tcbiAgICAgICAgICAgICAgICBzZWxmLmZpbHRlckFuY2hvcihkYXRhLCBjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEFQSS5jb21tb24ubGF0ZXN0KGFuY2hvciwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRlYnVnLmNhY2hlKVxuICAgICAgICAgICAgICAgICAgICBjYWNoZS5zZXQoYW5jaG9yLCBibG9jaywgZGF0YSk7IC8vZGVidWcgaG9va1xuICAgICAgICAgICAgICAgIHNlbGYuZmlsdGVyQW5jaG9yKGRhdGEsIGNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBmaWx0ZXJBbmNob3I6IGZ1bmN0aW9uIChkYXRhLCBjaykge1xuICAgICAgICBpZiAoIWRhdGEpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBzdWNoIGFuY2hvci5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIGVyciA9IGRhdGE7XG4gICAgICAgIGlmIChlcnIuZXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogZXJyLmVycm9yLCBsZXZlbDogcHJvdG9jb2xfMS5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICB2YXIgYW5jaG9yID0gZGF0YTtcbiAgICAgICAgaWYgKCFkZWJ1Zy5kaXNhYmxlKVxuICAgICAgICAgICAgZGVidWcuc2VhcmNoLnB1c2goW2FuY2hvci5uYW1lLCBhbmNob3IuYmxvY2tdKTsgLy9kZWJ1ZyBob29rIFxuICAgICAgICBpZiAoYW5jaG9yLmVtcHR5KVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiRW1wdHkgYW5jaG9yLlwiLCBsZXZlbDogcHJvdG9jb2xfMS5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICBpZiAoIWFuY2hvci5wcm90b2NvbClcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIk5vLXByb3RvY29sIGFuY2hvci5cIiB9KTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gYW5jaG9yLnByb3RvY29sO1xuICAgICAgICBpZiAoIXByb3RvY29sLnR5cGUpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJOb3QgRWFzeVByb3RvY29sIGFuY2hvci5cIiB9KTtcbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKGFuY2hvcik7XG4gICAgfSxcbiAgICBkZWNvZGVEYXRhOiBmdW5jdGlvbiAoY09iamVjdCwgY2spIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgRGVjb2RlIGRhdGEgYW5jaG9yYCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coY09iamVjdCk7XG4gICAgICAgIGNPYmplY3QudHlwZSA9IHByb3RvY29sXzEucmF3VHlwZS5EQVRBO1xuICAgICAgICB2YXIgZGF0YSA9IGNPYmplY3QuZGF0YVtcIlwiLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzBdLCBcIl9cIikuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMV0pXTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gZGF0YS5wcm90b2NvbDtcbiAgICAgICAgaWYgKHByb3RvY29sICE9PSBudWxsICYmIHByb3RvY29sLmNhbGwpIHtcbiAgICAgICAgICAgIGNPYmplY3QuY2FsbCA9IHByb3RvY29sLmNhbGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgIH0sXG4gICAgZGVjb2RlQXBwOiBmdW5jdGlvbiAoY09iamVjdCwgY2spIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgRGVjb2RlIGFwcCBhbmNob3JgKTtcbiAgICAgICAgY09iamVjdC50eXBlID0gcHJvdG9jb2xfMS5yYXdUeXBlLkFQUDtcbiAgICAgICAgdmFyIGRhdGEgPSBjT2JqZWN0LmRhdGFbXCJcIi5jb25jYXQoY09iamVjdC5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzFdKV07XG4gICAgICAgIHZhciBwcm90b2NvbCA9IGRhdGEucHJvdG9jb2w7XG4gICAgICAgIGNPYmplY3QuY29kZSA9IGRhdGEucmF3O1xuICAgICAgICBpZiAocHJvdG9jb2wgIT09IG51bGwgJiYgcHJvdG9jb2wubGliKSB7XG4gICAgICAgICAgICAvL0ZJWE1FIGNvZGUgc2hvdWxkIGJlIGRlZmluZWQgY2xlYXJseVxuICAgICAgICAgICAgc2VsZi5nZXRMaWJzKHByb3RvY29sLmxpYiwgZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNvZGUpO1xuICAgICAgICAgICAgICAgIGNPYmplY3QubGlicyA9IGNvZGU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRlY29kZUxpYjogZnVuY3Rpb24gKGNPYmplY3QsIGNrKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coYERlY29kZSBsaWIgYW5jaG9yYCk7XG4gICAgICAgIGNPYmplY3QudHlwZSA9IHByb3RvY29sXzEucmF3VHlwZS5MSUI7XG4gICAgICAgIHZhciBkYXRhID0gY09iamVjdC5kYXRhW1wiXCIuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY09iamVjdC5sb2NhdGlvblsxXSldO1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSBkYXRhLnByb3RvY29sO1xuICAgICAgICAvLzEuY2hlY2sgYW5kIGdldCBsaWJzXG4gICAgICAgIGlmIChwcm90b2NvbCAhPT0gbnVsbCAmJiBwcm90b2NvbC5saWIpIHtcbiAgICAgICAgICAgIHNlbGYuZ2V0TGlicyhwcm90b2NvbC5saWIsIGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjb2RlKTtcbiAgICAgICAgICAgICAgICBjT2JqZWN0LmxpYnMgPSBjb2RlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRMaWJzOiBmdW5jdGlvbiAobGlzdCwgY2spIHtcbiAgICAgICAgaWYgKEFQSSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgUmVhZHkgdG8gZ2V0IGxpYnM6ICR7SlNPTi5zdHJpbmdpZnkobGlzdCl9YCk7XG4gICAgICAgIHZhciBSUEMgPSB7XG4gICAgICAgICAgICBzZWFyY2g6IEFQSS5jb21tb24ubGF0ZXN0LFxuICAgICAgICAgICAgdGFyZ2V0OiBBUEkuY29tbW9uLnRhcmdldCxcbiAgICAgICAgfTtcbiAgICAgICAgTGlicyhsaXN0LCBSUEMsIGNrKTtcbiAgICB9LFxuICAgIGdldEhpc3Rvcnk6IGZ1bmN0aW9uIChsb2NhdGlvbiwgY2spIHtcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgaWYgKEFQSSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IFwiTm8gQVBJIHRvIGdldCBkYXRhLlwiLCBsZXZlbDogcHJvdG9jb2xfMS5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIGVycnMpO1xuICAgICAgICB9XG4gICAgICAgIC8vaWYoQVBJPT09bnVsbCkgcmV0dXJuIGNrICYmIGNrKHtlcnJvcjpcIk5vIEFQSSB0byBnZXQgZGF0YS5cIixsZXZlbDplcnJvckxldmVsLkVSUk9SfSk7XG4gICAgICAgIHZhciBhbmNob3IgPSBsb2NhdGlvblswXSwgYmxvY2sgPSBsb2NhdGlvblsxXTtcbiAgICAgICAgQVBJLmNvbW1vbi5oaXN0b3J5KGFuY2hvciwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgdmFyIGVyciA9IHJlcztcbiAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBlcnJzLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgZXJycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYWxpc3QgPSByZXM7XG4gICAgICAgICAgICBpZiAoYWxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IFwiRW1wdHkgaGlzdG9yeVwiIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0LCBlcnJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhhbGlzdCwgZXJycyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogY29tYmluZSB0aGUgaGlkZSBhbmQgYXV0aCBsaXN0IHRvIHJlc3VsdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAgICAgIGFuY2hvclx0ICAgIC8vYEFuY2hvcmAgbmFtZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSAgICAgIHByb3RvY29sICAgIC8vRWFzeSBQcm90b2NvbFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSAgICAgIGNmZyAgICAgICAgIC8vcmV2ZXJzZWQgY29uZmlnIHBhcmFtZXRlclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259ICAgIGNrICAgICAgICAgIC8vY2FsbGJhY2ssIHdpbGwgcmV0dXJuIHRoZSBtZXJnZSByZXN1bHQsIGluY2x1ZGluZyB0aGUgcmVsYXRlZCBgYW5jaG9yYFxuICAgICAqICovXG4gICAgbWVyZ2U6IGZ1bmN0aW9uIChhbmNob3IsIHByb3RvY29sLCBjZmcsIGNrKSB7XG4gICAgICAgIGlmIChBUEkgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICBcImhpZGVcIjogW10sXG4gICAgICAgICAgICBcImF1dGhcIjogbnVsbCxcbiAgICAgICAgICAgIFwiZXJyb3JcIjogW10sXG4gICAgICAgICAgICBcImluZGV4XCI6IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIFwibWFwXCI6IHt9LFxuICAgICAgICB9O1xuICAgICAgICB2YXIgbWxpc3QgPSBbXTtcbiAgICAgICAgLy8xLiBjaGVjayBgZGVjbGFyZWQgaGlkZGVuYCBhbmQgYGF1dGhvcml0eWAganVzdCBieSBwcm90b2NvbCBkYXRhLlxuICAgICAgICAoMCwgYXV0aF8xLmNoZWNrQXV0aCkoYW5jaG9yLCBwcm90b2NvbCwgZnVuY3Rpb24gKHJlc0F1dGgpIHtcbiAgICAgICAgICAgICgwLCBoaWRlXzEuY2hlY2tIaWRlKShhbmNob3IsIHByb3RvY29sLCBmdW5jdGlvbiAocmVzSGlkZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNBdXRoLmFuY2hvciA9PT0gbnVsbCAmJiByZXNIaWRlLmFuY2hvciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzQXV0aC5saXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmF1dGggPSByZXNBdXRoLmxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNIaWRlLmxpc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaGlkZSA9IHJlc0hpZGUubGlzdDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc0F1dGguYW5jaG9yID09PSBudWxsICYmIHJlc0hpZGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoaWRlX2FuY2hvciA9IHR5cGVvZiByZXNIaWRlLmFuY2hvciA9PT0gXCJzdHJpbmdcIiA/IFtyZXNIaWRlLmFuY2hvciwgMF0gOiBbcmVzSGlkZS5hbmNob3JbMF0sIHJlc0hpZGUuYW5jaG9yWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRBbmNob3IoaGlkZV9hbmNob3IsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogZXJyLmVycm9yIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jb21iaW5lSGlkZShyZXN1bHQsIGRhdGEsIGVycnMsIGNrKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc0F1dGguYW5jaG9yICE9PSBudWxsICYmIHJlc0hpZGUuYW5jaG9yID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdXRoX2FuY2hvciA9IHR5cGVvZiByZXNBdXRoLmFuY2hvciA9PT0gXCJzdHJpbmdcIiA/IFtyZXNBdXRoLmFuY2hvciwgMF0gOiBbcmVzQXV0aC5hbmNob3JbMF0sIHJlc0F1dGguYW5jaG9yWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRIaXN0b3J5KGF1dGhfYW5jaG9yLCBmdW5jdGlvbiAoYWxpc3QsIGVycnNBKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jb21iaW5lQXV0aChyZXN1bHQsIGFsaXN0LCBlcnJzQSwgY2spO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzQXV0aC5hbmNob3IgIT09IG51bGwgJiYgcmVzSGlkZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhpZGVfYW5jaG9yID0gdHlwZW9mIHJlc0hpZGUuYW5jaG9yID09PSBcInN0cmluZ1wiID8gW3Jlc0hpZGUuYW5jaG9yLCAwXSA6IFtyZXNIaWRlLmFuY2hvclswXSwgcmVzSGlkZS5hbmNob3JbMV1dO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXV0aF9hbmNob3JfMSA9IHR5cGVvZiByZXNBdXRoLmFuY2hvciA9PT0gXCJzdHJpbmdcIiA/IFtyZXNBdXRoLmFuY2hvciwgMF0gOiBbcmVzQXV0aC5hbmNob3JbMF0sIHJlc0F1dGguYW5jaG9yWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRBbmNob3IoaGlkZV9hbmNob3IsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogZXJyLmVycm9yIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jb21iaW5lSGlkZShyZXN1bHQsIGRhdGEsIGVycnMsIGZ1bmN0aW9uIChjaFJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0SGlzdG9yeShhdXRoX2FuY2hvcl8xLCBmdW5jdGlvbiAoYWxpc3QsIGVycnNBKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY29tYmluZUF1dGgoY2hSZXN1bHQsIGFsaXN0LCBlcnJzQSwgY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNvbWJpbmVIaWRlOiBmdW5jdGlvbiAocmVzdWx0LCBhbmNob3IsIGVycnMsIGNrKSB7XG4gICAgICAgIGlmIChlcnJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgLy9GSVhNRSBjaGFuZ2UgdG8gc2ltcGxlIHdheSB0byBjb21iaW5lIHRoZSBlcnJvcnMuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVycnMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yLnB1c2goZXJyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0Lm1hcFtcIlwiLmNvbmNhdChhbmNob3IubmFtZSwgXCJfXCIpLmNvbmNhdChhbmNob3IuYmxvY2spXSA9IGFuY2hvcjtcbiAgICAgICAgcmVzdWx0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkhJREVdID0gW2FuY2hvci5uYW1lLCBhbmNob3IuYmxvY2tdO1xuICAgICAgICB2YXIgZGhpZGUgPSBzZWxmLmRlY29kZUhpZGVBbmNob3IoYW5jaG9yKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGRoaWRlKSkge1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yLnB1c2goZGhpZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LmhpZGUgPSBkaGlkZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0KTtcbiAgICB9LFxuICAgIGNvbWJpbmVBdXRoOiBmdW5jdGlvbiAocmVzdWx0LCBsaXN0LCBlcnJzLCBjaykge1xuICAgICAgICBpZiAoZXJycy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJycy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChlcnJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3cgPSBsaXN0W2ldO1xuICAgICAgICAgICAgcmVzdWx0Lm1hcFtcIlwiLmNvbmNhdChyb3cubmFtZSwgXCJfXCIpLmNvbmNhdChyb3cuYmxvY2spXSA9IHJvdztcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGFzdCA9IGxpc3RbMF07XG4gICAgICAgIHZhciBobGlzdCA9IFtdOyAvL2dldCBsYXRlc3QgYXV0aCBhbmNob3IgaGlkZSBsaXN0LlxuICAgICAgICBzZWxmLmRlY29kZUF1dGhBbmNob3IobGlzdCwgaGxpc3QsIGZ1bmN0aW9uIChtYXAsIGFtYXAsIGVycnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gYW1hcClcbiAgICAgICAgICAgICAgICByZXN1bHQubWFwW2tdID0gYW1hcFtrXTsgLy9pZiBoaWRlIGFuY2hvciBkYXRhLCBtZXJnZSB0byByZXN1bHRcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJycy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChlcnJzW2ldKTtcbiAgICAgICAgICAgIHJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5BVVRIXSA9IFtsYXN0Lm5hbWUsIDBdO1xuICAgICAgICAgICAgcmVzdWx0LmF1dGggPSBtYXA7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWNvZGVIaWRlQW5jaG9yOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIHZhciBwcm90b2NvbCA9IG9iai5wcm90b2NvbDtcbiAgICAgICAgaWYgKChwcm90b2NvbCA9PT0gbnVsbCB8fCBwcm90b2NvbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogcHJvdG9jb2wuZm10KSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciByYXcgPSBKU09OLnBhcnNlKG9iai5yYXcpO1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYXcubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuID0gcGFyc2VJbnQocmF3W2ldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4obikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKG4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6ICdmYWlsZWQgdG8gcGFyc2UgSlNPTicgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICB9LFxuICAgIC8vIWltcG9ydGFudCwgYnkgdXNpbmcgdGhlIGhpc3Rvcnkgb2YgYW5jaG9yLCBgaGlkZWAga2V5d29yZCBpcyBzdGlsbCBzdXBwb3J0XG4gICAgLy8haW1wb3J0YW50LCBjaGVja2luZyB0aGUgbGF0ZXN0IGFuY2hvciBkYXRhLCB1c2luZyB0aGUgYGhpZGVgIGZlaWxkIHRvIGdldCBkYXRhLlxuICAgIGRlY29kZUF1dGhBbmNob3I6IGZ1bmN0aW9uIChsaXN0LCBobGlzdCwgY2spIHtcbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICB2YXIgYW1hcCA9IHt9O1xuICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICAvL0ZJWE1FLCBpZiB0aGUgbGF0ZXN0IGF1dGggYW5jaG9yIGlzIGhpZGRlbixuZWVkIHRvIGNoZWNrIG5leHQgb25lLlxuICAgICAgICB2YXIgbGFzdCA9IGxpc3RbMF07XG4gICAgICAgIGlmIChsYXN0LnByb3RvY29sID09PSBudWxsKSB7XG4gICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJOb3QgdmFsaWQgYW5jaG9yXCIgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobWFwLCBhbWFwLCBlcnJzKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJvdG9jb2wgPSBsYXN0LnByb3RvY29sO1xuICAgICAgICBzZWxmLmF1dGhIaWRlTGlzdChwcm90b2NvbCwgZnVuY3Rpb24gKGhsaXN0LCByZXNNYXAsIGhlcnJzKSB7XG4gICAgICAgICAgICBlcnJzLnB1c2guYXBwbHkoZXJycywgaGVycnMpO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiByZXNNYXApIHtcbiAgICAgICAgICAgICAgICBhbWFwW2tdID0gcmVzTWFwW2tdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhtYXAgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBobWFwW2hsaXN0W2ldLnRvU3RyaW5nKCldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBsaXN0W2ldO1xuICAgICAgICAgICAgICAgIGlmIChobWFwW3Jvdy5ibG9jay50b1N0cmluZygpXSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKCFyb3cucHJvdG9jb2wgfHwgcm93LnByb3RvY29sLmZtdCAhPT0gcHJvdG9jb2xfMS5mb3JtYXRUeXBlLkpTT04gfHwgcm93LnJhdyA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRtYXAgPSBKU09OLnBhcnNlKHJvdy5yYXcpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIHRtYXApXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBba10gPSB0bWFwW2tdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IGVycm9yIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhtYXAsIGFtYXAsIGVycnMpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vY2hlY2sgYXV0aCBhbmNob3IncyBoaWRlIGxpc3RcbiAgICBhdXRoSGlkZUxpc3Q6IGZ1bmN0aW9uIChwcm90b2NvbCwgY2spIHtcbiAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICBpZiAoIXByb3RvY29sLmhpZGUpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgbWFwLCBlcnJzKTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJvdG9jb2wuaGlkZSkpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socHJvdG9jb2wuaGlkZSwgbWFwLCBlcnJzKTtcbiAgICAgICAgc2VsZi5nZXRBbmNob3IoW3Byb3RvY29sLmhpZGUsIDBdLCBmdW5jdGlvbiAoYW5jaG9ySCkge1xuICAgICAgICAgICAgdmFyIGVyciA9IGFuY2hvckg7XG4gICAgICAgICAgICBpZiAoZXJyLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgZXJycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIG1hcCwgZXJycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGxpc3QgPSBzZWxmLmRlY29kZUhpZGVBbmNob3IoYW5jaG9ySCk7XG4gICAgICAgICAgICB2YXIgZXJySCA9IGhsaXN0O1xuICAgICAgICAgICAgaWYgKGVyckguZXJyb3IpXG4gICAgICAgICAgICAgICAgZXJycy5wdXNoKGVyckgpO1xuICAgICAgICAgICAgdmFyIGFuY2hvciA9IGFuY2hvckg7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFuY2hvcik7XG4gICAgICAgICAgICBtYXBbXCJcIi5jb25jYXQoYW5jaG9yLm5hbWUsIFwiX1wiKS5jb25jYXQoYW5jaG9yLmJsb2NrKV0gPSBhbmNob3I7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soaGxpc3QsIG1hcCwgZXJycyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY2hlY2tMYXN0OiBmdW5jdGlvbiAobmFtZSwgYmxvY2ssIGNrKSB7XG4gICAgICAgIEFQSSA9PT0gbnVsbCB8fCBBUEkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IEFQSS5jb21tb24ub3duZXIobmFtZSwgZnVuY3Rpb24gKG93bmVyLCBsYXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soYmxvY2sgPT09IGxhc3QgPyB0cnVlIDogZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vY2hlY2sgd2V0aGVyIGN1cnJlbnQgYW5jaG9yIGlzIGluIHRoZSBoaWRlIGxpc3RcbiAgICBpc1ZhbGlkQW5jaG9yOiBmdW5jdGlvbiAoaGlkZSwgZGF0YSwgY2ssIHBhcmFtcykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKHBhcmFtcyk7XG4gICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgIHZhciBjdXIgPSBkYXRhLmJsb2NrO1xuICAgICAgICB2YXIgb3ZlcmxvYWQgPSBmYWxzZTsgLy93ZXRoZXIgdG8gdGhlIGVuZCBvZiBgQW5jaG9yYCBoaXN0b3J5XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGhpZGUpKSB7XG4gICAgICAgICAgICAvLzEuaWYgdGhlIGhpZGUgaXMgYXJyYXksIGNoZWNrIGRpcmVjdGx5XG4gICAgICAgICAgICB2YXIgaGxpc3QgPSBoaWRlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBobGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjdXIgPT09IGhsaXN0W2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnByZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IFwiT3V0IG9mIFwiLmNvbmNhdChkYXRhLm5hbWUsIFwiIGxpbWl0ZWRcIikgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVybG9hZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycywgb3ZlcmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdfbGluayA9ICgwLCBkZWNvZGVyXzEubGlua0NyZWF0b3IpKFtkYXRhLm5hbWUsIGRhdGEucHJlXSwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG5ld19saW5rLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG51bGwsIGVycnMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8yLmdldCB0aGUgbGF0ZXN0IGhpZGUgYW5jaG9yIGRhdGFcbiAgICAgICAgICAgIHZhciBoX2xvY2F0aW9uID0gW2hpZGUsIDBdO1xuICAgICAgICAgICAgc2VsZi5nZXRBbmNob3IoaF9sb2NhdGlvbiwgZnVuY3Rpb24gKGhkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IHNlbGYuZGVjb2RlSGlkZUFuY2hvcihoZGF0YSk7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcztcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICB2YXIgaGxpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBobGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyID09PSBobGlzdFtpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucHJlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IFwiT3V0IG9mIFwiLmNvbmNhdChkYXRhLm5hbWUsIFwiIGxpbWl0ZWRcIikgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxvYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhudWxsLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3X2xpbmsgPSAoMCwgZGVjb2Rlcl8xLmxpbmtDcmVhdG9yKShbZGF0YS5uYW1lLCBkYXRhLnByZV0sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobmV3X2xpbmssIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycywgb3ZlcmxvYWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vY2hlY2sgdGhlIGF1dGhvcml0eSBiZXR3ZWVuIGFuY2hvcnNcbiAgICBjaGVja1RydXN0OiBmdW5jdGlvbiAoY2FsbGVyLCBhcHAsIGNrKSB7XG4gICAgfSxcbiAgICAvL2NoZWNrIHRoZSBhdXRob3JpdHkgdG8gYWNjb3VudCBhZGRyZXNzXG4gICAgY2hlY2tBdXRob3JpdHk6IGZ1bmN0aW9uIChjYWxsZXIsIGFwcCwgY2spIHtcbiAgICAgICAgLy8xLmNoZWNrIHRoZSBjYWxsZWQgYW5jaG9yIHR5cGUuXG4gICAgICAgIGlmIChhcHAudHlwZSAhPT0gcHJvdG9jb2xfMS5yYXdUeXBlLkFQUCkge1xuICAgICAgICAgICAgY2FsbGVyLmVycm9yLnB1c2goeyBlcnJvcjogXCJBbnN3ZXIgaXMgbm90IGNBcHAuXCIgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICAvLzIuY2hlY2sgdGhlIGF1dGhvcml0eVxuICAgICAgICB2YXIgZnJvbSA9IGNhbGxlci5kYXRhW1wiXCIuY29uY2F0KGNhbGxlci5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjYWxsZXIubG9jYXRpb25bMV0pXTtcbiAgICAgICAgdmFyIHNpZ25lciA9IGZyb20uc2lnbmVyO1xuICAgICAgICB2YXIgYXV0aHMgPSBhcHAuYXV0aDtcbiAgICAgICAgLy8yLjEuIG5vIGF1dGhvcml0eSBkYXRhLCBjYW4gXG4gICAgICAgIGlmIChhdXRocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjYWxsZXIuYXBwID0gYXBwO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5lbXB0eShhdXRocykpIHtcbiAgICAgICAgICAgICAgICBjYWxsZXIuYXBwID0gYXBwO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGF1dGhzW3NpZ25lcl0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsZXIuZXJyb3IucHVzaCh7IGVycm9yOiBcIk5vIGF1dGhvcml0eSBvZiBjYWxsZXIuXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhzW3NpZ25lcl0gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxlci5hcHAgPSBhcHA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFQSSA9PT0gbnVsbCB8fCBBUEkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IEFQSS5jb21tb24uYmxvY2soZnVuY3Rpb24gKGJsb2NrLCBoYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9jayA+IGF1dGhzW3NpZ25lcl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmVycm9yLnB1c2goeyBlcnJvcjogXCJBdXRob3JpdHkgb3V0IG9mIHRpbWUuXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vZ2V0IHRoZSBsYXRlc3QgZGVjYXJlZCBoaWRlIGFuY2hvciBsaXN0LlxuICAgIGdldExhdGVzdERlY2xhcmVkSGlkZGVuOiBmdW5jdGlvbiAobG9jYXRpb24sIGNrKSB7XG4gICAgICAgIHNlbGYuZ2V0QW5jaG9yKFtsb2NhdGlvblswXSwgMF0sIGZ1bmN0aW9uIChyZXNMYXRlc3QpIHtcbiAgICAgICAgICAgIC8vMS4gZmFpbGRlIHRvIGdldCB0aGUgaGlkZSBhbmNob3IuXG4gICAgICAgICAgICB2YXIgZXJyID0gcmVzTGF0ZXN0O1xuICAgICAgICAgICAgLy9pZihlcnIuZXJyb3IpIHJldHVybiBjayAmJiBjayhlcnIpO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soW10pO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNMYXRlc3Q7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBkYXRhLnByb3RvY29sO1xuICAgICAgICAgICAgaWYgKHByb3RvY29sID09PSBudWxsIHx8ICFwcm90b2NvbC5oaWRlKVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhbXSk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbC5oaWRlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socHJvdG9jb2wuaGlkZSk7XG4gICAgICAgICAgICBzZWxmLmdldEFuY2hvcihbcHJvdG9jb2wuaGlkZSwgMF0sIGZ1bmN0aW9uIChyZXNIaWRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlc0xhdGVzdDtcbiAgICAgICAgICAgICAgICAvL2lmKGVyci5lcnJvcikgcmV0dXJuIGNrICYmIGNrKGVycik7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKFtdKTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlc0hpZGU7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwgfHwgIWRhdGEucmF3KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soW10pO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gSlNPTi5wYXJzZShkYXRhLnJhdyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBlcnJvciB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBnZXQgcGFyYW1zIGZyb20gc3RyaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICAgYXJnc1x0ICAgIC8vU3RyaW5nIHN1Y2ggYXMgYGtleV9hPXZhbCZrZXlfYj12YWwma2V5X2M9dmFsYFxuICAgICAqICovXG4gICAgZ2V0UGFyYW1zOiBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBhcmdzLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3cgPSBhcnJbaV07XG4gICAgICAgICAgICB2YXIga3YgPSByb3cuc3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgaWYgKGt2Lmxlbmd0aCAhPT0gMilcbiAgICAgICAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJlcnJvciBwYXJhbWV0ZXJcIiB9O1xuICAgICAgICAgICAgbWFwW2t2WzBdXSA9IGt2WzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBjaGVjayB3ZXRoZXIgb2JqZWN0IGVtcHR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9ICAgICAgb2JqXHQgICAgLy9ub3JtYWwgb2JqZWN0XG4gICAgICogKi9cbiAgICBlbXB0eTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iailcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbn07XG52YXIgZGVjb2RlciA9IHt9O1xuZGVjb2Rlcltwcm90b2NvbF8xLnJhd1R5cGUuQVBQXSA9IHNlbGYuZGVjb2RlQXBwO1xuZGVjb2Rlcltwcm90b2NvbF8xLnJhd1R5cGUuREFUQV0gPSBzZWxmLmRlY29kZURhdGE7XG5kZWNvZGVyW3Byb3RvY29sXzEucmF3VHlwZS5MSUJdID0gc2VsZi5kZWNvZGVMaWI7XG4vLyFpbXBvcnRhbnQsIGFzIHN1cHBvcnQgYGRlY2xhcmVkIGhpZGRlbmAsIHRoaXMgZnVuY3Rpb24gbWF5IHJlZGlyZWN0IG1hbnkgdGltZXMsIGJlIGNhcmVmdWwuXG4vKipcbiAqIEV4cG9zZWQgbWV0aG9kIG9mIEVhc3kgUHJvdG9jb2wgaW1wbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICBsaW5rZXJcdCAgICAvL0FuY2hvciBsaW5rZXIsIHN1Y2ggYXMgYGFuY2hvcjovL2hlbGxvL2BcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgIGlucHV0QVBJICAgIC8vdGhlIEFQSSBuZWVkZWQgdG8gYWNjZXNzIEFuY2hvciBuZXR3b3JrLCBgYW5jaG9ySlNgIG1haW5seVxuICogQHBhcmFtIHtmdW5jdGlvbn0gICAgY2sgICAgICAgICAgLy9jYWxsYmFjaywgd2lsbCByZXR1cm4gdGhlIGRlY29kZWQgcmVzdWx0XG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICBbZmVuY2VdICAgICAvL2lmIHRydWUsIHRyZWF0IHRoZSBydW4gcmVzdWx0IGFzIGNBcHAuIFRoZW4gZW5kIG9mIHRoZSBsb29wLlxuICogKi9cbnZhciBydW4gPSBmdW5jdGlvbiAobGlua2VyLCBpbnB1dEFQSSwgY2ssIGhsaXN0LCBmZW5jZSkge1xuICAgIGlmIChBUEkgPT09IG51bGwgJiYgaW5wdXRBUEkgIT09IG51bGwpXG4gICAgICAgIEFQSSA9IGlucHV0QVBJO1xuICAgIHZhciB0YXJnZXQgPSAoMCwgZGVjb2Rlcl8xLmxpbmtEZWNvZGVyKShsaW5rZXIpO1xuICAgIGlmICh0YXJnZXQuZXJyb3IpXG4gICAgICAgIHJldHVybiBjayAmJiBjayh0YXJnZXQpO1xuICAgIC8vMC5nZXQgdGhlIGxhdGVzdCBkZWNsYXJlZCBoaWRkZW4gbGlzdFxuICAgIGlmIChobGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBzZWxmLmdldExhdGVzdERlY2xhcmVkSGlkZGVuKHRhcmdldC5sb2NhdGlvbiwgZnVuY3Rpb24gKGxhc3RIaWRlKSB7XG4gICAgICAgICAgICB2YXIgY09iamVjdCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBwcm90b2NvbF8xLnJhd1R5cGUuTk9ORSxcbiAgICAgICAgICAgICAgICBsb2NhdGlvbjogW3RhcmdldC5sb2NhdGlvblswXSwgdGFyZ2V0LmxvY2F0aW9uWzFdICE9PSAwID8gdGFyZ2V0LmxvY2F0aW9uWzFdIDogMF0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IFtdLFxuICAgICAgICAgICAgICAgIGRhdGE6IHt9LFxuICAgICAgICAgICAgICAgIGluZGV4OiBbbnVsbCwgbnVsbF0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHJlcyA9IGxhc3RIaWRlO1xuICAgICAgICAgICAgaWYgKHJlcy5lcnJvcikge1xuICAgICAgICAgICAgICAgIGNPYmplY3QuZXJyb3IucHVzaChyZXMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBoUmVzdWx0ID0gbGFzdEhpZGU7XG4gICAgICAgICAgICByZXR1cm4gcnVuKGxpbmtlciwgQVBJLCBjaywgaFJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLzEuZGVjb2RlIHRoZSBgQW5jaG9yIExpbmtgLCBwcmVwYXJlIHRoZSByZXN1bHQgb2JqZWN0LlxuICAgIHZhciBjT2JqZWN0ID0ge1xuICAgICAgICB0eXBlOiBwcm90b2NvbF8xLnJhd1R5cGUuTk9ORSxcbiAgICAgICAgbG9jYXRpb246IFt0YXJnZXQubG9jYXRpb25bMF0sIHRhcmdldC5sb2NhdGlvblsxXSAhPT0gMCA/IHRhcmdldC5sb2NhdGlvblsxXSA6IDBdLFxuICAgICAgICBlcnJvcjogW10sXG4gICAgICAgIGRhdGE6IHt9LFxuICAgICAgICBpbmRleDogW251bGwsIG51bGxdLFxuICAgICAgICBoaWRlOiBobGlzdCxcbiAgICB9O1xuICAgIGlmICh0YXJnZXQucGFyYW0pXG4gICAgICAgIGNPYmplY3QucGFyYW1ldGVyID0gdGFyZ2V0LnBhcmFtO1xuICAgIC8vMi5UcnkgdG8gZ2V0IHRoZSB0YXJnZXQgYEFuY2hvcmAgZGF0YS5cbiAgICBzZWxmLmdldEFuY2hvcih0YXJnZXQubG9jYXRpb24sIGZ1bmN0aW9uIChyZXNBbmNob3IpIHtcbiAgICAgICAgLy8yLjEuZXJyb3IgaGFuZGxlLlxuICAgICAgICB2YXIgZXJyID0gcmVzQW5jaG9yO1xuICAgICAgICBpZiAoZXJyLmVycm9yKSB7XG4gICAgICAgICAgICBjT2JqZWN0LmVycm9yLnB1c2goZXJyKTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGF0YSA9IHJlc0FuY2hvcjtcbiAgICAgICAgaWYgKGNPYmplY3QubG9jYXRpb25bMV0gPT09IDApXG4gICAgICAgICAgICBjT2JqZWN0LmxvY2F0aW9uWzFdID0gZGF0YS5ibG9jaztcbiAgICAgICAgY09iamVjdC5kYXRhW1wiXCIuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY09iamVjdC5sb2NhdGlvblsxXSldID0gZGF0YTtcbiAgICAgICAgLy8yLjIuV2V0aGVyIEpTT04gcHJvdG9jb2xcbiAgICAgICAgaWYgKGRhdGEucHJvdG9jb2wgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNPYmplY3QuZXJyb3IucHVzaCh7IGVycm9yOiBcIk5vIHZhbGlkIHByb3RvY29sXCIgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8yLjMuV2V0aGVyIEVhc3kgUHJvdG9jb2xcbiAgICAgICAgdmFyIHR5cGUgPSAhZGF0YS5wcm90b2NvbC50eXBlID8gXCJcIiA6IGRhdGEucHJvdG9jb2wudHlwZTtcbiAgICAgICAgaWYgKCFkZWNvZGVyW3R5cGVdKSB7XG4gICAgICAgICAgICBjT2JqZWN0LmVycm9yLnB1c2goeyBlcnJvcjogXCJOb3QgZWFzeSBwcm90b2NvbCB0eXBlXCIgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8zLiBjaGVjayB3ZXRoZXIgdGhlIGxhdGVzdCBhbmNob3IuIElmIG5vdCwgbmVlZCB0byBnZXQgbGF0ZXN0IGhpZGUgZGF0YS5cbiAgICAgICAgaWYgKGRhdGEucHJvdG9jb2wpIHtcbiAgICAgICAgICAgIHNlbGYuaXNWYWxpZEFuY2hvcihobGlzdCwgZGF0YSwgZnVuY3Rpb24gKHZhbGlkTGluaywgZXJycywgb3ZlcmxvYWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAgICAgKF9hID0gY09iamVjdC5lcnJvcikucHVzaC5hcHBseShfYSwgZXJycyk7XG4gICAgICAgICAgICAgICAgaWYgKG92ZXJsb2FkKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbGlkTGluayAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bih2YWxpZExpbmssIEFQSSwgY2ssIGhsaXN0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UmVzdWx0KHR5cGUpO1xuICAgICAgICAgICAgfSwgY09iamVjdC5wYXJhbWV0ZXIgPT09IHVuZGVmaW5lZCA/IHt9IDogY09iamVjdC5wYXJhbWV0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdCh0eXBlKTtcbiAgICAgICAgfVxuICAgICAgICAvL2lubGluZSBmdW5jdGlvbiB0byBhdm9pZCB0aGUgcmVwZXRpdGl2ZSBjb2RlLlxuICAgICAgICBmdW5jdGlvbiBnZXRSZXN1bHQodHlwZSkge1xuICAgICAgICAgICAgc2VsZi5tZXJnZShkYXRhLm5hbWUsIGRhdGEucHJvdG9jb2wsIHt9LCBmdW5jdGlvbiAobWVyZ2VSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAgICAgaWYgKG1lcmdlUmVzdWx0LmF1dGggIT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuYXV0aCA9IG1lcmdlUmVzdWx0LmF1dGg7XG4gICAgICAgICAgICAgICAgaWYgKG1lcmdlUmVzdWx0LmhpZGUgIT0gbnVsbCAmJiBtZXJnZVJlc3VsdC5oaWRlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmhpZGUgPSBtZXJnZVJlc3VsdC5oaWRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuZXJyb3IubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIChfYSA9IGNPYmplY3QuZXJyb3IpLnB1c2guYXBwbHkoX2EsIG1lcmdlUmVzdWx0LmVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1lcmdlUmVzdWx0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkFVVEhdICE9PSBudWxsICYmIGNPYmplY3QuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgY09iamVjdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5BVVRIXSA9IG1lcmdlUmVzdWx0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkFVVEhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguSElERV0gIT09IG51bGwgJiYgY09iamVjdC5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkhJREVdID0gbWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguSElERV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbWVyZ2VSZXN1bHQubWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuZGF0YVtrXSA9IG1lcmdlUmVzdWx0Lm1hcFtrXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZXJbdHlwZV0oY09iamVjdCwgZnVuY3Rpb24gKHJlc0ZpcnN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNGaXJzdC5jYWxsICYmICFmZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFwcF9saW5rID0gKDAsIGRlY29kZXJfMS5saW5rQ3JlYXRvcikocmVzRmlyc3QuY2FsbCwgcmVzRmlyc3QucGFyYW1ldGVyID09PSB1bmRlZmluZWQgPyB7fSA6IHJlc0ZpcnN0LnBhcmFtZXRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnVuKGFwcF9saW5rLCBBUEksIGZ1bmN0aW9uIChyZXNBcHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jaGVja0F1dGhvcml0eShyZXNGaXJzdCwgcmVzQXBwLCBjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBobGlzdCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzRmlyc3QpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbi8vRGVidWcgcGFydCB0byBnZXQgbW9yZSBkZXRhaWxzIG9mIHByb2Nlc3MuXG52YXIgZGVidWdfcnVuID0gZnVuY3Rpb24gKGxpbmtlciwgaW5wdXRBUEksIGNrKSB7XG4gICAgZGVidWcuc2VhcmNoID0gW107XG4gICAgZGVidWcuc3RhcnQgPSBkZWJ1Zy5zdGFtcCgpO1xuICAgIHJ1bihsaW5rZXIsIGlucHV0QVBJLCBmdW5jdGlvbiAocmVzUnVuKSB7XG4gICAgICAgIGlmICghZGVidWcuZGlzYWJsZSlcbiAgICAgICAgICAgIHJlc1J1bi5kZWJ1ZyA9IGRlYnVnOyAvL2FkZCBkZWJ1ZyBpbmZvcm1hdGlvblxuICAgICAgICBkZWJ1Zy5lbmQgPSBkZWJ1Zy5zdGFtcCgpO1xuICAgICAgICBjYWNoZS5jbGVhcigpO1xuICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzUnVuKTtcbiAgICB9KTtcbn07XG52YXIgZmluYWxfcnVuID0gKGRlYnVnLmRpc2FibGUgPyBydW4gOiBkZWJ1Z19ydW4pO1xuZXhwb3J0cy5lYXN5UnVuID0gZmluYWxfcnVuO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9