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
var self = {
    getAnchor: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var anchor = location[0], block = location[1];
        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if (block !== 0) {
            API.common.target(anchor, block, function (data) {
                self.filterAnchor(data, ck);
            });
        }
        else {
            API.common.latest(anchor, function (data) {
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
    //check wether last
    isValidAnchor: function (hide, data, ck, params) {
        //console.log(params);
        var errs = [];
        var cur = data.block;
        var overload = false; //wether to the end of `Anchor` history
        if (Array.isArray(hide)) {
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
            //FIXME here to check the latest anchor data to confirm the hidden list.
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
    checkAuthority: function (caller, app, ck) {
        //x.1.check the called anchor type.
        if (app.type !== protocol_1.rawType.APP) {
            caller.error.push({ error: "Answer is not cApp." });
            return ck && ck(caller);
        }
        //x.2.check the authority
        var from = caller.data["".concat(caller.location[0], "_").concat(caller.location[1])];
        var signer = from.signer;
        var auths = app.auth;
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
exports.easyRun = run;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLDRCQUE0QjtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLGlDQUFpQztBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLHVDQUF1QztBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVIQUF1SDtBQUN2SDtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLGVBQWUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9saWIvbG9hZGVyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jaGFyZW5jL2NoYXJlbmMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NyeXB0L2NyeXB0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9pcy1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21kNS9tZDUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2F1dGguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2RlY29kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2hpZGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3Byb3RvY29sLmpzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJwcmV0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IHNlYXJjaD1udWxsO1xubGV0IHRhcmdldD1udWxsO1xuY29uc3Qgc2VsZj17XG4gICAgZ2V0TGliczoobGlzdCxjayxjYWNoZSxvcmRlcik9PntcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgU3RhcnQ6JHtKU09OLnN0cmluZ2lmeShsaXN0KX1gKTtcbiAgICAgICAgaWYoIWNhY2hlKSBjYWNoZT17fTtcbiAgICAgICAgaWYoIW9yZGVyKSBvcmRlcj1bXTtcbiAgICAgICAgY29uc3Qgcm93PWxpc3Quc2hpZnQoKTtcbiAgICAgICAgY29uc3QgYW5jaG9yPShBcnJheS5pc0FycmF5KHJvdyk/cm93WzBdOnJvdykudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgYmxvY2s9QXJyYXkuaXNBcnJheShyb3cpP3Jvd1sxXTowO1xuXG4gICAgICAgIC8vMS5jaGVjayBsaWIgbG9hZGluZyBzdGF0dXNcbiAgICAgICAgaWYoY2FjaGVbYW5jaG9yXSkgcmV0dXJuIHNlbGYuZ2V0TGlicyhsaXN0LGNrLGNhY2hlLG9yZGVyKTtcblxuICAgICAgICAvLzIuZ2V0IHRhcmdldCBhbmNob3JcbiAgICAgICAgc2VsZi5nZXRBbmNob3IoYW5jaG9yLGJsb2NrLChhbixyZXMpPT57XG4gICAgICAgICAgICBjYWNoZVthbl09IXJlcz97ZXJyb3I6J25vIHN1Y2ggYW5jaG9yJ306cmVzO1xuICAgICAgICAgICAgaWYoIXJlcy5wcm90b2NvbCB8fCAoIXJlcy5wcm90b2NvbC5leHQgJiYgIXJlcy5wcm90b2NvbC5saWIpKXtcbiAgICAgICAgICAgICAgICBvcmRlci5wdXNoKGFuKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1PXtcbiAgICAgICAgICAgICAgICAgICAgZW50cnk6YW4sXG4gICAgICAgICAgICAgICAgICAgIGxpYjpyZXMucHJvdG9jb2wgJiYgcmVzLnByb3RvY29sLmxpYj9yZXMucHJvdG9jb2wubGliOltdLFxuICAgICAgICAgICAgICAgICAgICBleHQ6cmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5leHQ/cmVzLnByb3RvY29sLmV4dDpbXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9yZGVyLnB1c2gocXUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXMucHJvdG9jb2wgJiYgcmVzLnByb3RvY29sLmV4dCl7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpPXJlcy5wcm90b2NvbC5leHQubGVuZ3RoO2k+MDtpLS0pIGxpc3QudW5zaGlmdChyZXMucHJvdG9jb2wuZXh0W2ktMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5saWIpe1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT1yZXMucHJvdG9jb2wubGliLmxlbmd0aDtpPjA7aS0tKSBsaXN0LnVuc2hpZnQocmVzLnByb3RvY29sLmxpYltpLTFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYobGlzdC5sZW5ndGg9PT0wKSByZXR1cm4gY2sgJiYgY2soY2FjaGUsb3JkZXIpO1xuICAgICAgICAgICAgc2VsZi5nZXRMaWJzKGxpc3QsY2ssY2FjaGUsb3JkZXIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGdldEFuY2hvcjooYW5jaG9yLGJsb2NrLGNrKT0+e1xuICAgICAgICBpZighYW5jaG9yKSByZXR1cm4gY2sgJiYgY2soYW5jaG9yLCcnKTtcbiAgICAgICAgY29uc3QgZnVuPWJsb2NrPT09MD9zZWFyY2g6dGFyZ2V0O1xuICAgICAgICBmdW4oYW5jaG9yLCAocmVzKT0+e1xuICAgICAgICAgICAgaWYoIXJlcyB8fCAoIXJlcy5vd25lcikpIHJldHVybiBjayAmJiBjayhhbmNob3IsJycpO1xuICAgICAgICAgICAgaWYoIXJlcy5lbXB0eSl7XG4gICAgICAgICAgICAgICAgIGNvbnN0IGR0PXtcbiAgICAgICAgICAgICAgICAgICAga2V5OnJlcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICByYXc6cmVzLnJhdyxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2w6cmVzLnByb3RvY29sLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGFuY2hvcixkdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVjb2RlTGliOihkdCk9PntcbiAgICAgICAgY29uc3QgcmVzdWx0PXt0eXBlOidlcnJvcicsZGF0YTonJ307XG4gICAgICAgIGlmKGR0LmVycm9yKXtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcj1kdC5lcnJvcjtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighZHQucHJvdG9jb2wpe1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yPSdVbmV4Y2VwdCBkYXRhIGZvcm1hdCc7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvdG89ZHQucHJvdG9jb2w7XG4gICAgICAgIGlmKCFwcm90by5mbXQpe1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yPSdBbmNob3IgZm9ybWF0IGxvc3QnO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQudHlwZT1wcm90by5mbXQ7XG5cbiAgICAgICAgLy9zb2x2ZSByYXcgcHJvYmxlbTsgaGV4IHRvIGFzY2lpXG4gICAgICAgIGlmKGR0LnJhdy5zdWJzdHIoMCwgMikudG9Mb3dlckNhc2UoKT09PScweCcpe1xuICAgICAgICAgICAgcmVzdWx0LmRhdGE9ZGVjb2RlVVJJQ29tcG9uZW50KGR0LnJhdy5zbGljZSgyKS5yZXBsYWNlKC9cXHMrL2csICcnKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCAnJSQmJykpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc3VsdC5kYXRhPWR0LnJhdztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgXG4gICAgZ2V0Q29tcGxleE9yZGVyOihuYW1lLG1hcCxxdWV1ZSxob2xkKT0+e1xuICAgICAgICBpZighcXVldWUpIHF1ZXVlPVtdOyAgICAgICAgLy/ojrflj5bnmoRcbiAgICAgICAgaWYoIWhvbGQpIGhvbGQ9W107ICAgICAgICAgIC8vMS7nlKjmnaXooajovr7lpITnkIbnirbmgIFcblxuICAgICAgICBpZihtYXBbbmFtZV09PT10cnVlICYmIGhvbGQubGVuZ3RoPT09MCkgcmV0dXJuIHF1ZXVlO1xuICAgICAgICBjb25zdCByb3c9bWFwW25hbWVdO1xuXG4gICAgICAgIGNvbnN0IGxhc3Q9aG9sZC5sZW5ndGghPT0wP2hvbGRbaG9sZC5sZW5ndGgtMV06bnVsbDtcbiAgICAgICAgY29uc3QgcmVjb3Zlcj0obGFzdCE9PW51bGwmJmxhc3QubmFtZT09PW5hbWUpP2hvbGQucG9wKCk6bnVsbDtcblxuICAgICAgICAvLzEuY2hlY2sgbGliIGNvbXBsZXg7XG4gICAgICAgIGlmKHJvdy5saWIgJiYgcm93LmxpYi5sZW5ndGg+MCl7XG4gICAgICAgICAgICBpZihyZWNvdmVyPT09bnVsbCl7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxyb3cubGliLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaWI9cm93LmxpYltpXTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygncmVhZHkgdG8gY2hlY2sgbGliOicrbGliKTtcbiAgICAgICAgICAgICAgICAgICAgaWYobWFwW2xpYl09PT10cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gobGliKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBob2xkLnB1c2goe2xpYjppLG5hbWU6bmFtZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Q29tcGxleE9yZGVyKGxpYixtYXAscXVldWUsaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpZihyZWNvdmVyLmxpYiE9PXVuZGVmaW5lZCAmJiByZWNvdmVyLmxpYiE9PXJvdy5saWIubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPXJlY292ZXIubGliKzE7aTxyb3cubGliLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGliPXJvdy5saWJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdyZWFkeSB0byBjaGVjayBsaWI6JytsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYobWFwW2xpYl09PT10cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGxpYik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob2xkLnB1c2goe2xpYjppLG5hbWU6bmFtZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihsaWIsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYocmVjb3Zlcj09PW51bGwpIHF1ZXVlLnB1c2gobmFtZSk7XG5cbiAgICAgICAgLy8yLmNoZWNrIGV4dGVuZCBjb21wbGV4O1xuICAgICAgICBpZihyb3cuZXh0ICYmIHJvdy5leHQubGVuZ3RoPjApe1xuICAgICAgICAgICAgaWYocmVjb3ZlciE9PW51bGwpe1xuICAgICAgICAgICAgICAgIGlmKHJlY292ZXIuZXh0IT09dW5kZWZpbmVkICYmIHJlY292ZXIuZXh0IT09cm93LmV4dC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9cmVjb3Zlci5leHQrMTtpPHJvdy5leHQubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHQ9cm93LmV4dFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1hcFtleHRdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtleHQ6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIoZXh0LG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cm93LmV4dC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0PXJvdy5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmKG1hcFtleHRdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtleHQ6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihleHQsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoaG9sZC5sZW5ndGghPT0wKXtcbiAgICAgICAgICAgIGNvbnN0IGxhc3Q9aG9sZFtob2xkLmxlbmd0aC0xXTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihsYXN0Lm5hbWUsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHF1ZXVlO1xuICAgIH0sXG4gICAgbWVyZ2VPcmRlcjoob3JkZXIpPT57XG4gICAgICAgIGNvbnN0IGNvbXBsZXg9e307XG4gICAgICAgIGNvbnN0IG1hcD17fTtcbiAgICAgICAgY29uc3QgZG9uZT17fTtcbiAgICAgICAgY29uc3QgcXVldWU9W107XG4gICAgICAgIGZvcihsZXQgaT0wO2k8b3JkZXIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBjb25zdCByb3c9b3JkZXJbaV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJvdyAhPT0gJ3N0cmluZycgJiYgcm93LmVudHJ5IT09dW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICBjb21wbGV4W3Jvdy5lbnRyeV09dHJ1ZTtcbiAgICAgICAgICAgICAgICBtYXBbcm93LmVudHJ5XT1yb3c7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBtYXBbcm93XT10cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yKGxldCBpPTA7aTxvcmRlci5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGNvbnN0IHJvdz1vcmRlcltpXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm93ID09PSAnc3RyaW5nJyB8fCByb3cgaW5zdGFuY2VvZiBTdHJpbmcpe1xuICAgICAgICAgICAgICAgIGlmKGRvbmVbcm93XSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgIGRvbmVbcm93XT10cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgLy8yLmNvbXBsZXggbGliXG4gICAgICAgICAgICAgICAgLy8yLjEuYWRkIHJlcXVpcmVkIGxpYnNcbiAgICAgICAgICAgICAgICBpZihyb3cubGliICYmIHJvdy5saWIubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPHJvdy5saWIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaWI9cm93LmxpYltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmVbbGliXSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjb21wbGV4W2xpYl0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNxdWV1ZT1zZWxmLmdldENvbXBsZXhPcmRlcihsaWIsbWFwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsaWJ9OiR7SlNPTi5zdHJpbmdpZnkoY3F1ZXVlKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaj0wO2o8Y3F1ZXVlLmxlbmd0aDtqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGliPWNxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZVtjbGliXSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY2xpYik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVbY2xpYl09dHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGxpYik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZVtsaWJdPXRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8yLjIuYWRkIGxpYiBib2R5XG4gICAgICAgICAgICAgICAgaWYoIWRvbmVbcm93LmVudHJ5XSl7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gocm93LmVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZVtyb3cuZW50cnldPXRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8yLjMuYWRkIHJlcXVpcmVkIGV4dGVuZCBwbHVnaW5zXG4gICAgICAgICAgICAgICAgaWYocm93LmV4dCAmJiByb3cuZXh0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxyb3cuZXh0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0PXJvdy5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lW2V4dF0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY29tcGxleFtleHRdKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcXVldWU9c2VsZi5nZXRDb21wbGV4T3JkZXIoZXh0LG1hcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqPTA7ajxjcXVldWUubGVuZ3RoO2orKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNleHQ9Y3F1ZXVlW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lW2NleHRdKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChjZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZVtjZXh0XT10cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lW2V4dF09dHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICB9LFxuICAgIHJlZ3JvdXBDb2RlOihtYXAsb3JkZXIpPT57XG4gICAgICAgIC8vY29uc29sZS5sb2cobWFwKTtcbiAgICAgICAgY29uc3QgZGVjb2RlPXNlbGYuZGVjb2RlTGliO1xuICAgICAgICBsZXQganM9Jyc7XG4gICAgICAgIGxldCBjc3M9Jyc7XG4gICAgICAgIGxldCBkb25lPXt9O1xuICAgICAgICBsZXQgZmFpbGVkPXt9O1xuICAgICAgICBsZXQgZXJyb3I9ZmFsc2U7ICAgIC8v5qCH5b+X5L2N6L6T5Ye6XG5cbiAgICAgICAgY29uc3Qgb2RzPXNlbGYubWVyZ2VPcmRlcihvcmRlcik7XG4gICAgICAgIGZvcihsZXQgaT0wO2k8b2RzLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgY29uc3Qgcm93PW9kc1tpXTtcbiAgICAgICAgICAgIGlmKGRvbmVbcm93XSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBkdD1tYXBbcm93XTtcbiAgICAgICAgICAgIGNvbnN0IHJlcz1kZWNvZGUoZHQpO1xuICAgICAgICAgICAgZG9uZVtyb3ddPXRydWU7XG4gICAgICAgICAgICBpZihyZXMuZXJyb3Ipe1xuICAgICAgICAgICAgICAgIGZhaWxlZFtyb3ddPXJlcy5lcnJvcjtcbiAgICAgICAgICAgICAgICBlcnJvcj10cnVlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAganMrPXJlcy50eXBlPT09XCJqc1wiP3Jlcy5kYXRhOicnO1xuICAgICAgICAgICAgY3NzKz1yZXMudHlwZT09PVwiY3NzXCI/cmVzLmRhdGE6Jyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtqczpqcyxjc3M6Y3NzLGZhaWxlZDpmYWlsZWQsb3JkZXI6b2RzLGVycm9yOmVycm9yfTtcbiAgICB9LFxufVxuXG5leHBvcnRzLkxvYWRlciA9KGxpc3QsQVBJLGNrKT0+e1xuICAgIHNlYXJjaD1BUEkuc2VhcmNoO1xuICAgIHRhcmdldD1BUEkudGFyZ2V0O1xuICAgIHNlbGYuZ2V0TGlicyhsaXN0LGNrKTtcbn07XG5cbmV4cG9ydHMuTGlicz0obGlzdCxBUEksY2spPT57XG4gICAgc2VhcmNoPUFQSS5zZWFyY2g7XG4gICAgdGFyZ2V0PUFQSS50YXJnZXQ7XG4gICAgc2VsZi5nZXRMaWJzKGxpc3QsKGR0LG9yZGVyKT0+eyAgICAgICAgICAgICAgICBcbiAgICAgICAgY29uc3QgY29kZT1zZWxmLnJlZ3JvdXBDb2RlKGR0LG9yZGVyKTtcbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNvZGUpO1xuICAgIH0pO1xufTsiLCJ2YXIgY2hhcmVuYyA9IHtcbiAgLy8gVVRGLTggZW5jb2RpbmdcbiAgdXRmODoge1xuICAgIC8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgc3RyaW5nVG9CeXRlczogZnVuY3Rpb24oc3RyKSB7XG4gICAgICByZXR1cm4gY2hhcmVuYy5iaW4uc3RyaW5nVG9CeXRlcyh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSkpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIHN0cmluZ1xuICAgIGJ5dGVzVG9TdHJpbmc6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShjaGFyZW5jLmJpbi5ieXRlc1RvU3RyaW5nKGJ5dGVzKSkpO1xuICAgIH1cbiAgfSxcblxuICAvLyBCaW5hcnkgZW5jb2RpbmdcbiAgYmluOiB7XG4gICAgLy8gQ29udmVydCBhIHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBzdHJpbmdUb0J5dGVzOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKVxuICAgICAgICBieXRlcy5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRik7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgc3RyaW5nXG4gICAgYnl0ZXNUb1N0cmluZzogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIHN0ciA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICBzdHIucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKSk7XG4gICAgICByZXR1cm4gc3RyLmpvaW4oJycpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjaGFyZW5jO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgYmFzZTY0bWFwXG4gICAgICA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJyxcblxuICBjcnlwdCA9IHtcbiAgICAvLyBCaXQtd2lzZSByb3RhdGlvbiBsZWZ0XG4gICAgcm90bDogZnVuY3Rpb24obiwgYikge1xuICAgICAgcmV0dXJuIChuIDw8IGIpIHwgKG4gPj4+ICgzMiAtIGIpKTtcbiAgICB9LFxuXG4gICAgLy8gQml0LXdpc2Ugcm90YXRpb24gcmlnaHRcbiAgICByb3RyOiBmdW5jdGlvbihuLCBiKSB7XG4gICAgICByZXR1cm4gKG4gPDwgKDMyIC0gYikpIHwgKG4gPj4+IGIpO1xuICAgIH0sXG5cbiAgICAvLyBTd2FwIGJpZy1lbmRpYW4gdG8gbGl0dGxlLWVuZGlhbiBhbmQgdmljZSB2ZXJzYVxuICAgIGVuZGlhbjogZnVuY3Rpb24obikge1xuICAgICAgLy8gSWYgbnVtYmVyIGdpdmVuLCBzd2FwIGVuZGlhblxuICAgICAgaWYgKG4uY29uc3RydWN0b3IgPT0gTnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBjcnlwdC5yb3RsKG4sIDgpICYgMHgwMEZGMDBGRiB8IGNyeXB0LnJvdGwobiwgMjQpICYgMHhGRjAwRkYwMDtcbiAgICAgIH1cblxuICAgICAgLy8gRWxzZSwgYXNzdW1lIGFycmF5IGFuZCBzd2FwIGFsbCBpdGVtc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuLmxlbmd0aDsgaSsrKVxuICAgICAgICBuW2ldID0gY3J5cHQuZW5kaWFuKG5baV0pO1xuICAgICAgcmV0dXJuIG47XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYXRlIGFuIGFycmF5IG9mIGFueSBsZW5ndGggb2YgcmFuZG9tIGJ5dGVzXG4gICAgcmFuZG9tQnl0ZXM6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW107IG4gPiAwOyBuLS0pXG4gICAgICAgIGJ5dGVzLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KSk7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGJpZy1lbmRpYW4gMzItYml0IHdvcmRzXG4gICAgYnl0ZXNUb1dvcmRzOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgd29yZHMgPSBbXSwgaSA9IDAsIGIgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyssIGIgKz0gOClcbiAgICAgICAgd29yZHNbYiA+Pj4gNV0gfD0gYnl0ZXNbaV0gPDwgKDI0IC0gYiAlIDMyKTtcbiAgICAgIHJldHVybiB3b3JkcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBiaWctZW5kaWFuIDMyLWJpdCB3b3JkcyB0byBhIGJ5dGUgYXJyYXlcbiAgICB3b3Jkc1RvQnl0ZXM6IGZ1bmN0aW9uKHdvcmRzKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBiID0gMDsgYiA8IHdvcmRzLmxlbmd0aCAqIDMyOyBiICs9IDgpXG4gICAgICAgIGJ5dGVzLnB1c2goKHdvcmRzW2IgPj4+IDVdID4+PiAoMjQgLSBiICUgMzIpKSAmIDB4RkYpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIGhleCBzdHJpbmdcbiAgICBieXRlc1RvSGV4OiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgaGV4ID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGV4LnB1c2goKGJ5dGVzW2ldID4+PiA0KS50b1N0cmluZygxNikpO1xuICAgICAgICBoZXgucHVzaCgoYnl0ZXNbaV0gJiAweEYpLnRvU3RyaW5nKDE2KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGV4LmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgaGV4IHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBoZXhUb0J5dGVzOiBmdW5jdGlvbihoZXgpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGMgPSAwOyBjIDwgaGV4Lmxlbmd0aDsgYyArPSAyKVxuICAgICAgICBieXRlcy5wdXNoKHBhcnNlSW50KGhleC5zdWJzdHIoYywgMiksIDE2KSk7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgYmFzZS02NCBzdHJpbmdcbiAgICBieXRlc1RvQmFzZTY0OiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgYmFzZTY0ID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgdmFyIHRyaXBsZXQgPSAoYnl0ZXNbaV0gPDwgMTYpIHwgKGJ5dGVzW2kgKyAxXSA8PCA4KSB8IGJ5dGVzW2kgKyAyXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA0OyBqKyspXG4gICAgICAgICAgaWYgKGkgKiA4ICsgaiAqIDYgPD0gYnl0ZXMubGVuZ3RoICogOClcbiAgICAgICAgICAgIGJhc2U2NC5wdXNoKGJhc2U2NG1hcC5jaGFyQXQoKHRyaXBsZXQgPj4+IDYgKiAoMyAtIGopKSAmIDB4M0YpKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBiYXNlNjQucHVzaCgnPScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2U2NC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJhc2UtNjQgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIGJhc2U2NFRvQnl0ZXM6IGZ1bmN0aW9uKGJhc2U2NCkge1xuICAgICAgLy8gUmVtb3ZlIG5vbi1iYXNlLTY0IGNoYXJhY3RlcnNcbiAgICAgIGJhc2U2NCA9IGJhc2U2NC5yZXBsYWNlKC9bXkEtWjAtOStcXC9dL2lnLCAnJyk7XG5cbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGkgPSAwLCBpbW9kNCA9IDA7IGkgPCBiYXNlNjQubGVuZ3RoO1xuICAgICAgICAgIGltb2Q0ID0gKytpICUgNCkge1xuICAgICAgICBpZiAoaW1vZDQgPT0gMCkgY29udGludWU7XG4gICAgICAgIGJ5dGVzLnB1c2goKChiYXNlNjRtYXAuaW5kZXhPZihiYXNlNjQuY2hhckF0KGkgLSAxKSlcbiAgICAgICAgICAgICYgKE1hdGgucG93KDIsIC0yICogaW1vZDQgKyA4KSAtIDEpKSA8PCAoaW1vZDQgKiAyKSlcbiAgICAgICAgICAgIHwgKGJhc2U2NG1hcC5pbmRleE9mKGJhc2U2NC5jaGFyQXQoaSkpID4+PiAoNiAtIGltb2Q0ICogMikpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBjcnlwdDtcbn0pKCk7XG4iLCIvKiFcbiAqIERldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYSBCdWZmZXJcbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbi8vIFRoZSBfaXNCdWZmZXIgY2hlY2sgaXMgZm9yIFNhZmFyaSA1LTcgc3VwcG9ydCwgYmVjYXVzZSBpdCdzIG1pc3Npbmdcbi8vIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHlcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICE9IG51bGwgJiYgKGlzQnVmZmVyKG9iaikgfHwgaXNTbG93QnVmZmVyKG9iaikgfHwgISFvYmouX2lzQnVmZmVyKVxufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiAhIW9iai5jb25zdHJ1Y3RvciAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopXG59XG5cbi8vIEZvciBOb2RlIHYwLjEwIHN1cHBvcnQuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHkuXG5mdW5jdGlvbiBpc1Nsb3dCdWZmZXIgKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iai5yZWFkRmxvYXRMRSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLnNsaWNlID09PSAnZnVuY3Rpb24nICYmIGlzQnVmZmVyKG9iai5zbGljZSgwLCAwKSlcbn1cbiIsIihmdW5jdGlvbigpe1xyXG4gIHZhciBjcnlwdCA9IHJlcXVpcmUoJ2NyeXB0JyksXHJcbiAgICAgIHV0ZjggPSByZXF1aXJlKCdjaGFyZW5jJykudXRmOCxcclxuICAgICAgaXNCdWZmZXIgPSByZXF1aXJlKCdpcy1idWZmZXInKSxcclxuICAgICAgYmluID0gcmVxdWlyZSgnY2hhcmVuYycpLmJpbixcclxuXHJcbiAgLy8gVGhlIGNvcmVcclxuICBtZDUgPSBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xyXG4gICAgLy8gQ29udmVydCB0byBieXRlIGFycmF5XHJcbiAgICBpZiAobWVzc2FnZS5jb25zdHJ1Y3RvciA9PSBTdHJpbmcpXHJcbiAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZW5jb2RpbmcgPT09ICdiaW5hcnknKVxyXG4gICAgICAgIG1lc3NhZ2UgPSBiaW4uc3RyaW5nVG9CeXRlcyhtZXNzYWdlKTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG1lc3NhZ2UgPSB1dGY4LnN0cmluZ1RvQnl0ZXMobWVzc2FnZSk7XHJcbiAgICBlbHNlIGlmIChpc0J1ZmZlcihtZXNzYWdlKSlcclxuICAgICAgbWVzc2FnZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG1lc3NhZ2UsIDApO1xyXG4gICAgZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWVzc2FnZSkgJiYgbWVzc2FnZS5jb25zdHJ1Y3RvciAhPT0gVWludDhBcnJheSlcclxuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UudG9TdHJpbmcoKTtcclxuICAgIC8vIGVsc2UsIGFzc3VtZSBieXRlIGFycmF5IGFscmVhZHlcclxuXHJcbiAgICB2YXIgbSA9IGNyeXB0LmJ5dGVzVG9Xb3JkcyhtZXNzYWdlKSxcclxuICAgICAgICBsID0gbWVzc2FnZS5sZW5ndGggKiA4LFxyXG4gICAgICAgIGEgPSAgMTczMjU4NDE5MyxcclxuICAgICAgICBiID0gLTI3MTczMzg3OSxcclxuICAgICAgICBjID0gLTE3MzI1ODQxOTQsXHJcbiAgICAgICAgZCA9ICAyNzE3MzM4Nzg7XHJcblxyXG4gICAgLy8gU3dhcCBlbmRpYW5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBtW2ldID0gKChtW2ldIDw8ICA4KSB8IChtW2ldID4+PiAyNCkpICYgMHgwMEZGMDBGRiB8XHJcbiAgICAgICAgICAgICAoKG1baV0gPDwgMjQpIHwgKG1baV0gPj4+ICA4KSkgJiAweEZGMDBGRjAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhZGRpbmdcclxuICAgIG1bbCA+Pj4gNV0gfD0gMHg4MCA8PCAobCAlIDMyKTtcclxuICAgIG1bKCgobCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBsO1xyXG5cclxuICAgIC8vIE1ldGhvZCBzaG9ydGN1dHNcclxuICAgIHZhciBGRiA9IG1kNS5fZmYsXHJcbiAgICAgICAgR0cgPSBtZDUuX2dnLFxyXG4gICAgICAgIEhIID0gbWQ1Ll9oaCxcclxuICAgICAgICBJSSA9IG1kNS5faWk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtLmxlbmd0aDsgaSArPSAxNikge1xyXG5cclxuICAgICAgdmFyIGFhID0gYSxcclxuICAgICAgICAgIGJiID0gYixcclxuICAgICAgICAgIGNjID0gYyxcclxuICAgICAgICAgIGRkID0gZDtcclxuXHJcbiAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBtW2krIDBdLCAgNywgLTY4MDg3NjkzNik7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krIDFdLCAxMiwgLTM4OTU2NDU4Nik7XHJcbiAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBtW2krIDJdLCAxNywgIDYwNjEwNTgxOSk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krIDNdLCAyMiwgLTEwNDQ1MjUzMzApO1xyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKyA0XSwgIDcsIC0xNzY0MTg4OTcpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyA1XSwgMTIsICAxMjAwMDgwNDI2KTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsgNl0sIDE3LCAtMTQ3MzIzMTM0MSk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krIDddLCAyMiwgLTQ1NzA1OTgzKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsgOF0sICA3LCAgMTc3MDAzNTQxNik7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krIDldLCAxMiwgLTE5NTg0MTQ0MTcpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKzEwXSwgMTcsIC00MjA2Myk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krMTFdLCAyMiwgLTE5OTA0MDQxNjIpO1xyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKzEyXSwgIDcsICAxODA0NjAzNjgyKTtcclxuICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIG1baSsxM10sIDEyLCAtNDAzNDExMDEpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKzE0XSwgMTcsIC0xNTAyMDAyMjkwKTtcclxuICAgICAgYiA9IEZGKGIsIGMsIGQsIGEsIG1baSsxNV0sIDIyLCAgMTIzNjUzNTMyOSk7XHJcblxyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKyAxXSwgIDUsIC0xNjU3OTY1MTApO1xyXG4gICAgICBkID0gR0coZCwgYSwgYiwgYywgbVtpKyA2XSwgIDksIC0xMDY5NTAxNjMyKTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsxMV0sIDE0LCAgNjQzNzE3NzEzKTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsgMF0sIDIwLCAtMzczODk3MzAyKTtcclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgNV0sICA1LCAtNzAxNTU4NjkxKTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsxMF0sICA5LCAgMzgwMTYwODMpO1xyXG4gICAgICBjID0gR0coYywgZCwgYSwgYiwgbVtpKzE1XSwgMTQsIC02NjA0NzgzMzUpO1xyXG4gICAgICBiID0gR0coYiwgYywgZCwgYSwgbVtpKyA0XSwgMjAsIC00MDU1Mzc4NDgpO1xyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKyA5XSwgIDUsICA1Njg0NDY0MzgpO1xyXG4gICAgICBkID0gR0coZCwgYSwgYiwgYywgbVtpKzE0XSwgIDksIC0xMDE5ODAzNjkwKTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsgM10sIDE0LCAtMTg3MzYzOTYxKTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsgOF0sIDIwLCAgMTE2MzUzMTUwMSk7XHJcbiAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBtW2krMTNdLCAgNSwgLTE0NDQ2ODE0NjcpO1xyXG4gICAgICBkID0gR0coZCwgYSwgYiwgYywgbVtpKyAyXSwgIDksIC01MTQwMzc4NCk7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krIDddLCAxNCwgIDE3MzUzMjg0NzMpO1xyXG4gICAgICBiID0gR0coYiwgYywgZCwgYSwgbVtpKzEyXSwgMjAsIC0xOTI2NjA3NzM0KTtcclxuXHJcbiAgICAgIGEgPSBISChhLCBiLCBjLCBkLCBtW2krIDVdLCAgNCwgLTM3ODU1OCk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krIDhdLCAxMSwgLTIwMjI1NzQ0NjMpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKzExXSwgMTYsICAxODM5MDMwNTYyKTtcclxuICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIG1baSsxNF0sIDIzLCAtMzUzMDk1NTYpO1xyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyAxXSwgIDQsIC0xNTMwOTkyMDYwKTtcclxuICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIG1baSsgNF0sIDExLCAgMTI3Mjg5MzM1Myk7XHJcbiAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBtW2krIDddLCAxNiwgLTE1NTQ5NzYzMik7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krMTBdLCAyMywgLTEwOTQ3MzA2NDApO1xyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKzEzXSwgIDQsICA2ODEyNzkxNzQpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKyAwXSwgMTEsIC0zNTg1MzcyMjIpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKyAzXSwgMTYsIC03MjI1MjE5NzkpO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKyA2XSwgMjMsICA3NjAyOTE4OSk7XHJcbiAgICAgIGEgPSBISChhLCBiLCBjLCBkLCBtW2krIDldLCAgNCwgLTY0MDM2NDQ4Nyk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krMTJdLCAxMSwgLTQyMTgxNTgzNSk7XHJcbiAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBtW2krMTVdLCAxNiwgIDUzMDc0MjUyMCk7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krIDJdLCAyMywgLTk5NTMzODY1MSk7XHJcblxyXG4gICAgICBhID0gSUkoYSwgYiwgYywgZCwgbVtpKyAwXSwgIDYsIC0xOTg2MzA4NDQpO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKyA3XSwgMTAsICAxMTI2ODkxNDE1KTtcclxuICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIG1baSsxNF0sIDE1LCAtMTQxNjM1NDkwNSk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krIDVdLCAyMSwgLTU3NDM0MDU1KTtcclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsxMl0sICA2LCAgMTcwMDQ4NTU3MSk7XHJcbiAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBtW2krIDNdLCAxMCwgLTE4OTQ5ODY2MDYpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKzEwXSwgMTUsIC0xMDUxNTIzKTtcclxuICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIG1baSsgMV0sIDIxLCAtMjA1NDkyMjc5OSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krIDhdLCAgNiwgIDE4NzMzMTMzNTkpO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKzE1XSwgMTAsIC0zMDYxMTc0NCk7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krIDZdLCAxNSwgLTE1NjAxOTgzODApO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKzEzXSwgMjEsICAxMzA5MTUxNjQ5KTtcclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsgNF0sICA2LCAtMTQ1NTIzMDcwKTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsxMV0sIDEwLCAtMTEyMDIxMDM3OSk7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krIDJdLCAxNSwgIDcxODc4NzI1OSk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krIDldLCAyMSwgLTM0MzQ4NTU1MSk7XHJcblxyXG4gICAgICBhID0gKGEgKyBhYSkgPj4+IDA7XHJcbiAgICAgIGIgPSAoYiArIGJiKSA+Pj4gMDtcclxuICAgICAgYyA9IChjICsgY2MpID4+PiAwO1xyXG4gICAgICBkID0gKGQgKyBkZCkgPj4+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNyeXB0LmVuZGlhbihbYSwgYiwgYywgZF0pO1xyXG4gIH07XHJcblxyXG4gIC8vIEF1eGlsaWFyeSBmdW5jdGlvbnNcclxuICBtZDUuX2ZmICA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XHJcbiAgICB2YXIgbiA9IGEgKyAoYiAmIGMgfCB+YiAmIGQpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuICBtZDUuX2dnICA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XHJcbiAgICB2YXIgbiA9IGEgKyAoYiAmIGQgfCBjICYgfmQpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuICBtZDUuX2hoICA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XHJcbiAgICB2YXIgbiA9IGEgKyAoYiBeIGMgXiBkKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9paSAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGMgXiAoYiB8IH5kKSkgKyAoeCA+Pj4gMCkgKyB0O1xyXG4gICAgcmV0dXJuICgobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSkpICsgYjtcclxuICB9O1xyXG5cclxuICAvLyBQYWNrYWdlIHByaXZhdGUgYmxvY2tzaXplXHJcbiAgbWQ1Ll9ibG9ja3NpemUgPSAxNjtcclxuICBtZDUuX2RpZ2VzdHNpemUgPSAxNjtcclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xyXG4gICAgaWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBtZXNzYWdlID09PSBudWxsKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lsbGVnYWwgYXJndW1lbnQgJyArIG1lc3NhZ2UpO1xyXG5cclxuICAgIHZhciBkaWdlc3RieXRlcyA9IGNyeXB0LndvcmRzVG9CeXRlcyhtZDUobWVzc2FnZSwgb3B0aW9ucykpO1xyXG4gICAgcmV0dXJuIG9wdGlvbnMgJiYgb3B0aW9ucy5hc0J5dGVzID8gZGlnZXN0Ynl0ZXMgOlxyXG4gICAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy5hc1N0cmluZyA/IGJpbi5ieXRlc1RvU3RyaW5nKGRpZ2VzdGJ5dGVzKSA6XHJcbiAgICAgICAgY3J5cHQuYnl0ZXNUb0hleChkaWdlc3RieXRlcyk7XHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8haW1wb3J0YW50IFRoaXMgaXMgdGhlIGxpYnJhcnkgZm9yIGNyZWF0aW5nIGF1dGggZGF0YVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jaGVja0F1dGggPSBleHBvcnRzLmVhc3lBdXRoID0gdm9pZCAwO1xudmFyIG1kNSA9IHJlcXVpcmUoXCJtZDVcIik7XG4vLyBjcmVhdGUgdGhlIGFuY2hvciBoaWRkZWluZyBkZWZhdWx0IGRhdGFcbnZhciBjcmVhdG9yID0gZnVuY3Rpb24gKGFuY2hvciwgY2ssIGlzTmV3KSB7XG59O1xuZXhwb3J0cy5lYXN5QXV0aCA9IGNyZWF0b3I7XG4vLyBjaGVjayBhbmNob3IgdG8gZ2V0IGF1dGggbGlzdC4gXG52YXIgY2hlY2sgPSBmdW5jdGlvbiAoYW5jaG9yLCBwcm90b2NvbCwgY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgXCJsaXN0XCI6IG51bGwsXG4gICAgICAgIFwiYW5jaG9yXCI6IG51bGwsIC8vdGFyZ2V0IGFuY2hvciB0byBnZXQgcmVzdWx0XG4gICAgfTtcbiAgICAvL1RPRE8sIGF1dG8gTUQ1IGFuY2hvciBmdW5jdGlvbiBpcyBub3QgdGVzdGVkIHlldC5cbiAgICBpZiAocHJvdG9jb2wuYXV0aCkge1xuICAgICAgICAvLzEuY2hlY2sgd2V0aGVyIHRhcmdldCBhbmNob3IgXG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG9jb2wuYXV0aCA9PT0gXCJzdHJpbmdcIiB8fCBBcnJheS5pc0FycmF5KHByb3RvY29sLmF1dGgpKSB7XG4gICAgICAgICAgICBkYXRhLmFuY2hvciA9IHByb3RvY29sLmF1dGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkYXRhLmxpc3QgPSBwcm90b2NvbC5hdXRoO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLzIuY2hlY2sgZGVmYXVsdCBhbmNob3JcbiAgICAgICAgaWYgKHByb3RvY29sLnNhbHQpIHtcbiAgICAgICAgICAgIGRhdGEuYW5jaG9yID0gbWQ1KGFuY2hvciArIHByb3RvY29sLnNhbHRbMF0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjayAmJiBjayhkYXRhKTtcbn07XG5leHBvcnRzLmNoZWNrQXV0aCA9IGNoZWNrO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyFpbXBvcnRhbnQgVGhpcyBpcyB0aGUgbGlicmFyeSBmb3IgZGVjb2RpbmcgYW5jaG9yIGxpbmtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMubGlua0RlY29kZXIgPSBleHBvcnRzLmxpbmtDcmVhdG9yID0gdm9pZCAwO1xudmFyIHNldHRpbmcgPSB7XG4gICAgXCJjaGVja1wiOiBmYWxzZSxcbiAgICBcInV0ZjhcIjogdHJ1ZSxcbiAgICBcInByZVwiOiBcImFuY2hvcjovL1wiLCAvL3Byb3RvY29sIHByZWZpeFxufTtcbnZhciBzZWxmID0ge1xuICAgIGdldFBhcmFtczogZnVuY3Rpb24gKHN0cikge1xuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBzdHIuc3BsaXQoXCImXCIpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdyA9IGFycltpXTtcbiAgICAgICAgICAgIHZhciBrdiA9IHJvdy5zcGxpdChcIj1cIik7XG4gICAgICAgICAgICBpZiAoa3YubGVuZ3RoICE9PSAyKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHBhcmFtZXRlclwiIH07XG4gICAgICAgICAgICBtYXBba3ZbMF1dID0ga3ZbMV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9LFxuICAgIGNvbWJpbmVQYXJhbXM6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgaWYgKCFvYmopXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGxpc3QucHVzaChcIlwiLmNvbmNhdChrLCBcIj1cIikuY29uY2F0KG9ialtrXSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgcmV0dXJuIGxpc3Quam9pbihcIiZcIik7XG4gICAgfSxcbn07XG52YXIgY3JlYXRvciA9IGZ1bmN0aW9uIChsb2NhbCwgcGFyYW1zKSB7XG4gICAgdmFyIHN0ciA9IHNlbGYuY29tYmluZVBhcmFtcyhwYXJhbXMpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGxvY2FsKSkge1xuICAgICAgICBpZiAobG9jYWxbMV0gIT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChzZXR0aW5nLnByZSkuY29uY2F0KGxvY2FsWzBdLCBcIi9cIikuY29uY2F0KGxvY2FsWzFdKS5jb25jYXQoIXN0ciA/IHN0ciA6IFwiP1wiICsgc3RyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChzZXR0aW5nLnByZSkuY29uY2F0KGxvY2FsWzBdKS5jb25jYXQoIXN0ciA/IHN0ciA6IFwiP1wiICsgc3RyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHNldHRpbmcucHJlKS5jb25jYXQobG9jYWwpLmNvbmNhdCghc3RyID8gc3RyIDogXCI/XCIgKyBzdHIpO1xuICAgIH1cbn07XG5leHBvcnRzLmxpbmtDcmVhdG9yID0gY3JlYXRvcjtcbnZhciBkZWNvZGVyID0gZnVuY3Rpb24gKGxpbmspIHtcbiAgICB2YXIgcmVzID0ge1xuICAgICAgICBsb2NhdGlvbjogW1wiXCIsIDBdLFxuICAgIH07XG4gICAgdmFyIHN0ciA9IGxpbmsudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICB2YXIgcHJlID0gc2V0dGluZy5wcmU7XG4gICAgLy8wLiBmb3JtYXQgY2hlY2tcbiAgICBpZiAoc3RyLmxlbmd0aCA8PSBwcmUubGVuZ3RoICsgMSlcbiAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiaW52YWxpZCBzdHJpbmdcIiB9O1xuICAgIHZhciBoZWFkID0gc3RyLnN1YnN0cmluZygwLCBwcmUubGVuZ3RoKTtcbiAgICBpZiAoaGVhZCAhPT0gcHJlKVxuICAgICAgICByZXR1cm4geyBlcnJvcjogXCJpbnZhbGlkIHByb3RvY29sXCIgfTtcbiAgICAvLzEuIHJlbW92ZSBwcmVmaXggYGFuY2hvcjovL2BcbiAgICB2YXIgYm9keSA9IHN0ci5zdWJzdHJpbmcocHJlLmxlbmd0aCwgc3RyLmxlbmd0aCk7XG4gICAgLy8yLiBjaGVjayBwYXJhbWV0ZXJcbiAgICB2YXIgYXJyID0gYm9keS5zcGxpdChcIj9cIik7XG4gICAgaWYgKGFyci5sZW5ndGggPiAyKVxuICAgICAgICByZXR1cm4geyBlcnJvcjogXCJlcnJvciByZXF1ZXN0LCBwbGVhc2UgY2hlY2sgYW5jaG9yIG5hbWVcIiB9O1xuICAgIHZhciBpc1BhcmFtID0gYXJyLmxlbmd0aCA9PT0gMSA/IGZhbHNlIDogdHJ1ZTtcbiAgICBpZiAoaXNQYXJhbSkge1xuICAgICAgICB2YXIgcHMgPSBzZWxmLmdldFBhcmFtcyhhcnJbMV0pO1xuICAgICAgICBpZiAocHMuZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBwcztcbiAgICAgICAgfVxuICAgICAgICByZXMucGFyYW0gPSBzZWxmLmdldFBhcmFtcyhhcnJbMV0pO1xuICAgIH1cbiAgICBib2R5ID0gYXJyWzBdO1xuICAgIC8vMy4gZGVjb2RlIGFuY2hvciBsb2NhdGlvblxuICAgIHZhciBscyA9IGJvZHkuc3BsaXQoXCIvXCIpO1xuICAgIHZhciBsYXN0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAobHNbaV0gIT09ICcnKVxuICAgICAgICAgICAgbGFzdC5wdXNoKGxzW2ldKTtcbiAgICB9XG4gICAgLy80LiBleHBvcnQgcmVzdWx0XG4gICAgaWYgKGxhc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJlcy5sb2NhdGlvblswXSA9IGxhc3RbMF07XG4gICAgICAgIHJlcy5sb2NhdGlvblsxXSA9IDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgZWxlID0gbGFzdC5wb3AoKTtcbiAgICAgICAgdmFyIGJsb2NrID0gcGFyc2VJbnQoZWxlKTtcbiAgICAgICAgaWYgKGlzTmFOKGJsb2NrKSlcbiAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcImJsb2NrIG51bWJlciBlcnJvclwiIH07XG4gICAgICAgIHJlcy5sb2NhdGlvblsxXSA9IGJsb2NrO1xuICAgICAgICByZXMubG9jYXRpb25bMF0gPSBsYXN0LmpvaW4oJy8nKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn07XG5leHBvcnRzLmxpbmtEZWNvZGVyID0gZGVjb2RlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jaGVja0hpZGUgPSBleHBvcnRzLmVhc3lIaWRlID0gdm9pZCAwO1xudmFyIG1kNSA9IHJlcXVpcmUoXCJtZDVcIik7XG52YXIgY3JlYXRvciA9IGZ1bmN0aW9uIChhbmNob3IpIHtcbn07XG5leHBvcnRzLmVhc3lIaWRlID0gY3JlYXRvcjtcbi8vIGNoZWNrIGFuY2hvciB0byBnZXQgaGlkZSBsaXN0XG52YXIgY2hlY2sgPSBmdW5jdGlvbiAoYW5jaG9yLCBwcm90b2NvbCwgY2spIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgXCJsaXN0XCI6IG51bGwsXG4gICAgICAgIFwiYW5jaG9yXCI6IG51bGwsIC8vdGFyZ2V0IGFuY2hvciB0byBnZXQgcmVzdWx0XG4gICAgfTtcbiAgICAvL1RPRE8sIGF1dG8gTUQ1IGFuY2hvciBmdW5jdGlvbiBpcyBub3QgdGVzdGVkIHlldC5cbiAgICBpZiAocHJvdG9jb2wuaGlkZSkge1xuICAgICAgICAvLzEuY2hlY2sgd2V0aGVyIHRhcmdldCBhbmNob3IgXG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG9jb2wuaGlkZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgZGF0YS5hbmNob3IgPSBwcm90b2NvbC5oaWRlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocHJvdG9jb2wuaGlkZSkpIHtcbiAgICAgICAgICAgIGRhdGEubGlzdCA9IHByb3RvY29sLmhpZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvL2RhdGEubGlzdD1wcm90b2NvbC5oaWRlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLzIuY2hlY2sgZGVmYXVsdCBhbmNob3JcbiAgICAgICAgaWYgKHByb3RvY29sLnNhbHQpIHtcbiAgICAgICAgICAgIGRhdGEuYW5jaG9yID0gbWQ1KGFuY2hvciArIHByb3RvY29sLnNhbHRbMV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjayAmJiBjayhkYXRhKTtcbn07XG5leHBvcnRzLmNoZWNrSGlkZSA9IGNoZWNrO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyFpbXBvcnRhbnQgVGhpcyBpcyB0aGUgVHlwZXNjcmlwdCBpbXBsZW1lbnQgb2YgRXNheSBQcm90b2NvbCB2ZXJzaW9uIDEuMC5cbi8vIWltcG9ydGFudCBFYXN5IFByb3RvY29sIGlzIGEgc2ltcGxlIHByb3RvY29sIHRvIGxhdW5jaCBjQXBwIHZpYSBBbmNob3IgbmV0d29yay5cbi8vIWltcG9ydGFudCBBbGwgZnVuY3Rpb25zIGltcGxlbWVudCwgYnV0IHRoaXMgaW1wbGVtZW50IG9ubHkgc3VwcG9ydCBKUyB3aXRoIENTUyBhcHBsaWNhdGlvbiBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVsYXRlZEluZGV4ID0gZXhwb3J0cy5rZXlzQXBwID0gZXhwb3J0cy5jb2RlVHlwZSA9IGV4cG9ydHMuZm9ybWF0VHlwZSA9IGV4cG9ydHMucmF3VHlwZSA9IGV4cG9ydHMuZXJyb3JMZXZlbCA9IHZvaWQgMDtcbnZhciBlcnJvckxldmVsO1xuKGZ1bmN0aW9uIChlcnJvckxldmVsKSB7XG4gICAgZXJyb3JMZXZlbFtcIkVSUk9SXCJdID0gXCJlcnJvclwiO1xuICAgIGVycm9yTGV2ZWxbXCJXQVJOXCJdID0gXCJ3YXJuaW5nXCI7XG4gICAgZXJyb3JMZXZlbFtcIlVORVhDRVBUXCJdID0gXCJ1bmV4Y2VwdFwiO1xufSkoZXJyb3JMZXZlbCA9IGV4cG9ydHMuZXJyb3JMZXZlbCB8fCAoZXhwb3J0cy5lcnJvckxldmVsID0ge30pKTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKioqKioqKmZvcm1hdCBwYXJ0KioqKioqKioqKi9cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciByYXdUeXBlO1xuKGZ1bmN0aW9uIChyYXdUeXBlKSB7XG4gICAgcmF3VHlwZVtcIkRBVEFcIl0gPSBcImRhdGFcIjtcbiAgICByYXdUeXBlW1wiQVBQXCJdID0gXCJhcHBcIjtcbiAgICByYXdUeXBlW1wiTElCXCJdID0gXCJsaWJcIjtcbiAgICByYXdUeXBlW1wiTk9ORVwiXSA9IFwidW5rbm93XCI7XG59KShyYXdUeXBlID0gZXhwb3J0cy5yYXdUeXBlIHx8IChleHBvcnRzLnJhd1R5cGUgPSB7fSkpO1xudmFyIGZvcm1hdFR5cGU7XG4oZnVuY3Rpb24gKGZvcm1hdFR5cGUpIHtcbiAgICBmb3JtYXRUeXBlW1wiSkFWQVNDUklQVFwiXSA9IFwianNcIjtcbiAgICBmb3JtYXRUeXBlW1wiQ1NTXCJdID0gXCJjc3NcIjtcbiAgICBmb3JtYXRUeXBlW1wiTUFSS0RPV05cIl0gPSBcIm1kXCI7XG4gICAgZm9ybWF0VHlwZVtcIkpTT05cIl0gPSBcImpzb25cIjtcbiAgICBmb3JtYXRUeXBlW1wiTk9ORVwiXSA9IFwiXCI7XG59KShmb3JtYXRUeXBlID0gZXhwb3J0cy5mb3JtYXRUeXBlIHx8IChleHBvcnRzLmZvcm1hdFR5cGUgPSB7fSkpO1xudmFyIGNvZGVUeXBlO1xuKGZ1bmN0aW9uIChjb2RlVHlwZSkge1xuICAgIGNvZGVUeXBlW1wiQVNDSUlcIl0gPSBcImFzY2lpXCI7XG4gICAgY29kZVR5cGVbXCJVVEY4XCJdID0gXCJ1dGY4XCI7XG4gICAgY29kZVR5cGVbXCJIRVhcIl0gPSBcImhleFwiO1xuICAgIGNvZGVUeXBlW1wiTk9ORVwiXSA9IFwiXCI7XG59KShjb2RlVHlwZSA9IGV4cG9ydHMuY29kZVR5cGUgfHwgKGV4cG9ydHMuY29kZVR5cGUgPSB7fSkpO1xudmFyIGtleXNBcHA7XG4oZnVuY3Rpb24gKGtleXNBcHApIHtcbn0pKGtleXNBcHAgPSBleHBvcnRzLmtleXNBcHAgfHwgKGV4cG9ydHMua2V5c0FwcCA9IHt9KSk7XG52YXIgcmVsYXRlZEluZGV4O1xuKGZ1bmN0aW9uIChyZWxhdGVkSW5kZXgpIHtcbiAgICByZWxhdGVkSW5kZXhbcmVsYXRlZEluZGV4W1wiQVVUSFwiXSA9IDBdID0gXCJBVVRIXCI7XG4gICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIkhJREVcIl0gPSAxXSA9IFwiSElERVwiO1xuICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJOQU1FXCJdID0gMF0gPSBcIk5BTUVcIjtcbiAgICByZWxhdGVkSW5kZXhbcmVsYXRlZEluZGV4W1wiQkxPQ0tcIl0gPSAxXSA9IFwiQkxPQ0tcIjtcbn0pKHJlbGF0ZWRJbmRleCA9IGV4cG9ydHMucmVsYXRlZEluZGV4IHx8IChleHBvcnRzLnJlbGF0ZWRJbmRleCA9IHt9KSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyFpbXBvcnRhbnQgVGhpcyBpcyB0aGUgbGlicmFyeSBmb3IgRXNheSBQcm90b2NvbCB2MS4wXG4vLyFpbXBvcnRhbnQgQWxsIGRhdGEgY29tZSBmcm9tIGBBbmNob3IgTGlua2Bcbi8vIWltcG9ydGFudCBUaGlzIGltcGxlbWVudCBleHRlbmQgYGF1dGhgIGFuZCBgaGlkZWAgYnkgc2FsdCB3YXkgdG8gbG9hZCBkYXRhXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmVhc3lSdW4gPSB2b2lkIDA7XG52YXIgcHJvdG9jb2xfMSA9IHJlcXVpcmUoXCIuL3Byb3RvY29sXCIpO1xudmFyIHByb3RvY29sXzIgPSByZXF1aXJlKFwiLi9wcm90b2NvbFwiKTtcbnZhciBkZWNvZGVyXzEgPSByZXF1aXJlKFwiLi9kZWNvZGVyXCIpO1xudmFyIGF1dGhfMSA9IHJlcXVpcmUoXCIuL2F1dGhcIik7XG52YXIgaGlkZV8xID0gcmVxdWlyZShcIi4vaGlkZVwiKTtcbnZhciBfYSA9IHJlcXVpcmUoXCIuLi9saWIvbG9hZGVyXCIpLCBMb2FkZXIgPSBfYS5Mb2FkZXIsIExpYnMgPSBfYS5MaWJzO1xuLy9jb25zdCB7YW5jaG9ySlN9ID1yZXF1aXJlKFwiLi4vbGliL2FuY2hvclwiKTtcbnZhciBBUEkgPSBudWxsO1xudmFyIHNlbGYgPSB7XG4gICAgZ2V0QW5jaG9yOiBmdW5jdGlvbiAobG9jYXRpb24sIGNrKSB7XG4gICAgICAgIGlmIChBUEkgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgIHZhciBhbmNob3IgPSBsb2NhdGlvblswXSwgYmxvY2sgPSBsb2NhdGlvblsxXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgQ2hlY2tpbmcgOiAke0pTT04uc3RyaW5naWZ5KGxvY2F0aW9uKX0gdmlhICR7YWRkcmVzc31gKTtcbiAgICAgICAgaWYgKGJsb2NrICE9PSAwKSB7XG4gICAgICAgICAgICBBUEkuY29tbW9uLnRhcmdldChhbmNob3IsIGJsb2NrLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmlsdGVyQW5jaG9yKGRhdGEsIGNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgQVBJLmNvbW1vbi5sYXRlc3QoYW5jaG9yLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZmlsdGVyQW5jaG9yKGRhdGEsIGNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBmaWx0ZXJBbmNob3I6IGZ1bmN0aW9uIChkYXRhLCBjaykge1xuICAgICAgICBpZiAoIWRhdGEpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBzdWNoIGFuY2hvci5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIGVyciA9IGRhdGE7XG4gICAgICAgIGlmIChlcnIuZXJyb3IpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogZXJyLmVycm9yLCBsZXZlbDogcHJvdG9jb2xfMS5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICB2YXIgYW5jaG9yID0gZGF0YTtcbiAgICAgICAgaWYgKGFuY2hvci5lbXB0eSlcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIkVtcHR5IGFuY2hvci5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgaWYgKCFhbmNob3IucHJvdG9jb2wpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJOby1wcm90b2NvbCBhbmNob3IuXCIgfSk7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IGFuY2hvci5wcm90b2NvbDtcbiAgICAgICAgaWYgKCFwcm90b2NvbC50eXBlKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm90IEVhc3lQcm90b2NvbCBhbmNob3IuXCIgfSk7XG4gICAgICAgIHJldHVybiBjayAmJiBjayhhbmNob3IpO1xuICAgIH0sXG4gICAgZGVjb2RlRGF0YTogZnVuY3Rpb24gKGNPYmplY3QsIGNrKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coYERlY29kZSBkYXRhIGFuY2hvcmApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGNPYmplY3QpO1xuICAgICAgICBjT2JqZWN0LnR5cGUgPSBwcm90b2NvbF8xLnJhd1R5cGUuREFUQTtcbiAgICAgICAgdmFyIGRhdGEgPSBjT2JqZWN0LmRhdGFbXCJcIi5jb25jYXQoY09iamVjdC5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzFdKV07XG4gICAgICAgIHZhciBwcm90b2NvbCA9IGRhdGEucHJvdG9jb2w7XG4gICAgICAgIGlmIChwcm90b2NvbCAhPT0gbnVsbCAmJiBwcm90b2NvbC5jYWxsKSB7XG4gICAgICAgICAgICBjT2JqZWN0LmNhbGwgPSBwcm90b2NvbC5jYWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICB9LFxuICAgIGRlY29kZUFwcDogZnVuY3Rpb24gKGNPYmplY3QsIGNrKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coYERlY29kZSBhcHAgYW5jaG9yYCk7XG4gICAgICAgIGNPYmplY3QudHlwZSA9IHByb3RvY29sXzEucmF3VHlwZS5BUFA7XG4gICAgICAgIHZhciBkYXRhID0gY09iamVjdC5kYXRhW1wiXCIuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY09iamVjdC5sb2NhdGlvblsxXSldO1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSBkYXRhLnByb3RvY29sO1xuICAgICAgICBjT2JqZWN0LmNvZGUgPSBkYXRhLnJhdztcbiAgICAgICAgaWYgKHByb3RvY29sICE9PSBudWxsICYmIHByb3RvY29sLmxpYikge1xuICAgICAgICAgICAgLy9GSVhNRSBjb2RlIHNob3VsZCBiZSBkZWZpbmVkIGNsZWFybHlcbiAgICAgICAgICAgIHNlbGYuZ2V0TGlicyhwcm90b2NvbC5saWIsIGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjb2RlKTtcbiAgICAgICAgICAgICAgICBjT2JqZWN0LmxpYnMgPSBjb2RlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBkZWNvZGVMaWI6IGZ1bmN0aW9uIChjT2JqZWN0LCBjaykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBEZWNvZGUgbGliIGFuY2hvcmApO1xuICAgICAgICBjT2JqZWN0LnR5cGUgPSBwcm90b2NvbF8xLnJhd1R5cGUuTElCO1xuICAgICAgICB2YXIgZGF0YSA9IGNPYmplY3QuZGF0YVtcIlwiLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzBdLCBcIl9cIikuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMV0pXTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gZGF0YS5wcm90b2NvbDtcbiAgICAgICAgLy8xLmNoZWNrIGFuZCBnZXQgbGlic1xuICAgICAgICBpZiAocHJvdG9jb2wgIT09IG51bGwgJiYgcHJvdG9jb2wubGliKSB7XG4gICAgICAgICAgICBzZWxmLmdldExpYnMocHJvdG9jb2wubGliLCBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY29kZSk7XG4gICAgICAgICAgICAgICAgY09iamVjdC5saWJzID0gY29kZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TGliczogZnVuY3Rpb24gKGxpc3QsIGNrKSB7XG4gICAgICAgIGlmIChBUEkgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coYFJlYWR5IHRvIGdldCBsaWJzOiAke0pTT04uc3RyaW5naWZ5KGxpc3QpfWApO1xuICAgICAgICB2YXIgUlBDID0ge1xuICAgICAgICAgICAgc2VhcmNoOiBBUEkuY29tbW9uLmxhdGVzdCxcbiAgICAgICAgICAgIHRhcmdldDogQVBJLmNvbW1vbi50YXJnZXQsXG4gICAgICAgIH07XG4gICAgICAgIExpYnMobGlzdCwgUlBDLCBjayk7XG4gICAgfSxcbiAgICBnZXRIaXN0b3J5OiBmdW5jdGlvbiAobG9jYXRpb24sIGNrKSB7XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgIGlmIChBUEkgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0LCBlcnJzKTtcbiAgICAgICAgfVxuICAgICAgICAvL2lmKEFQST09PW51bGwpIHJldHVybiBjayAmJiBjayh7ZXJyb3I6XCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsbGV2ZWw6ZXJyb3JMZXZlbC5FUlJPUn0pO1xuICAgICAgICB2YXIgYW5jaG9yID0gbG9jYXRpb25bMF0sIGJsb2NrID0gbG9jYXRpb25bMV07XG4gICAgICAgIEFQSS5jb21tb24uaGlzdG9yeShhbmNob3IsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICBpZiAoZXJyLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgZXJycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIGVycnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFsaXN0ID0gcmVzO1xuICAgICAgICAgICAgaWYgKGFsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIkVtcHR5IGhpc3RvcnlcIiB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgZXJycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soYWxpc3QsIGVycnMpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIGNvbWJpbmUgdGhlIGhpZGUgYW5kIGF1dGggbGlzdCB0byByZXN1bHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICBhbmNob3JcdCAgICAvL2BBbmNob3JgIG5hbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gICAgICBwcm90b2NvbCAgICAvL0Vhc3kgUHJvdG9jb2xcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gICAgICBjZmcgICAgICAgICAvL3JldmVyc2VkIGNvbmZpZyBwYXJhbWV0ZXJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSAgICBjayAgICAgICAgICAvL2NhbGxiYWNrLCB3aWxsIHJldHVybiB0aGUgbWVyZ2UgcmVzdWx0LCBpbmNsdWRpbmcgdGhlIHJlbGF0ZWQgYGFuY2hvcmBcbiAgICAgKiAqL1xuICAgIG1lcmdlOiBmdW5jdGlvbiAoYW5jaG9yLCBwcm90b2NvbCwgY2ZnLCBjaykge1xuICAgICAgICBpZiAoQVBJID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8gQVBJIHRvIGdldCBkYXRhLlwiLCBsZXZlbDogcHJvdG9jb2xfMS5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgXCJoaWRlXCI6IFtdLFxuICAgICAgICAgICAgXCJhdXRoXCI6IG51bGwsXG4gICAgICAgICAgICBcImVycm9yXCI6IFtdLFxuICAgICAgICAgICAgXCJpbmRleFwiOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgICAgICBcIm1hcFwiOiB7fSxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG1saXN0ID0gW107XG4gICAgICAgIC8vMS4gY2hlY2sgYGRlY2xhcmVkIGhpZGRlbmAgYW5kIGBhdXRob3JpdHlgIGp1c3QgYnkgcHJvdG9jb2wgZGF0YS5cbiAgICAgICAgKDAsIGF1dGhfMS5jaGVja0F1dGgpKGFuY2hvciwgcHJvdG9jb2wsIGZ1bmN0aW9uIChyZXNBdXRoKSB7XG4gICAgICAgICAgICAoMCwgaGlkZV8xLmNoZWNrSGlkZSkoYW5jaG9yLCBwcm90b2NvbCwgZnVuY3Rpb24gKHJlc0hpZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzQXV0aC5hbmNob3IgPT09IG51bGwgJiYgcmVzSGlkZS5hbmNob3IgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc0F1dGgubGlzdClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5hdXRoID0gcmVzQXV0aC5saXN0O1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzSGlkZS5saXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmhpZGUgPSByZXNIaWRlLmxpc3Q7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNBdXRoLmFuY2hvciA9PT0gbnVsbCAmJiByZXNIaWRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGlkZV9hbmNob3IgPSB0eXBlb2YgcmVzSGlkZS5hbmNob3IgPT09IFwic3RyaW5nXCIgPyBbcmVzSGlkZS5hbmNob3IsIDBdIDogW3Jlc0hpZGUuYW5jaG9yWzBdLCByZXNIaWRlLmFuY2hvclsxXV07XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0QW5jaG9yKGhpZGVfYW5jaG9yLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IGVyci5lcnJvciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY29tYmluZUhpZGUocmVzdWx0LCBkYXRhLCBlcnJzLCBjayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNBdXRoLmFuY2hvciAhPT0gbnVsbCAmJiByZXNIaWRlLmFuY2hvciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXV0aF9hbmNob3IgPSB0eXBlb2YgcmVzQXV0aC5hbmNob3IgPT09IFwic3RyaW5nXCIgPyBbcmVzQXV0aC5hbmNob3IsIDBdIDogW3Jlc0F1dGguYW5jaG9yWzBdLCByZXNBdXRoLmFuY2hvclsxXV07XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0SGlzdG9yeShhdXRoX2FuY2hvciwgZnVuY3Rpb24gKGFsaXN0LCBlcnJzQSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY29tYmluZUF1dGgocmVzdWx0LCBhbGlzdCwgZXJyc0EsIGNrKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc0F1dGguYW5jaG9yICE9PSBudWxsICYmIHJlc0hpZGUuYW5jaG9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoaWRlX2FuY2hvciA9IHR5cGVvZiByZXNIaWRlLmFuY2hvciA9PT0gXCJzdHJpbmdcIiA/IFtyZXNIaWRlLmFuY2hvciwgMF0gOiBbcmVzSGlkZS5hbmNob3JbMF0sIHJlc0hpZGUuYW5jaG9yWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF1dGhfYW5jaG9yXzEgPSB0eXBlb2YgcmVzQXV0aC5hbmNob3IgPT09IFwic3RyaW5nXCIgPyBbcmVzQXV0aC5hbmNob3IsIDBdIDogW3Jlc0F1dGguYW5jaG9yWzBdLCByZXNBdXRoLmFuY2hvclsxXV07XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZ2V0QW5jaG9yKGhpZGVfYW5jaG9yLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IGVyci5lcnJvciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY29tYmluZUhpZGUocmVzdWx0LCBkYXRhLCBlcnJzLCBmdW5jdGlvbiAoY2hSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldEhpc3RvcnkoYXV0aF9hbmNob3JfMSwgZnVuY3Rpb24gKGFsaXN0LCBlcnJzQSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbWJpbmVBdXRoKGNoUmVzdWx0LCBhbGlzdCwgZXJyc0EsIGNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjb21iaW5lSGlkZTogZnVuY3Rpb24gKHJlc3VsdCwgYW5jaG9yLCBlcnJzLCBjaykge1xuICAgICAgICBpZiAoZXJycy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vRklYTUUgY2hhbmdlIHRvIHNpbXBsZSB3YXkgdG8gY29tYmluZSB0aGUgZXJyb3JzLlxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvci5wdXNoKGVycnNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5tYXBbXCJcIi5jb25jYXQoYW5jaG9yLm5hbWUsIFwiX1wiKS5jb25jYXQoYW5jaG9yLmJsb2NrKV0gPSBhbmNob3I7XG4gICAgICAgIHJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFXSA9IFthbmNob3IubmFtZSwgYW5jaG9yLmJsb2NrXTtcbiAgICAgICAgdmFyIGRoaWRlID0gc2VsZi5kZWNvZGVIaWRlQW5jaG9yKGFuY2hvcik7XG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShkaGlkZSkpIHtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvci5wdXNoKGRoaWRlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5oaWRlID0gZGhpZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc3VsdCk7XG4gICAgfSxcbiAgICBjb21iaW5lQXV0aDogZnVuY3Rpb24gKHJlc3VsdCwgbGlzdCwgZXJycywgY2spIHtcbiAgICAgICAgaWYgKGVycnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVycnMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yLnB1c2goZXJyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm93ID0gbGlzdFtpXTtcbiAgICAgICAgICAgIHJlc3VsdC5tYXBbXCJcIi5jb25jYXQocm93Lm5hbWUsIFwiX1wiKS5jb25jYXQocm93LmJsb2NrKV0gPSByb3c7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxhc3QgPSBsaXN0WzBdO1xuICAgICAgICB2YXIgaGxpc3QgPSBbXTsgLy9nZXQgbGF0ZXN0IGF1dGggYW5jaG9yIGhpZGUgbGlzdC5cbiAgICAgICAgc2VsZi5kZWNvZGVBdXRoQW5jaG9yKGxpc3QsIGhsaXN0LCBmdW5jdGlvbiAobWFwLCBhbWFwLCBlcnJzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIGFtYXApXG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1hcFtrXSA9IGFtYXBba107IC8vaWYgaGlkZSBhbmNob3IgZGF0YSwgbWVyZ2UgdG8gcmVzdWx0XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVycnMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICAgICAgcmVzdWx0LmVycm9yLnB1c2goZXJyc1tpXSk7XG4gICAgICAgICAgICByZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSF0gPSBbbGFzdC5uYW1lLCAwXTtcbiAgICAgICAgICAgIHJlc3VsdC5hdXRoID0gbWFwO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVjb2RlSGlkZUFuY2hvcjogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSBvYmoucHJvdG9jb2w7XG4gICAgICAgIGlmICgocHJvdG9jb2wgPT09IG51bGwgfHwgcHJvdG9jb2wgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHByb3RvY29sLmZtdCkgPT09ICdqc29uJykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgcmF3ID0gSlNPTi5wYXJzZShvYmoucmF3KTtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyYXcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmF3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbiA9IHBhcnNlSW50KHJhd1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKG4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiAnZmFpbGVkIHRvIHBhcnNlIEpTT04nIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfSxcbiAgICAvLyFpbXBvcnRhbnQsIGJ5IHVzaW5nIHRoZSBoaXN0b3J5IG9mIGFuY2hvciwgYGhpZGVgIGtleXdvcmQgaXMgc3RpbGwgc3VwcG9ydFxuICAgIC8vIWltcG9ydGFudCwgY2hlY2tpbmcgdGhlIGxhdGVzdCBhbmNob3IgZGF0YSwgdXNpbmcgdGhlIGBoaWRlYCBmZWlsZCB0byBnZXQgZGF0YS5cbiAgICBkZWNvZGVBdXRoQW5jaG9yOiBmdW5jdGlvbiAobGlzdCwgaGxpc3QsIGNrKSB7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFtYXAgPSB7fTtcbiAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgLy9GSVhNRSwgaWYgdGhlIGxhdGVzdCBhdXRoIGFuY2hvciBpcyBoaWRkZW4sbmVlZCB0byBjaGVjayBuZXh0IG9uZS5cbiAgICAgICAgdmFyIGxhc3QgPSBsaXN0WzBdO1xuICAgICAgICBpZiAobGFzdC5wcm90b2NvbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IFwiTm90IHZhbGlkIGFuY2hvclwiIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG1hcCwgYW1hcCwgZXJycyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByb3RvY29sID0gbGFzdC5wcm90b2NvbDtcbiAgICAgICAgc2VsZi5hdXRoSGlkZUxpc3QocHJvdG9jb2wsIGZ1bmN0aW9uIChobGlzdCwgcmVzTWFwLCBoZXJycykge1xuICAgICAgICAgICAgZXJycy5wdXNoLmFwcGx5KGVycnMsIGhlcnJzKTtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gcmVzTWFwKSB7XG4gICAgICAgICAgICAgICAgYW1hcFtrXSA9IHJlc01hcFtrXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBobWFwID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaG1hcFtobGlzdFtpXS50b1N0cmluZygpXSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoaG1hcFtyb3cuYmxvY2sudG9TdHJpbmcoKV0pXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmICghcm93LnByb3RvY29sIHx8IHJvdy5wcm90b2NvbC5mbXQgIT09IHByb3RvY29sXzEuZm9ybWF0VHlwZS5KU09OIHx8IHJvdy5yYXcgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0bWFwID0gSlNPTi5wYXJzZShyb3cucmF3KTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiB0bWFwKVxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwW2tdID0gdG1hcFtrXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBlcnJvciB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobWFwLCBhbWFwLCBlcnJzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvL2NoZWNrIGF1dGggYW5jaG9yJ3MgaGlkZSBsaXN0XG4gICAgYXV0aEhpZGVMaXN0OiBmdW5jdGlvbiAocHJvdG9jb2wsIGNrKSB7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgaWYgKCFwcm90b2NvbC5oaWRlKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIG1hcCwgZXJycyk7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sLmhpZGUpKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHByb3RvY29sLmhpZGUsIG1hcCwgZXJycyk7XG4gICAgICAgIHNlbGYuZ2V0QW5jaG9yKFtwcm90b2NvbC5oaWRlLCAwXSwgZnVuY3Rpb24gKGFuY2hvckgpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSBhbmNob3JIO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJvcikge1xuICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0LCBtYXAsIGVycnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhsaXN0ID0gc2VsZi5kZWNvZGVIaWRlQW5jaG9yKGFuY2hvckgpO1xuICAgICAgICAgICAgdmFyIGVyckggPSBobGlzdDtcbiAgICAgICAgICAgIGlmIChlcnJILmVycm9yKVxuICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnJIKTtcbiAgICAgICAgICAgIHZhciBhbmNob3IgPSBhbmNob3JIO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbmNob3IpO1xuICAgICAgICAgICAgbWFwW1wiXCIuY29uY2F0KGFuY2hvci5uYW1lLCBcIl9cIikuY29uY2F0KGFuY2hvci5ibG9jayldID0gYW5jaG9yO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGhsaXN0LCBtYXAsIGVycnMpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGNoZWNrTGFzdDogZnVuY3Rpb24gKG5hbWUsIGJsb2NrLCBjaykge1xuICAgICAgICBBUEkgPT09IG51bGwgfHwgQVBJID09PSB2b2lkIDAgPyB2b2lkIDAgOiBBUEkuY29tbW9uLm93bmVyKG5hbWUsIGZ1bmN0aW9uIChvd25lciwgbGFzdCkge1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGJsb2NrID09PSBsYXN0ID8gdHJ1ZSA6IGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvL2NoZWNrIHdldGhlciBjdXJyZW50IGFuY2hvciBpcyBpbiB0aGUgaGlkZSBsaXN0XG4gICAgLy9jaGVjayB3ZXRoZXIgbGFzdFxuICAgIGlzVmFsaWRBbmNob3I6IGZ1bmN0aW9uIChoaWRlLCBkYXRhLCBjaywgcGFyYW1zKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2cocGFyYW1zKTtcbiAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgdmFyIGN1ciA9IGRhdGEuYmxvY2s7XG4gICAgICAgIHZhciBvdmVybG9hZCA9IGZhbHNlOyAvL3dldGhlciB0byB0aGUgZW5kIG9mIGBBbmNob3JgIGhpc3RvcnlcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaGlkZSkpIHtcbiAgICAgICAgICAgIHZhciBobGlzdCA9IGhpZGU7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1ciA9PT0gaGxpc3RbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucHJlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJPdXQgb2YgXCIuY29uY2F0KGRhdGEubmFtZSwgXCIgbGltaXRlZFwiKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhudWxsLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld19saW5rID0gKDAsIGRlY29kZXJfMS5saW5rQ3JlYXRvcikoW2RhdGEubmFtZSwgZGF0YS5wcmVdLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobmV3X2xpbmssIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvL0ZJWE1FIGhlcmUgdG8gY2hlY2sgdGhlIGxhdGVzdCBhbmNob3IgZGF0YSB0byBjb25maXJtIHRoZSBoaWRkZW4gbGlzdC5cbiAgICAgICAgICAgIHZhciBoX2xvY2F0aW9uID0gW2hpZGUsIDBdO1xuICAgICAgICAgICAgc2VsZi5nZXRBbmNob3IoaF9sb2NhdGlvbiwgZnVuY3Rpb24gKGhkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IHNlbGYuZGVjb2RlSGlkZUFuY2hvcihoZGF0YSk7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcztcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICB2YXIgaGxpc3QgPSByZXM7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBobGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyID09PSBobGlzdFtpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucHJlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IFwiT3V0IG9mIFwiLmNvbmNhdChkYXRhLm5hbWUsIFwiIGxpbWl0ZWRcIikgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxvYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhudWxsLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3X2xpbmsgPSAoMCwgZGVjb2Rlcl8xLmxpbmtDcmVhdG9yKShbZGF0YS5uYW1lLCBkYXRhLnByZV0sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobmV3X2xpbmssIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycywgb3ZlcmxvYWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vY2hlY2sgdGhlIGF1dGhvcml0eSBiZXR3ZWVuIGFuY2hvcnNcbiAgICBjaGVja0F1dGhvcml0eTogZnVuY3Rpb24gKGNhbGxlciwgYXBwLCBjaykge1xuICAgICAgICAvL3guMS5jaGVjayB0aGUgY2FsbGVkIGFuY2hvciB0eXBlLlxuICAgICAgICBpZiAoYXBwLnR5cGUgIT09IHByb3RvY29sXzEucmF3VHlwZS5BUFApIHtcbiAgICAgICAgICAgIGNhbGxlci5lcnJvci5wdXNoKHsgZXJyb3I6IFwiQW5zd2VyIGlzIG5vdCBjQXBwLlwiIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgLy94LjIuY2hlY2sgdGhlIGF1dGhvcml0eVxuICAgICAgICB2YXIgZnJvbSA9IGNhbGxlci5kYXRhW1wiXCIuY29uY2F0KGNhbGxlci5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjYWxsZXIubG9jYXRpb25bMV0pXTtcbiAgICAgICAgdmFyIHNpZ25lciA9IGZyb20uc2lnbmVyO1xuICAgICAgICB2YXIgYXV0aHMgPSBhcHAuYXV0aDtcbiAgICAgICAgaWYgKGF1dGhzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNhbGxlci5hcHAgPSBhcHA7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzZWxmLmVtcHR5KGF1dGhzKSkge1xuICAgICAgICAgICAgICAgIGNhbGxlci5hcHAgPSBhcHA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoYXV0aHNbc2lnbmVyXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxlci5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm8gYXV0aG9yaXR5IG9mIGNhbGxlci5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0aHNbc2lnbmVyXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgQVBJID09PSBudWxsIHx8IEFQSSA9PT0gdm9pZCAwID8gdm9pZCAwIDogQVBJLmNvbW1vbi5ibG9jayhmdW5jdGlvbiAoYmxvY2ssIGhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhibG9jayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2NrID4gYXV0aHNbc2lnbmVyXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsZXIuZXJyb3IucHVzaCh7IGVycm9yOiBcIkF1dGhvcml0eSBvdXQgb2YgdGltZS5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsZXIuYXBwID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy9nZXQgdGhlIGxhdGVzdCBkZWNhcmVkIGhpZGUgYW5jaG9yIGxpc3QuXG4gICAgZ2V0TGF0ZXN0RGVjbGFyZWRIaWRkZW46IGZ1bmN0aW9uIChsb2NhdGlvbiwgY2spIHtcbiAgICAgICAgc2VsZi5nZXRBbmNob3IoW2xvY2F0aW9uWzBdLCAwXSwgZnVuY3Rpb24gKHJlc0xhdGVzdCkge1xuICAgICAgICAgICAgLy8xLiBmYWlsZGUgdG8gZ2V0IHRoZSBoaWRlIGFuY2hvci5cbiAgICAgICAgICAgIHZhciBlcnIgPSByZXNMYXRlc3Q7XG4gICAgICAgICAgICAvL2lmKGVyci5lcnJvcikgcmV0dXJuIGNrICYmIGNrKGVycik7XG4gICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhbXSk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc0xhdGVzdDtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IGRhdGEucHJvdG9jb2w7XG4gICAgICAgICAgICBpZiAocHJvdG9jb2wgPT09IG51bGwgfHwgIXByb3RvY29sLmhpZGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKFtdKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sLmhpZGUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhwcm90b2NvbC5oaWRlKTtcbiAgICAgICAgICAgIHNlbGYuZ2V0QW5jaG9yKFtwcm90b2NvbC5oaWRlLCAwXSwgZnVuY3Rpb24gKHJlc0hpZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVzTGF0ZXN0O1xuICAgICAgICAgICAgICAgIC8vaWYoZXJyLmVycm9yKSByZXR1cm4gY2sgJiYgY2soZXJyKTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soW10pO1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gcmVzSGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCB8fCAhZGF0YS5yYXcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhbXSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBKU09OLnBhcnNlKGRhdGEucmF3KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IGVycm9yIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIGdldCBwYXJhbXMgZnJvbSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICBhcmdzXHQgICAgLy9TdHJpbmcgc3VjaCBhcyBga2V5X2E9dmFsJmtleV9iPXZhbCZrZXlfYz12YWxgXG4gICAgICogKi9cbiAgICBnZXRQYXJhbXM6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFyciA9IGFyZ3Muc3BsaXQoXCImXCIpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdyA9IGFycltpXTtcbiAgICAgICAgICAgIHZhciBrdiA9IHJvdy5zcGxpdChcIj1cIik7XG4gICAgICAgICAgICBpZiAoa3YubGVuZ3RoICE9PSAyKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHBhcmFtZXRlclwiIH07XG4gICAgICAgICAgICBtYXBba3ZbMF1dID0ga3ZbMV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIGNoZWNrIHdldGhlciBvYmplY3QgZW1wdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gICAgICBvYmpcdCAgICAvL25vcm1hbCBvYmplY3RcbiAgICAgKiAqL1xuICAgIGVtcHR5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxufTtcbnZhciBkZWNvZGVyID0ge307XG5kZWNvZGVyW3Byb3RvY29sXzEucmF3VHlwZS5BUFBdID0gc2VsZi5kZWNvZGVBcHA7XG5kZWNvZGVyW3Byb3RvY29sXzEucmF3VHlwZS5EQVRBXSA9IHNlbGYuZGVjb2RlRGF0YTtcbmRlY29kZXJbcHJvdG9jb2xfMS5yYXdUeXBlLkxJQl0gPSBzZWxmLmRlY29kZUxpYjtcbi8vIWltcG9ydGFudCwgYXMgc3VwcG9ydCBgZGVjbGFyZWQgaGlkZGVuYCwgdGhpcyBmdW5jdGlvbiBtYXkgcmVkaXJlY3QgbWFueSB0aW1lcywgYmUgY2FyZWZ1bC5cbi8qKlxuICogRXhwb3NlZCBtZXRob2Qgb2YgRWFzeSBQcm90b2NvbCBpbXBsZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgIGxpbmtlclx0ICAgIC8vQW5jaG9yIGxpbmtlciwgc3VjaCBhcyBgYW5jaG9yOi8vaGVsbG8vYFxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgaW5wdXRBUEkgICAgLy90aGUgQVBJIG5lZWRlZCB0byBhY2Nlc3MgQW5jaG9yIG5ldHdvcmssIGBhbmNob3JKU2AgbWFpbmx5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSAgICBjayAgICAgICAgICAvL2NhbGxiYWNrLCB3aWxsIHJldHVybiB0aGUgZGVjb2RlZCByZXN1bHRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgIFtmZW5jZV0gICAgIC8vaWYgdHJ1ZSwgdHJlYXQgdGhlIHJ1biByZXN1bHQgYXMgY0FwcC4gVGhlbiBlbmQgb2YgdGhlIGxvb3AuXG4gKiAqL1xudmFyIHJ1biA9IGZ1bmN0aW9uIChsaW5rZXIsIGlucHV0QVBJLCBjaywgaGxpc3QsIGZlbmNlKSB7XG4gICAgaWYgKEFQSSA9PT0gbnVsbCAmJiBpbnB1dEFQSSAhPT0gbnVsbClcbiAgICAgICAgQVBJID0gaW5wdXRBUEk7XG4gICAgdmFyIHRhcmdldCA9ICgwLCBkZWNvZGVyXzEubGlua0RlY29kZXIpKGxpbmtlcik7XG4gICAgaWYgKHRhcmdldC5lcnJvcilcbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKHRhcmdldCk7XG4gICAgLy8wLmdldCB0aGUgbGF0ZXN0IGRlY2xhcmVkIGhpZGRlbiBsaXN0XG4gICAgaWYgKGhsaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuZ2V0TGF0ZXN0RGVjbGFyZWRIaWRkZW4odGFyZ2V0LmxvY2F0aW9uLCBmdW5jdGlvbiAobGFzdEhpZGUpIHtcbiAgICAgICAgICAgIHZhciBjT2JqZWN0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IHByb3RvY29sXzEucmF3VHlwZS5OT05FLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBbdGFyZ2V0LmxvY2F0aW9uWzBdLCB0YXJnZXQubG9jYXRpb25bMV0gIT09IDAgPyB0YXJnZXQubG9jYXRpb25bMV0gOiAwXSxcbiAgICAgICAgICAgICAgICBlcnJvcjogW10sXG4gICAgICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICAgICAgaW5kZXg6IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgcmVzID0gbGFzdEhpZGU7XG4gICAgICAgICAgICBpZiAocmVzLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKHJlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhSZXN1bHQgPSBsYXN0SGlkZTtcbiAgICAgICAgICAgIHJldHVybiBydW4obGlua2VyLCBBUEksIGNrLCBoUmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vMS5kZWNvZGUgdGhlIGBBbmNob3IgTGlua2AsIHByZXBhcmUgdGhlIHJlc3VsdCBvYmplY3QuXG4gICAgdmFyIGNPYmplY3QgPSB7XG4gICAgICAgIHR5cGU6IHByb3RvY29sXzEucmF3VHlwZS5OT05FLFxuICAgICAgICBsb2NhdGlvbjogW3RhcmdldC5sb2NhdGlvblswXSwgdGFyZ2V0LmxvY2F0aW9uWzFdICE9PSAwID8gdGFyZ2V0LmxvY2F0aW9uWzFdIDogMF0sXG4gICAgICAgIGVycm9yOiBbXSxcbiAgICAgICAgZGF0YToge30sXG4gICAgICAgIGluZGV4OiBbbnVsbCwgbnVsbF0sXG4gICAgICAgIGhpZGU6IGhsaXN0LFxuICAgIH07XG4gICAgaWYgKHRhcmdldC5wYXJhbSlcbiAgICAgICAgY09iamVjdC5wYXJhbWV0ZXIgPSB0YXJnZXQucGFyYW07XG4gICAgLy8yLlRyeSB0byBnZXQgdGhlIHRhcmdldCBgQW5jaG9yYCBkYXRhLlxuICAgIHNlbGYuZ2V0QW5jaG9yKHRhcmdldC5sb2NhdGlvbiwgZnVuY3Rpb24gKHJlc0FuY2hvcikge1xuICAgICAgICAvLzIuMS5lcnJvciBoYW5kbGUuXG4gICAgICAgIHZhciBlcnIgPSByZXNBbmNob3I7XG4gICAgICAgIGlmIChlcnIuZXJyb3IpIHtcbiAgICAgICAgICAgIGNPYmplY3QuZXJyb3IucHVzaChlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRhID0gcmVzQW5jaG9yO1xuICAgICAgICBpZiAoY09iamVjdC5sb2NhdGlvblsxXSA9PT0gMClcbiAgICAgICAgICAgIGNPYmplY3QubG9jYXRpb25bMV0gPSBkYXRhLmJsb2NrO1xuICAgICAgICBjT2JqZWN0LmRhdGFbXCJcIi5jb25jYXQoY09iamVjdC5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzFdKV0gPSBkYXRhO1xuICAgICAgICAvLzIuMi5XZXRoZXIgSlNPTiBwcm90b2NvbFxuICAgICAgICBpZiAoZGF0YS5wcm90b2NvbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm8gdmFsaWQgcHJvdG9jb2xcIiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAvLzIuMy5XZXRoZXIgRWFzeSBQcm90b2NvbFxuICAgICAgICB2YXIgdHlwZSA9ICFkYXRhLnByb3RvY29sLnR5cGUgPyBcIlwiIDogZGF0YS5wcm90b2NvbC50eXBlO1xuICAgICAgICBpZiAoIWRlY29kZXJbdHlwZV0pIHtcbiAgICAgICAgICAgIGNPYmplY3QuZXJyb3IucHVzaCh7IGVycm9yOiBcIk5vdCBlYXN5IHByb3RvY29sIHR5cGVcIiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAvLzMuIGNoZWNrIHdldGhlciB0aGUgbGF0ZXN0IGFuY2hvci4gSWYgbm90LCBuZWVkIHRvIGdldCBsYXRlc3QgaGlkZSBkYXRhLlxuICAgICAgICBpZiAoZGF0YS5wcm90b2NvbCkge1xuICAgICAgICAgICAgc2VsZi5pc1ZhbGlkQW5jaG9yKGhsaXN0LCBkYXRhLCBmdW5jdGlvbiAodmFsaWRMaW5rLCBlcnJzLCBvdmVybG9hZCkge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAoX2EgPSBjT2JqZWN0LmVycm9yKS5wdXNoLmFwcGx5KF9hLCBlcnJzKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmxvYWQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAodmFsaWRMaW5rICE9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnVuKHZhbGlkTGluaywgQVBJLCBjaywgaGxpc3QpO1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHQodHlwZSk7XG4gICAgICAgICAgICB9LCBjT2JqZWN0LnBhcmFtZXRlciA9PT0gdW5kZWZpbmVkID8ge30gOiBjT2JqZWN0LnBhcmFtZXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmVzdWx0KHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vaW5saW5lIGZ1bmN0aW9uIHRvIGF2b2lkIHRoZSByZXBldGl0aXZlIGNvZGUuXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlc3VsdCh0eXBlKSB7XG4gICAgICAgICAgICBzZWxmLm1lcmdlKGRhdGEubmFtZSwgZGF0YS5wcm90b2NvbCwge30sIGZ1bmN0aW9uIChtZXJnZVJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuYXV0aCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgY09iamVjdC5hdXRoID0gbWVyZ2VSZXN1bHQuYXV0aDtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaGlkZSAhPSBudWxsICYmIG1lcmdlUmVzdWx0LmhpZGUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuaGlkZSA9IG1lcmdlUmVzdWx0LmhpZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5lcnJvci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgKF9hID0gY09iamVjdC5lcnJvcikucHVzaC5hcHBseShfYSwgbWVyZ2VSZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSF0gIT09IG51bGwgJiYgY09iamVjdC5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkFVVEhdID0gbWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFXSAhPT0gbnVsbCAmJiBjT2JqZWN0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguSElERV0gPSBtZXJnZVJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBtZXJnZVJlc3VsdC5tYXApIHtcbiAgICAgICAgICAgICAgICAgICAgY09iamVjdC5kYXRhW2tdID0gbWVyZ2VSZXN1bHQubWFwW2tdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2Rlclt0eXBlXShjT2JqZWN0LCBmdW5jdGlvbiAocmVzRmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc0ZpcnN0LmNhbGwgJiYgIWZlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXBwX2xpbmsgPSAoMCwgZGVjb2Rlcl8xLmxpbmtDcmVhdG9yKShyZXNGaXJzdC5jYWxsLCByZXNGaXJzdC5wYXJhbWV0ZXIgPT09IHVuZGVmaW5lZCA/IHt9IDogcmVzRmlyc3QucGFyYW1ldGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBydW4oYXBwX2xpbmssIEFQSSwgZnVuY3Rpb24gKHJlc0FwcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNoZWNrQXV0aG9yaXR5KHJlc0ZpcnN0LCByZXNBcHAsIGNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGhsaXN0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXNGaXJzdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuZXhwb3J0cy5lYXN5UnVuID0gcnVuO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9