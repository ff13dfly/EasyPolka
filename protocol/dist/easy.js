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

/***/ "./src/interpreter.ts":
/*!****************************!*\
  !*** ./src/interpreter.ts ***!
  \****************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_0__, __WEBPACK_LOCAL_MODULE_0__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_1__, __WEBPACK_LOCAL_MODULE_1__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_2__, __WEBPACK_LOCAL_MODULE_2__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_LOCAL_MODULE_4__, __WEBPACK_LOCAL_MODULE_4__exports;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_LOCAL_MODULE_0__ = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.relatedIndex = exports.keysApp = exports.codeType = exports.formatType = exports.rawType = exports.errorLevel = void 0;
    var errorLevel;
    (function (errorLevel) {
        errorLevel["ERROR"] = "error";
        errorLevel["WARN"] = "warning";
        errorLevel["UNEXCEPT"] = "unexcept";
    })(errorLevel = exports.errorLevel || (exports.errorLevel = {}));
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
}).apply(__WEBPACK_LOCAL_MODULE_0__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_0__ === undefined && (__WEBPACK_LOCAL_MODULE_0__ = __WEBPACK_LOCAL_MODULE_0__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_LOCAL_MODULE_1__ = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.checkAuth = exports.easyAuth = void 0;
    var md5 = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
    var creator = function (anchor, ck, isNew) {
    };
    exports.easyAuth = creator;
    var check = function (anchor, protocol, ck) {
        var data = {
            "list": null,
            "anchor": null,
        };
        if (protocol.auth) {
            if (typeof protocol.auth === "string" || Array.isArray(protocol.auth)) {
                data.anchor = protocol.auth;
            }
            else {
                data.list = protocol.auth;
            }
        }
        else {
            if (protocol.salt) {
                data.anchor = md5(anchor + protocol.salt[0]);
            }
        }
        return ck && ck(data);
    };
    exports.checkAuth = check;
}).apply(__WEBPACK_LOCAL_MODULE_1__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_1__ === undefined && (__WEBPACK_LOCAL_MODULE_1__ = __WEBPACK_LOCAL_MODULE_1__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_LOCAL_MODULE_2__ = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.linkDecoder = exports.linkCreator = void 0;
    var setting = {
        "check": false,
        "utf8": true,
        "pre": "anchor://",
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
    var decoder = function (link, cfg) {
        var res = {
            location: ["", 0],
        };
        var str = link.toLocaleLowerCase();
        var pre = setting.pre;
        if (str.length <= pre.length + 1)
            return { error: "invalid string" };
        var head = str.substring(0, pre.length);
        if (head !== pre)
            return { error: "invalid protocol" };
        var body = str.substring(pre.length, str.length);
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
        var ls = body.split("/");
        var last = [];
        for (var i = 0; i < ls.length; i++) {
            if (ls[i] !== '')
                last.push(ls[i]);
        }
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
}).apply(__WEBPACK_LOCAL_MODULE_2__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_2__ === undefined && (__WEBPACK_LOCAL_MODULE_2__ = __WEBPACK_LOCAL_MODULE_2__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __WEBPACK_LOCAL_MODULE_0__], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.easyProtocol = void 0;
    var format = function (type, cfg) {
        var protocol;
        switch (type) {
            case protocol_1.rawType.APP:
                protocol = {
                    "type": protocol_1.rawType.APP,
                    "fmt": protocol_1.formatType.JAVASCRIPT,
                    "ver": "1.0.0",
                };
                if (cfg && cfg.auth)
                    protocol.auth = cfg.auth;
                if (cfg && cfg.lib)
                    protocol.lib = cfg.lib;
                if (cfg && cfg.ver)
                    protocol.ver = cfg.ver;
                break;
            case protocol_1.rawType.DATA:
                protocol = {
                    "type": protocol_1.rawType.DATA,
                    "fmt": protocol_1.formatType.NONE,
                };
                if (cfg && cfg.fmt)
                    protocol.fmt = cfg.fmt;
                if (cfg && cfg.code)
                    protocol.code = cfg.code;
                if (cfg && cfg.auth)
                    protocol.auth = cfg.auth;
                if (cfg && cfg.call)
                    protocol.call = cfg.call;
                break;
            case protocol_1.rawType.LIB:
                protocol = {
                    "type": protocol_1.rawType.LIB,
                    "fmt": protocol_1.formatType.NONE,
                    "ver": "1.0.0",
                };
                break;
            default:
                protocol = {
                    "type": protocol_1.rawType.DATA,
                    "fmt": protocol_1.formatType.NONE,
                };
                break;
        }
        return protocol;
    };
    exports.easyProtocol = format;
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_LOCAL_MODULE_4__ = (function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.checkHide = exports.easyHide = void 0;
    var md5 = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
    var creator = function (anchor) {
    };
    exports.easyHide = creator;
    var check = function (anchor, protocol, ck) {
        var data = {
            "list": null,
            "anchor": null,
        };
        if (protocol.hide) {
            if (typeof protocol.hide === "string") {
                data.anchor = protocol.hide;
            }
            else if (Array.isArray(protocol.hide)) {
                data.list = protocol.hide;
            }
            else {
            }
        }
        else {
            if (protocol.salt) {
                data.anchor = md5(anchor + protocol.salt[1]);
            }
        }
        return ck && ck(data);
    };
    exports.checkHide = check;
}).apply(__WEBPACK_LOCAL_MODULE_4__exports = {}, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_LOCAL_MODULE_4__ === undefined && (__WEBPACK_LOCAL_MODULE_4__ = __WEBPACK_LOCAL_MODULE_4__exports));
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports, __WEBPACK_LOCAL_MODULE_0__, __WEBPACK_LOCAL_MODULE_0__, __WEBPACK_LOCAL_MODULE_2__, __WEBPACK_LOCAL_MODULE_1__, __WEBPACK_LOCAL_MODULE_4__], __WEBPACK_AMD_DEFINE_RESULT__ = (function (require, exports, protocol_2, protocol_3, decoder_1, auth_1, hide_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", ({ value: true }));
    exports.easyRun = void 0;
    var _a = __webpack_require__(/*! ../lib/loader */ "./lib/loader.js"), Loader = _a.Loader, Libs = _a.Libs;
    var API = null;
    var self = {
        getAnchor: function (location, ck) {
            if (API === null)
                return ck && ck({ error: "No API to get data.", level: protocol_2.errorLevel.ERROR });
            var anchor = location[0], block = location[1];
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
                return ck && ck({ error: "No such anchor.", level: protocol_2.errorLevel.ERROR });
            var err = data;
            if (err.error)
                return ck && ck({ error: err.error, level: protocol_2.errorLevel.ERROR });
            var anchor = data;
            if (anchor.empty)
                return ck && ck({ error: "Empty anchor.", level: protocol_2.errorLevel.ERROR });
            if (!anchor.protocol)
                return ck && ck({ error: "No-protocol anchor." });
            var protocol = anchor.protocol;
            if (!protocol.type)
                return ck && ck({ error: "Not EasyProtocol anchor." });
            return ck && ck(anchor);
        },
        decodeData: function (cObject, ck) {
            console.log("Decode data anchor");
            cObject.type = protocol_2.rawType.DATA;
            var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
            var protocol = data.protocol;
            if (protocol !== null && protocol.call) {
                cObject.call = protocol.call;
            }
            return ck && ck(cObject);
        },
        decodeApp: function (cObject, ck) {
            console.log("Decode app anchor");
            cObject.type = protocol_2.rawType.APP;
            var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
            var protocol = data.protocol;
            cObject.code = data.raw;
            if (protocol !== null && protocol.lib) {
                self.getLibs(protocol.lib, function (code) {
                    cObject.libs = code;
                    return ck && ck(cObject);
                });
            }
            else {
                return ck && ck(cObject);
            }
        },
        decodeLib: function (cObject, ck) {
            console.log("Decode lib anchor");
            cObject.type = protocol_2.rawType.LIB;
            var data = cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])];
            var protocol = data.protocol;
            if (protocol !== null && protocol.lib) {
                self.getLibs(protocol.lib, function (code) {
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
                return ck && ck({ error: "No API to get data.", level: protocol_2.errorLevel.ERROR });
            console.log("Ready to get libs: ".concat(JSON.stringify(list)));
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
                errs.push({ error: "No API to get data.", level: protocol_2.errorLevel.ERROR });
                return ck && ck(list, errs);
            }
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
        merge: function (anchor, protocol, cfg, ck) {
            if (API === null)
                return ck && ck({ error: "No API to get data.", level: protocol_2.errorLevel.ERROR });
            var result = {
                "hide": [],
                "auth": null,
                "error": [],
                "index": [null, null],
                "map": {},
            };
            var mlist = [];
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
                for (var i = 0; i < errs.length; i++)
                    result.error.push(errs[i]);
            }
            result.map["".concat(anchor.name, "_").concat(anchor.block)] = anchor;
            result.index[protocol_3.relatedIndex.HIDE] = [anchor.name, anchor.block];
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
            var hlist = [];
            self.decodeAuthAnchor(list, hlist, function (map, amap, errs) {
                for (var k in amap)
                    result.map[k] = amap[k];
                for (var i = 0; i < errs.length; i++)
                    result.error.push(errs[i]);
                result.index[protocol_3.relatedIndex.AUTH] = [last.name, 0];
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
        decodeAuthAnchor: function (list, hlist, ck) {
            var map = {};
            var amap = {};
            var errs = [];
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
                    if (!row.protocol || row.protocol.fmt !== protocol_2.formatType.JSON || row.raw === null)
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
                map["".concat(anchor.name, "_").concat(anchor.block)] = anchor;
                return ck && ck(hlist, map, errs);
            });
        },
        isValidAnchor: function (hide, data, ck, params) {
            console.log(params);
            var errs = [];
            var cur = data.block;
            var overload = false;
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
        checkAuthority: function (caller, app, ck) {
            if (app.type !== protocol_2.rawType.APP) {
                caller.error.push({ error: "Answer is not cApp." });
                return ck && ck(caller);
            }
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
        empty: function (obj) {
            for (var k in obj) {
                return false;
            }
            return true;
        },
    };
    var decoder = {};
    decoder[protocol_2.rawType.APP] = self.decodeApp;
    decoder[protocol_2.rawType.DATA] = self.decodeData;
    decoder[protocol_2.rawType.LIB] = self.decodeLib;
    var run = function (linker, inputAPI, ck, fence) {
        if (API === null && inputAPI !== null)
            API = inputAPI;
        var target = (0, decoder_1.linkDecoder)(linker);
        if (target.error)
            return ck && ck(target);
        var cObject = {
            type: protocol_2.rawType.NONE,
            location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
            error: [],
            data: {},
            index: [null, null],
        };
        if (target.param)
            cObject.parameter = target.param;
        console.log(target);
        self.getAnchor(target.location, function (resAnchor) {
            var err = resAnchor;
            if (err.error) {
                cObject.error.push(err);
                return ck && ck(cObject);
            }
            var data = resAnchor;
            if (cObject.location[1] === 0)
                cObject.location[1] = data.block;
            cObject.data["".concat(cObject.location[0], "_").concat(cObject.location[1])] = data;
            if (data.protocol === null) {
                cObject.error.push({ error: "No valid protocol" });
                return ck && ck(cObject);
            }
            var type = !data.protocol.type ? "" : data.protocol.type;
            if (!decoder[type]) {
                cObject.error.push({ error: "Not easy protocol type" });
                return ck && ck(cObject);
            }
            if (data.protocol && data.protocol.hide !== undefined) {
                self.isValidAnchor(data.protocol.hide, data, function (validLink, errs, overload) {
                    var _a;
                    (_a = cObject.error).push.apply(_a, errs);
                    if (overload)
                        return ck && ck(cObject);
                    if (validLink !== null)
                        return run(validLink, API, ck);
                    return getResult(type);
                }, cObject.parameter === undefined ? {} : cObject.parameter);
            }
            else {
                return getResult(type);
            }
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
                    if (mergeResult.index[protocol_3.relatedIndex.AUTH] !== null && cObject.index) {
                        cObject.index[protocol_3.relatedIndex.AUTH] = mergeResult.index[protocol_3.relatedIndex.AUTH];
                    }
                    if (mergeResult.index[protocol_3.relatedIndex.HIDE] !== null && cObject.index) {
                        cObject.index[protocol_3.relatedIndex.HIDE] = mergeResult.index[protocol_3.relatedIndex.HIDE];
                    }
                    for (var k in mergeResult.map) {
                        cObject.data[k] = mergeResult.map[k];
                    }
                    return decoder[type](cObject, function (resFirst) {
                        if (resFirst.call && !fence) {
                            var app_link = (0, decoder_1.linkCreator)(resFirst.call, resFirst.parameter === undefined ? {} : resFirst.parameter);
                            run(app_link, API, function (resApp) {
                                return self.checkAuthority(resFirst, resApp, ck);
                            }, true);
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
}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/interpreter.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJIQUEySDtBQUMzSDtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBLFNBQVM7QUFDVDtBQUNBLElBQUksZUFBZTtBQUNuQixDQUFDO0FBQUEsa0dBQUM7Ozs7Ozs7VUMzdEJGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9saWIvbG9hZGVyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jaGFyZW5jL2NoYXJlbmMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NyeXB0L2NyeXB0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9pcy1idWZmZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL21kNS9tZDUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVycHJldGVyLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsibGV0IHNlYXJjaD1udWxsO1xubGV0IHRhcmdldD1udWxsO1xuY29uc3Qgc2VsZj17XG4gICAgZ2V0TGliczoobGlzdCxjayxjYWNoZSxvcmRlcik9PntcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgU3RhcnQ6JHtKU09OLnN0cmluZ2lmeShsaXN0KX1gKTtcbiAgICAgICAgaWYoIWNhY2hlKSBjYWNoZT17fTtcbiAgICAgICAgaWYoIW9yZGVyKSBvcmRlcj1bXTtcbiAgICAgICAgY29uc3Qgcm93PWxpc3Quc2hpZnQoKTtcbiAgICAgICAgY29uc3QgYW5jaG9yPShBcnJheS5pc0FycmF5KHJvdyk/cm93WzBdOnJvdykudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgYmxvY2s9QXJyYXkuaXNBcnJheShyb3cpP3Jvd1sxXTowO1xuXG4gICAgICAgIC8vMS5jaGVjayBsaWIgbG9hZGluZyBzdGF0dXNcbiAgICAgICAgaWYoY2FjaGVbYW5jaG9yXSkgcmV0dXJuIHNlbGYuZ2V0TGlicyhsaXN0LGNrLGNhY2hlLG9yZGVyKTtcblxuICAgICAgICAvLzIuZ2V0IHRhcmdldCBhbmNob3JcbiAgICAgICAgc2VsZi5nZXRBbmNob3IoYW5jaG9yLGJsb2NrLChhbixyZXMpPT57XG4gICAgICAgICAgICBjYWNoZVthbl09IXJlcz97ZXJyb3I6J25vIHN1Y2ggYW5jaG9yJ306cmVzO1xuICAgICAgICAgICAgaWYoIXJlcy5wcm90b2NvbCB8fCAoIXJlcy5wcm90b2NvbC5leHQgJiYgIXJlcy5wcm90b2NvbC5saWIpKXtcbiAgICAgICAgICAgICAgICBvcmRlci5wdXNoKGFuKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1PXtcbiAgICAgICAgICAgICAgICAgICAgZW50cnk6YW4sXG4gICAgICAgICAgICAgICAgICAgIGxpYjpyZXMucHJvdG9jb2wgJiYgcmVzLnByb3RvY29sLmxpYj9yZXMucHJvdG9jb2wubGliOltdLFxuICAgICAgICAgICAgICAgICAgICBleHQ6cmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5leHQ/cmVzLnByb3RvY29sLmV4dDpbXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9yZGVyLnB1c2gocXUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXMucHJvdG9jb2wgJiYgcmVzLnByb3RvY29sLmV4dCl7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpPXJlcy5wcm90b2NvbC5leHQubGVuZ3RoO2k+MDtpLS0pIGxpc3QudW5zaGlmdChyZXMucHJvdG9jb2wuZXh0W2ktMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5saWIpe1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT1yZXMucHJvdG9jb2wubGliLmxlbmd0aDtpPjA7aS0tKSBsaXN0LnVuc2hpZnQocmVzLnByb3RvY29sLmxpYltpLTFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYobGlzdC5sZW5ndGg9PT0wKSByZXR1cm4gY2sgJiYgY2soY2FjaGUsb3JkZXIpO1xuICAgICAgICAgICAgc2VsZi5nZXRMaWJzKGxpc3QsY2ssY2FjaGUsb3JkZXIpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGdldEFuY2hvcjooYW5jaG9yLGJsb2NrLGNrKT0+e1xuICAgICAgICBpZighYW5jaG9yKSByZXR1cm4gY2sgJiYgY2soYW5jaG9yLCcnKTtcbiAgICAgICAgY29uc3QgZnVuPWJsb2NrPT09MD9zZWFyY2g6dGFyZ2V0O1xuICAgICAgICBmdW4oYW5jaG9yLCAocmVzKT0+e1xuICAgICAgICAgICAgaWYoIXJlcyB8fCAoIXJlcy5vd25lcikpIHJldHVybiBjayAmJiBjayhhbmNob3IsJycpO1xuICAgICAgICAgICAgaWYoIXJlcy5lbXB0eSl7XG4gICAgICAgICAgICAgICAgIGNvbnN0IGR0PXtcbiAgICAgICAgICAgICAgICAgICAga2V5OnJlcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICByYXc6cmVzLnJhdyxcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2w6cmVzLnByb3RvY29sLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGFuY2hvcixkdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZGVjb2RlTGliOihkdCk9PntcbiAgICAgICAgY29uc3QgcmVzdWx0PXt0eXBlOidlcnJvcicsZGF0YTonJ307XG4gICAgICAgIGlmKGR0LmVycm9yKXtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcj1kdC5lcnJvcjtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZighZHQucHJvdG9jb2wpe1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yPSdVbmV4Y2VwdCBkYXRhIGZvcm1hdCc7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvdG89ZHQucHJvdG9jb2w7XG4gICAgICAgIGlmKCFwcm90by5mbXQpe1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yPSdBbmNob3IgZm9ybWF0IGxvc3QnO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQudHlwZT1wcm90by5mbXQ7XG5cbiAgICAgICAgLy9zb2x2ZSByYXcgcHJvYmxlbTsgaGV4IHRvIGFzY2lpXG4gICAgICAgIGlmKGR0LnJhdy5zdWJzdHIoMCwgMikudG9Mb3dlckNhc2UoKT09PScweCcpe1xuICAgICAgICAgICAgcmVzdWx0LmRhdGE9ZGVjb2RlVVJJQ29tcG9uZW50KGR0LnJhdy5zbGljZSgyKS5yZXBsYWNlKC9cXHMrL2csICcnKS5yZXBsYWNlKC9bMC05YS1mXXsyfS9nLCAnJSQmJykpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc3VsdC5kYXRhPWR0LnJhdztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgXG4gICAgZ2V0Q29tcGxleE9yZGVyOihuYW1lLG1hcCxxdWV1ZSxob2xkKT0+e1xuICAgICAgICBpZighcXVldWUpIHF1ZXVlPVtdOyAgICAgICAgLy/ojrflj5bnmoRcbiAgICAgICAgaWYoIWhvbGQpIGhvbGQ9W107ICAgICAgICAgIC8vMS7nlKjmnaXooajovr7lpITnkIbnirbmgIFcblxuICAgICAgICBpZihtYXBbbmFtZV09PT10cnVlICYmIGhvbGQubGVuZ3RoPT09MCkgcmV0dXJuIHF1ZXVlO1xuICAgICAgICBjb25zdCByb3c9bWFwW25hbWVdO1xuXG4gICAgICAgIGNvbnN0IGxhc3Q9aG9sZC5sZW5ndGghPT0wP2hvbGRbaG9sZC5sZW5ndGgtMV06bnVsbDtcbiAgICAgICAgY29uc3QgcmVjb3Zlcj0obGFzdCE9PW51bGwmJmxhc3QubmFtZT09PW5hbWUpP2hvbGQucG9wKCk6bnVsbDtcblxuICAgICAgICAvLzEuY2hlY2sgbGliIGNvbXBsZXg7XG4gICAgICAgIGlmKHJvdy5saWIgJiYgcm93LmxpYi5sZW5ndGg+MCl7XG4gICAgICAgICAgICBpZihyZWNvdmVyPT09bnVsbCl7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxyb3cubGliLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaWI9cm93LmxpYltpXTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygncmVhZHkgdG8gY2hlY2sgbGliOicrbGliKTtcbiAgICAgICAgICAgICAgICAgICAgaWYobWFwW2xpYl09PT10cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gobGliKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBob2xkLnB1c2goe2xpYjppLG5hbWU6bmFtZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Q29tcGxleE9yZGVyKGxpYixtYXAscXVldWUsaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBpZihyZWNvdmVyLmxpYiE9PXVuZGVmaW5lZCAmJiByZWNvdmVyLmxpYiE9PXJvdy5saWIubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPXJlY292ZXIubGliKzE7aTxyb3cubGliLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGliPXJvdy5saWJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdyZWFkeSB0byBjaGVjayBsaWI6JytsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYobWFwW2xpYl09PT10cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGxpYik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob2xkLnB1c2goe2xpYjppLG5hbWU6bmFtZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihsaWIsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYocmVjb3Zlcj09PW51bGwpIHF1ZXVlLnB1c2gobmFtZSk7XG5cbiAgICAgICAgLy8yLmNoZWNrIGV4dGVuZCBjb21wbGV4O1xuICAgICAgICBpZihyb3cuZXh0ICYmIHJvdy5leHQubGVuZ3RoPjApe1xuICAgICAgICAgICAgaWYocmVjb3ZlciE9PW51bGwpe1xuICAgICAgICAgICAgICAgIGlmKHJlY292ZXIuZXh0IT09dW5kZWZpbmVkICYmIHJlY292ZXIuZXh0IT09cm93LmV4dC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9cmVjb3Zlci5leHQrMTtpPHJvdy5leHQubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHQ9cm93LmV4dFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1hcFtleHRdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtleHQ6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIoZXh0LG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cm93LmV4dC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0PXJvdy5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmKG1hcFtleHRdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtleHQ6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihleHQsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoaG9sZC5sZW5ndGghPT0wKXtcbiAgICAgICAgICAgIGNvbnN0IGxhc3Q9aG9sZFtob2xkLmxlbmd0aC0xXTtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihsYXN0Lm5hbWUsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHF1ZXVlO1xuICAgIH0sXG4gICAgbWVyZ2VPcmRlcjoob3JkZXIpPT57XG4gICAgICAgIGNvbnN0IGNvbXBsZXg9e307XG4gICAgICAgIGNvbnN0IG1hcD17fTtcbiAgICAgICAgY29uc3QgZG9uZT17fTtcbiAgICAgICAgY29uc3QgcXVldWU9W107XG4gICAgICAgIGZvcihsZXQgaT0wO2k8b3JkZXIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBjb25zdCByb3c9b3JkZXJbaV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJvdyAhPT0gJ3N0cmluZycgJiYgcm93LmVudHJ5IT09dW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICBjb21wbGV4W3Jvdy5lbnRyeV09dHJ1ZTtcbiAgICAgICAgICAgICAgICBtYXBbcm93LmVudHJ5XT1yb3c7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBtYXBbcm93XT10cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yKGxldCBpPTA7aTxvcmRlci5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGNvbnN0IHJvdz1vcmRlcltpXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm93ID09PSAnc3RyaW5nJyB8fCByb3cgaW5zdGFuY2VvZiBTdHJpbmcpe1xuICAgICAgICAgICAgICAgIGlmKGRvbmVbcm93XSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgIGRvbmVbcm93XT10cnVlO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgLy8yLmNvbXBsZXggbGliXG4gICAgICAgICAgICAgICAgLy8yLjEuYWRkIHJlcXVpcmVkIGxpYnNcbiAgICAgICAgICAgICAgICBpZihyb3cubGliICYmIHJvdy5saWIubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPHJvdy5saWIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaWI9cm93LmxpYltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmVbbGliXSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjb21wbGV4W2xpYl0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNxdWV1ZT1zZWxmLmdldENvbXBsZXhPcmRlcihsaWIsbWFwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsaWJ9OiR7SlNPTi5zdHJpbmdpZnkoY3F1ZXVlKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaj0wO2o8Y3F1ZXVlLmxlbmd0aDtqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGliPWNxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZVtjbGliXSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY2xpYik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVbY2xpYl09dHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGxpYik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZVtsaWJdPXRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8yLjIuYWRkIGxpYiBib2R5XG4gICAgICAgICAgICAgICAgaWYoIWRvbmVbcm93LmVudHJ5XSl7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gocm93LmVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZVtyb3cuZW50cnldPXRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8yLjMuYWRkIHJlcXVpcmVkIGV4dGVuZCBwbHVnaW5zXG4gICAgICAgICAgICAgICAgaWYocm93LmV4dCAmJiByb3cuZXh0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxyb3cuZXh0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0PXJvdy5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lW2V4dF0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY29tcGxleFtleHRdKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcXVldWU9c2VsZi5nZXRDb21wbGV4T3JkZXIoZXh0LG1hcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqPTA7ajxjcXVldWUubGVuZ3RoO2orKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNleHQ9Y3F1ZXVlW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lW2NleHRdKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChjZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZVtjZXh0XT10cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lW2V4dF09dHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICB9LFxuICAgIHJlZ3JvdXBDb2RlOihtYXAsb3JkZXIpPT57XG4gICAgICAgIC8vY29uc29sZS5sb2cobWFwKTtcbiAgICAgICAgY29uc3QgZGVjb2RlPXNlbGYuZGVjb2RlTGliO1xuICAgICAgICBsZXQganM9Jyc7XG4gICAgICAgIGxldCBjc3M9Jyc7XG4gICAgICAgIGxldCBkb25lPXt9O1xuICAgICAgICBsZXQgZmFpbGVkPXt9O1xuICAgICAgICBsZXQgZXJyb3I9ZmFsc2U7ICAgIC8v5qCH5b+X5L2N6L6T5Ye6XG5cbiAgICAgICAgY29uc3Qgb2RzPXNlbGYubWVyZ2VPcmRlcihvcmRlcik7XG4gICAgICAgIGZvcihsZXQgaT0wO2k8b2RzLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgY29uc3Qgcm93PW9kc1tpXTtcbiAgICAgICAgICAgIGlmKGRvbmVbcm93XSkgY29udGludWU7XG4gICAgICAgICAgICBjb25zdCBkdD1tYXBbcm93XTtcbiAgICAgICAgICAgIGNvbnN0IHJlcz1kZWNvZGUoZHQpO1xuICAgICAgICAgICAgZG9uZVtyb3ddPXRydWU7XG4gICAgICAgICAgICBpZihyZXMuZXJyb3Ipe1xuICAgICAgICAgICAgICAgIGZhaWxlZFtyb3ddPXJlcy5lcnJvcjtcbiAgICAgICAgICAgICAgICBlcnJvcj10cnVlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAganMrPXJlcy50eXBlPT09XCJqc1wiP3Jlcy5kYXRhOicnO1xuICAgICAgICAgICAgY3NzKz1yZXMudHlwZT09PVwiY3NzXCI/cmVzLmRhdGE6Jyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtqczpqcyxjc3M6Y3NzLGZhaWxlZDpmYWlsZWQsb3JkZXI6b2RzLGVycm9yOmVycm9yfTtcbiAgICB9LFxufVxuXG5leHBvcnRzLkxvYWRlciA9KGxpc3QsQVBJLGNrKT0+e1xuICAgIHNlYXJjaD1BUEkuc2VhcmNoO1xuICAgIHRhcmdldD1BUEkudGFyZ2V0O1xuICAgIHNlbGYuZ2V0TGlicyhsaXN0LGNrKTtcbn07XG5cbmV4cG9ydHMuTGlicz0obGlzdCxBUEksY2spPT57XG4gICAgc2VhcmNoPUFQSS5zZWFyY2g7XG4gICAgdGFyZ2V0PUFQSS50YXJnZXQ7XG4gICAgc2VsZi5nZXRMaWJzKGxpc3QsKGR0LG9yZGVyKT0+eyAgICAgICAgICAgICAgICBcbiAgICAgICAgY29uc3QgY29kZT1zZWxmLnJlZ3JvdXBDb2RlKGR0LG9yZGVyKTtcbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNvZGUpO1xuICAgIH0pO1xufTsiLCJ2YXIgY2hhcmVuYyA9IHtcbiAgLy8gVVRGLTggZW5jb2RpbmdcbiAgdXRmODoge1xuICAgIC8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgc3RyaW5nVG9CeXRlczogZnVuY3Rpb24oc3RyKSB7XG4gICAgICByZXR1cm4gY2hhcmVuYy5iaW4uc3RyaW5nVG9CeXRlcyh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3RyKSkpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIHN0cmluZ1xuICAgIGJ5dGVzVG9TdHJpbmc6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVzY2FwZShjaGFyZW5jLmJpbi5ieXRlc1RvU3RyaW5nKGJ5dGVzKSkpO1xuICAgIH1cbiAgfSxcblxuICAvLyBCaW5hcnkgZW5jb2RpbmdcbiAgYmluOiB7XG4gICAgLy8gQ29udmVydCBhIHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBzdHJpbmdUb0J5dGVzOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKVxuICAgICAgICBieXRlcy5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRik7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgc3RyaW5nXG4gICAgYnl0ZXNUb1N0cmluZzogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIHN0ciA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKVxuICAgICAgICBzdHIucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKSk7XG4gICAgICByZXR1cm4gc3RyLmpvaW4oJycpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjaGFyZW5jO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgYmFzZTY0bWFwXG4gICAgICA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJyxcblxuICBjcnlwdCA9IHtcbiAgICAvLyBCaXQtd2lzZSByb3RhdGlvbiBsZWZ0XG4gICAgcm90bDogZnVuY3Rpb24obiwgYikge1xuICAgICAgcmV0dXJuIChuIDw8IGIpIHwgKG4gPj4+ICgzMiAtIGIpKTtcbiAgICB9LFxuXG4gICAgLy8gQml0LXdpc2Ugcm90YXRpb24gcmlnaHRcbiAgICByb3RyOiBmdW5jdGlvbihuLCBiKSB7XG4gICAgICByZXR1cm4gKG4gPDwgKDMyIC0gYikpIHwgKG4gPj4+IGIpO1xuICAgIH0sXG5cbiAgICAvLyBTd2FwIGJpZy1lbmRpYW4gdG8gbGl0dGxlLWVuZGlhbiBhbmQgdmljZSB2ZXJzYVxuICAgIGVuZGlhbjogZnVuY3Rpb24obikge1xuICAgICAgLy8gSWYgbnVtYmVyIGdpdmVuLCBzd2FwIGVuZGlhblxuICAgICAgaWYgKG4uY29uc3RydWN0b3IgPT0gTnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBjcnlwdC5yb3RsKG4sIDgpICYgMHgwMEZGMDBGRiB8IGNyeXB0LnJvdGwobiwgMjQpICYgMHhGRjAwRkYwMDtcbiAgICAgIH1cblxuICAgICAgLy8gRWxzZSwgYXNzdW1lIGFycmF5IGFuZCBzd2FwIGFsbCBpdGVtc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuLmxlbmd0aDsgaSsrKVxuICAgICAgICBuW2ldID0gY3J5cHQuZW5kaWFuKG5baV0pO1xuICAgICAgcmV0dXJuIG47XG4gICAgfSxcblxuICAgIC8vIEdlbmVyYXRlIGFuIGFycmF5IG9mIGFueSBsZW5ndGggb2YgcmFuZG9tIGJ5dGVzXG4gICAgcmFuZG9tQnl0ZXM6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW107IG4gPiAwOyBuLS0pXG4gICAgICAgIGJ5dGVzLnB1c2goTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU2KSk7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGJpZy1lbmRpYW4gMzItYml0IHdvcmRzXG4gICAgYnl0ZXNUb1dvcmRzOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgd29yZHMgPSBbXSwgaSA9IDAsIGIgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyssIGIgKz0gOClcbiAgICAgICAgd29yZHNbYiA+Pj4gNV0gfD0gYnl0ZXNbaV0gPDwgKDI0IC0gYiAlIDMyKTtcbiAgICAgIHJldHVybiB3b3JkcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBiaWctZW5kaWFuIDMyLWJpdCB3b3JkcyB0byBhIGJ5dGUgYXJyYXlcbiAgICB3b3Jkc1RvQnl0ZXM6IGZ1bmN0aW9uKHdvcmRzKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBiID0gMDsgYiA8IHdvcmRzLmxlbmd0aCAqIDMyOyBiICs9IDgpXG4gICAgICAgIGJ5dGVzLnB1c2goKHdvcmRzW2IgPj4+IDVdID4+PiAoMjQgLSBiICUgMzIpKSAmIDB4RkYpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIGhleCBzdHJpbmdcbiAgICBieXRlc1RvSGV4OiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgaGV4ID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaGV4LnB1c2goKGJ5dGVzW2ldID4+PiA0KS50b1N0cmluZygxNikpO1xuICAgICAgICBoZXgucHVzaCgoYnl0ZXNbaV0gJiAweEYpLnRvU3RyaW5nKDE2KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGV4LmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgaGV4IHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBoZXhUb0J5dGVzOiBmdW5jdGlvbihoZXgpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGMgPSAwOyBjIDwgaGV4Lmxlbmd0aDsgYyArPSAyKVxuICAgICAgICBieXRlcy5wdXNoKHBhcnNlSW50KGhleC5zdWJzdHIoYywgMiksIDE2KSk7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgYmFzZS02NCBzdHJpbmdcbiAgICBieXRlc1RvQmFzZTY0OiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgYmFzZTY0ID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgdmFyIHRyaXBsZXQgPSAoYnl0ZXNbaV0gPDwgMTYpIHwgKGJ5dGVzW2kgKyAxXSA8PCA4KSB8IGJ5dGVzW2kgKyAyXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA0OyBqKyspXG4gICAgICAgICAgaWYgKGkgKiA4ICsgaiAqIDYgPD0gYnl0ZXMubGVuZ3RoICogOClcbiAgICAgICAgICAgIGJhc2U2NC5wdXNoKGJhc2U2NG1hcC5jaGFyQXQoKHRyaXBsZXQgPj4+IDYgKiAoMyAtIGopKSAmIDB4M0YpKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBiYXNlNjQucHVzaCgnPScpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2U2NC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJhc2UtNjQgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIGJhc2U2NFRvQnl0ZXM6IGZ1bmN0aW9uKGJhc2U2NCkge1xuICAgICAgLy8gUmVtb3ZlIG5vbi1iYXNlLTY0IGNoYXJhY3RlcnNcbiAgICAgIGJhc2U2NCA9IGJhc2U2NC5yZXBsYWNlKC9bXkEtWjAtOStcXC9dL2lnLCAnJyk7XG5cbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGkgPSAwLCBpbW9kNCA9IDA7IGkgPCBiYXNlNjQubGVuZ3RoO1xuICAgICAgICAgIGltb2Q0ID0gKytpICUgNCkge1xuICAgICAgICBpZiAoaW1vZDQgPT0gMCkgY29udGludWU7XG4gICAgICAgIGJ5dGVzLnB1c2goKChiYXNlNjRtYXAuaW5kZXhPZihiYXNlNjQuY2hhckF0KGkgLSAxKSlcbiAgICAgICAgICAgICYgKE1hdGgucG93KDIsIC0yICogaW1vZDQgKyA4KSAtIDEpKSA8PCAoaW1vZDQgKiAyKSlcbiAgICAgICAgICAgIHwgKGJhc2U2NG1hcC5pbmRleE9mKGJhc2U2NC5jaGFyQXQoaSkpID4+PiAoNiAtIGltb2Q0ICogMikpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBjcnlwdDtcbn0pKCk7XG4iLCIvKiFcbiAqIERldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYSBCdWZmZXJcbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbi8vIFRoZSBfaXNCdWZmZXIgY2hlY2sgaXMgZm9yIFNhZmFyaSA1LTcgc3VwcG9ydCwgYmVjYXVzZSBpdCdzIG1pc3Npbmdcbi8vIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHlcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICE9IG51bGwgJiYgKGlzQnVmZmVyKG9iaikgfHwgaXNTbG93QnVmZmVyKG9iaikgfHwgISFvYmouX2lzQnVmZmVyKVxufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiAhIW9iai5jb25zdHJ1Y3RvciAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopXG59XG5cbi8vIEZvciBOb2RlIHYwLjEwIHN1cHBvcnQuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHkuXG5mdW5jdGlvbiBpc1Nsb3dCdWZmZXIgKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iai5yZWFkRmxvYXRMRSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLnNsaWNlID09PSAnZnVuY3Rpb24nICYmIGlzQnVmZmVyKG9iai5zbGljZSgwLCAwKSlcbn1cbiIsIihmdW5jdGlvbigpe1xyXG4gIHZhciBjcnlwdCA9IHJlcXVpcmUoJ2NyeXB0JyksXHJcbiAgICAgIHV0ZjggPSByZXF1aXJlKCdjaGFyZW5jJykudXRmOCxcclxuICAgICAgaXNCdWZmZXIgPSByZXF1aXJlKCdpcy1idWZmZXInKSxcclxuICAgICAgYmluID0gcmVxdWlyZSgnY2hhcmVuYycpLmJpbixcclxuXHJcbiAgLy8gVGhlIGNvcmVcclxuICBtZDUgPSBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xyXG4gICAgLy8gQ29udmVydCB0byBieXRlIGFycmF5XHJcbiAgICBpZiAobWVzc2FnZS5jb25zdHJ1Y3RvciA9PSBTdHJpbmcpXHJcbiAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZW5jb2RpbmcgPT09ICdiaW5hcnknKVxyXG4gICAgICAgIG1lc3NhZ2UgPSBiaW4uc3RyaW5nVG9CeXRlcyhtZXNzYWdlKTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIG1lc3NhZ2UgPSB1dGY4LnN0cmluZ1RvQnl0ZXMobWVzc2FnZSk7XHJcbiAgICBlbHNlIGlmIChpc0J1ZmZlcihtZXNzYWdlKSlcclxuICAgICAgbWVzc2FnZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG1lc3NhZ2UsIDApO1xyXG4gICAgZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWVzc2FnZSkgJiYgbWVzc2FnZS5jb25zdHJ1Y3RvciAhPT0gVWludDhBcnJheSlcclxuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UudG9TdHJpbmcoKTtcclxuICAgIC8vIGVsc2UsIGFzc3VtZSBieXRlIGFycmF5IGFscmVhZHlcclxuXHJcbiAgICB2YXIgbSA9IGNyeXB0LmJ5dGVzVG9Xb3JkcyhtZXNzYWdlKSxcclxuICAgICAgICBsID0gbWVzc2FnZS5sZW5ndGggKiA4LFxyXG4gICAgICAgIGEgPSAgMTczMjU4NDE5MyxcclxuICAgICAgICBiID0gLTI3MTczMzg3OSxcclxuICAgICAgICBjID0gLTE3MzI1ODQxOTQsXHJcbiAgICAgICAgZCA9ICAyNzE3MzM4Nzg7XHJcblxyXG4gICAgLy8gU3dhcCBlbmRpYW5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBtW2ldID0gKChtW2ldIDw8ICA4KSB8IChtW2ldID4+PiAyNCkpICYgMHgwMEZGMDBGRiB8XHJcbiAgICAgICAgICAgICAoKG1baV0gPDwgMjQpIHwgKG1baV0gPj4+ICA4KSkgJiAweEZGMDBGRjAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhZGRpbmdcclxuICAgIG1bbCA+Pj4gNV0gfD0gMHg4MCA8PCAobCAlIDMyKTtcclxuICAgIG1bKCgobCArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBsO1xyXG5cclxuICAgIC8vIE1ldGhvZCBzaG9ydGN1dHNcclxuICAgIHZhciBGRiA9IG1kNS5fZmYsXHJcbiAgICAgICAgR0cgPSBtZDUuX2dnLFxyXG4gICAgICAgIEhIID0gbWQ1Ll9oaCxcclxuICAgICAgICBJSSA9IG1kNS5faWk7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtLmxlbmd0aDsgaSArPSAxNikge1xyXG5cclxuICAgICAgdmFyIGFhID0gYSxcclxuICAgICAgICAgIGJiID0gYixcclxuICAgICAgICAgIGNjID0gYyxcclxuICAgICAgICAgIGRkID0gZDtcclxuXHJcbiAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBtW2krIDBdLCAgNywgLTY4MDg3NjkzNik7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krIDFdLCAxMiwgLTM4OTU2NDU4Nik7XHJcbiAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBtW2krIDJdLCAxNywgIDYwNjEwNTgxOSk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krIDNdLCAyMiwgLTEwNDQ1MjUzMzApO1xyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKyA0XSwgIDcsIC0xNzY0MTg4OTcpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyA1XSwgMTIsICAxMjAwMDgwNDI2KTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsgNl0sIDE3LCAtMTQ3MzIzMTM0MSk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krIDddLCAyMiwgLTQ1NzA1OTgzKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsgOF0sICA3LCAgMTc3MDAzNTQxNik7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krIDldLCAxMiwgLTE5NTg0MTQ0MTcpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKzEwXSwgMTcsIC00MjA2Myk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krMTFdLCAyMiwgLTE5OTA0MDQxNjIpO1xyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKzEyXSwgIDcsICAxODA0NjAzNjgyKTtcclxuICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIG1baSsxM10sIDEyLCAtNDAzNDExMDEpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKzE0XSwgMTcsIC0xNTAyMDAyMjkwKTtcclxuICAgICAgYiA9IEZGKGIsIGMsIGQsIGEsIG1baSsxNV0sIDIyLCAgMTIzNjUzNTMyOSk7XHJcblxyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKyAxXSwgIDUsIC0xNjU3OTY1MTApO1xyXG4gICAgICBkID0gR0coZCwgYSwgYiwgYywgbVtpKyA2XSwgIDksIC0xMDY5NTAxNjMyKTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsxMV0sIDE0LCAgNjQzNzE3NzEzKTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsgMF0sIDIwLCAtMzczODk3MzAyKTtcclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgNV0sICA1LCAtNzAxNTU4NjkxKTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsxMF0sICA5LCAgMzgwMTYwODMpO1xyXG4gICAgICBjID0gR0coYywgZCwgYSwgYiwgbVtpKzE1XSwgMTQsIC02NjA0NzgzMzUpO1xyXG4gICAgICBiID0gR0coYiwgYywgZCwgYSwgbVtpKyA0XSwgMjAsIC00MDU1Mzc4NDgpO1xyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKyA5XSwgIDUsICA1Njg0NDY0MzgpO1xyXG4gICAgICBkID0gR0coZCwgYSwgYiwgYywgbVtpKzE0XSwgIDksIC0xMDE5ODAzNjkwKTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsgM10sIDE0LCAtMTg3MzYzOTYxKTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsgOF0sIDIwLCAgMTE2MzUzMTUwMSk7XHJcbiAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBtW2krMTNdLCAgNSwgLTE0NDQ2ODE0NjcpO1xyXG4gICAgICBkID0gR0coZCwgYSwgYiwgYywgbVtpKyAyXSwgIDksIC01MTQwMzc4NCk7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krIDddLCAxNCwgIDE3MzUzMjg0NzMpO1xyXG4gICAgICBiID0gR0coYiwgYywgZCwgYSwgbVtpKzEyXSwgMjAsIC0xOTI2NjA3NzM0KTtcclxuXHJcbiAgICAgIGEgPSBISChhLCBiLCBjLCBkLCBtW2krIDVdLCAgNCwgLTM3ODU1OCk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krIDhdLCAxMSwgLTIwMjI1NzQ0NjMpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKzExXSwgMTYsICAxODM5MDMwNTYyKTtcclxuICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIG1baSsxNF0sIDIzLCAtMzUzMDk1NTYpO1xyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyAxXSwgIDQsIC0xNTMwOTkyMDYwKTtcclxuICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIG1baSsgNF0sIDExLCAgMTI3Mjg5MzM1Myk7XHJcbiAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBtW2krIDddLCAxNiwgLTE1NTQ5NzYzMik7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krMTBdLCAyMywgLTEwOTQ3MzA2NDApO1xyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKzEzXSwgIDQsICA2ODEyNzkxNzQpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKyAwXSwgMTEsIC0zNTg1MzcyMjIpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKyAzXSwgMTYsIC03MjI1MjE5NzkpO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKyA2XSwgMjMsICA3NjAyOTE4OSk7XHJcbiAgICAgIGEgPSBISChhLCBiLCBjLCBkLCBtW2krIDldLCAgNCwgLTY0MDM2NDQ4Nyk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krMTJdLCAxMSwgLTQyMTgxNTgzNSk7XHJcbiAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBtW2krMTVdLCAxNiwgIDUzMDc0MjUyMCk7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krIDJdLCAyMywgLTk5NTMzODY1MSk7XHJcblxyXG4gICAgICBhID0gSUkoYSwgYiwgYywgZCwgbVtpKyAwXSwgIDYsIC0xOTg2MzA4NDQpO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKyA3XSwgMTAsICAxMTI2ODkxNDE1KTtcclxuICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIG1baSsxNF0sIDE1LCAtMTQxNjM1NDkwNSk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krIDVdLCAyMSwgLTU3NDM0MDU1KTtcclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsxMl0sICA2LCAgMTcwMDQ4NTU3MSk7XHJcbiAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBtW2krIDNdLCAxMCwgLTE4OTQ5ODY2MDYpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKzEwXSwgMTUsIC0xMDUxNTIzKTtcclxuICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIG1baSsgMV0sIDIxLCAtMjA1NDkyMjc5OSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krIDhdLCAgNiwgIDE4NzMzMTMzNTkpO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKzE1XSwgMTAsIC0zMDYxMTc0NCk7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krIDZdLCAxNSwgLTE1NjAxOTgzODApO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKzEzXSwgMjEsICAxMzA5MTUxNjQ5KTtcclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsgNF0sICA2LCAtMTQ1NTIzMDcwKTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsxMV0sIDEwLCAtMTEyMDIxMDM3OSk7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krIDJdLCAxNSwgIDcxODc4NzI1OSk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krIDldLCAyMSwgLTM0MzQ4NTU1MSk7XHJcblxyXG4gICAgICBhID0gKGEgKyBhYSkgPj4+IDA7XHJcbiAgICAgIGIgPSAoYiArIGJiKSA+Pj4gMDtcclxuICAgICAgYyA9IChjICsgY2MpID4+PiAwO1xyXG4gICAgICBkID0gKGQgKyBkZCkgPj4+IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNyeXB0LmVuZGlhbihbYSwgYiwgYywgZF0pO1xyXG4gIH07XHJcblxyXG4gIC8vIEF1eGlsaWFyeSBmdW5jdGlvbnNcclxuICBtZDUuX2ZmICA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XHJcbiAgICB2YXIgbiA9IGEgKyAoYiAmIGMgfCB+YiAmIGQpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuICBtZDUuX2dnICA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XHJcbiAgICB2YXIgbiA9IGEgKyAoYiAmIGQgfCBjICYgfmQpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuICBtZDUuX2hoICA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XHJcbiAgICB2YXIgbiA9IGEgKyAoYiBeIGMgXiBkKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9paSAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGMgXiAoYiB8IH5kKSkgKyAoeCA+Pj4gMCkgKyB0O1xyXG4gICAgcmV0dXJuICgobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSkpICsgYjtcclxuICB9O1xyXG5cclxuICAvLyBQYWNrYWdlIHByaXZhdGUgYmxvY2tzaXplXHJcbiAgbWQ1Ll9ibG9ja3NpemUgPSAxNjtcclxuICBtZDUuX2RpZ2VzdHNpemUgPSAxNjtcclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWVzc2FnZSwgb3B0aW9ucykge1xyXG4gICAgaWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBtZXNzYWdlID09PSBudWxsKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lsbGVnYWwgYXJndW1lbnQgJyArIG1lc3NhZ2UpO1xyXG5cclxuICAgIHZhciBkaWdlc3RieXRlcyA9IGNyeXB0LndvcmRzVG9CeXRlcyhtZDUobWVzc2FnZSwgb3B0aW9ucykpO1xyXG4gICAgcmV0dXJuIG9wdGlvbnMgJiYgb3B0aW9ucy5hc0J5dGVzID8gZGlnZXN0Ynl0ZXMgOlxyXG4gICAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy5hc1N0cmluZyA/IGJpbi5ieXRlc1RvU3RyaW5nKGRpZ2VzdGJ5dGVzKSA6XHJcbiAgICAgICAgY3J5cHQuYnl0ZXNUb0hleChkaWdlc3RieXRlcyk7XHJcbiAgfTtcclxuXHJcbn0pKCk7XHJcbiIsImRlZmluZShcInByb3RvY29sXCIsIFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBleHBvcnRzLnJlbGF0ZWRJbmRleCA9IGV4cG9ydHMua2V5c0FwcCA9IGV4cG9ydHMuY29kZVR5cGUgPSBleHBvcnRzLmZvcm1hdFR5cGUgPSBleHBvcnRzLnJhd1R5cGUgPSBleHBvcnRzLmVycm9yTGV2ZWwgPSB2b2lkIDA7XG4gICAgdmFyIGVycm9yTGV2ZWw7XG4gICAgKGZ1bmN0aW9uIChlcnJvckxldmVsKSB7XG4gICAgICAgIGVycm9yTGV2ZWxbXCJFUlJPUlwiXSA9IFwiZXJyb3JcIjtcbiAgICAgICAgZXJyb3JMZXZlbFtcIldBUk5cIl0gPSBcIndhcm5pbmdcIjtcbiAgICAgICAgZXJyb3JMZXZlbFtcIlVORVhDRVBUXCJdID0gXCJ1bmV4Y2VwdFwiO1xuICAgIH0pKGVycm9yTGV2ZWwgPSBleHBvcnRzLmVycm9yTGV2ZWwgfHwgKGV4cG9ydHMuZXJyb3JMZXZlbCA9IHt9KSk7XG4gICAgdmFyIHJhd1R5cGU7XG4gICAgKGZ1bmN0aW9uIChyYXdUeXBlKSB7XG4gICAgICAgIHJhd1R5cGVbXCJEQVRBXCJdID0gXCJkYXRhXCI7XG4gICAgICAgIHJhd1R5cGVbXCJBUFBcIl0gPSBcImFwcFwiO1xuICAgICAgICByYXdUeXBlW1wiTElCXCJdID0gXCJsaWJcIjtcbiAgICAgICAgcmF3VHlwZVtcIk5PTkVcIl0gPSBcInVua25vd1wiO1xuICAgIH0pKHJhd1R5cGUgPSBleHBvcnRzLnJhd1R5cGUgfHwgKGV4cG9ydHMucmF3VHlwZSA9IHt9KSk7XG4gICAgdmFyIGZvcm1hdFR5cGU7XG4gICAgKGZ1bmN0aW9uIChmb3JtYXRUeXBlKSB7XG4gICAgICAgIGZvcm1hdFR5cGVbXCJKQVZBU0NSSVBUXCJdID0gXCJqc1wiO1xuICAgICAgICBmb3JtYXRUeXBlW1wiQ1NTXCJdID0gXCJjc3NcIjtcbiAgICAgICAgZm9ybWF0VHlwZVtcIk1BUktET1dOXCJdID0gXCJtZFwiO1xuICAgICAgICBmb3JtYXRUeXBlW1wiSlNPTlwiXSA9IFwianNvblwiO1xuICAgICAgICBmb3JtYXRUeXBlW1wiTk9ORVwiXSA9IFwiXCI7XG4gICAgfSkoZm9ybWF0VHlwZSA9IGV4cG9ydHMuZm9ybWF0VHlwZSB8fCAoZXhwb3J0cy5mb3JtYXRUeXBlID0ge30pKTtcbiAgICB2YXIgY29kZVR5cGU7XG4gICAgKGZ1bmN0aW9uIChjb2RlVHlwZSkge1xuICAgICAgICBjb2RlVHlwZVtcIkFTQ0lJXCJdID0gXCJhc2NpaVwiO1xuICAgICAgICBjb2RlVHlwZVtcIlVURjhcIl0gPSBcInV0ZjhcIjtcbiAgICAgICAgY29kZVR5cGVbXCJIRVhcIl0gPSBcImhleFwiO1xuICAgICAgICBjb2RlVHlwZVtcIk5PTkVcIl0gPSBcIlwiO1xuICAgIH0pKGNvZGVUeXBlID0gZXhwb3J0cy5jb2RlVHlwZSB8fCAoZXhwb3J0cy5jb2RlVHlwZSA9IHt9KSk7XG4gICAgdmFyIGtleXNBcHA7XG4gICAgKGZ1bmN0aW9uIChrZXlzQXBwKSB7XG4gICAgfSkoa2V5c0FwcCA9IGV4cG9ydHMua2V5c0FwcCB8fCAoZXhwb3J0cy5rZXlzQXBwID0ge30pKTtcbiAgICB2YXIgcmVsYXRlZEluZGV4O1xuICAgIChmdW5jdGlvbiAocmVsYXRlZEluZGV4KSB7XG4gICAgICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJBVVRIXCJdID0gMF0gPSBcIkFVVEhcIjtcbiAgICAgICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIkhJREVcIl0gPSAxXSA9IFwiSElERVwiO1xuICAgICAgICByZWxhdGVkSW5kZXhbcmVsYXRlZEluZGV4W1wiTkFNRVwiXSA9IDBdID0gXCJOQU1FXCI7XG4gICAgICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJCTE9DS1wiXSA9IDFdID0gXCJCTE9DS1wiO1xuICAgIH0pKHJlbGF0ZWRJbmRleCA9IGV4cG9ydHMucmVsYXRlZEluZGV4IHx8IChleHBvcnRzLnJlbGF0ZWRJbmRleCA9IHt9KSk7XG59KTtcbmRlZmluZShcImF1dGhcIiwgW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIl0sIGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGV4cG9ydHMuY2hlY2tBdXRoID0gZXhwb3J0cy5lYXN5QXV0aCA9IHZvaWQgMDtcbiAgICB2YXIgbWQ1ID0gcmVxdWlyZShcIm1kNVwiKTtcbiAgICB2YXIgY3JlYXRvciA9IGZ1bmN0aW9uIChhbmNob3IsIGNrLCBpc05ldykge1xuICAgIH07XG4gICAgZXhwb3J0cy5lYXN5QXV0aCA9IGNyZWF0b3I7XG4gICAgdmFyIGNoZWNrID0gZnVuY3Rpb24gKGFuY2hvciwgcHJvdG9jb2wsIGNrKSB7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgXCJsaXN0XCI6IG51bGwsXG4gICAgICAgICAgICBcImFuY2hvclwiOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgICBpZiAocHJvdG9jb2wuYXV0aCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm90b2NvbC5hdXRoID09PSBcInN0cmluZ1wiIHx8IEFycmF5LmlzQXJyYXkocHJvdG9jb2wuYXV0aCkpIHtcbiAgICAgICAgICAgICAgICBkYXRhLmFuY2hvciA9IHByb3RvY29sLmF1dGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhLmxpc3QgPSBwcm90b2NvbC5hdXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHByb3RvY29sLnNhbHQpIHtcbiAgICAgICAgICAgICAgICBkYXRhLmFuY2hvciA9IG1kNShhbmNob3IgKyBwcm90b2NvbC5zYWx0WzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2sgJiYgY2soZGF0YSk7XG4gICAgfTtcbiAgICBleHBvcnRzLmNoZWNrQXV0aCA9IGNoZWNrO1xufSk7XG5kZWZpbmUoXCJkZWNvZGVyXCIsIFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCJdLCBmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiAgICBleHBvcnRzLmxpbmtEZWNvZGVyID0gZXhwb3J0cy5saW5rQ3JlYXRvciA9IHZvaWQgMDtcbiAgICB2YXIgc2V0dGluZyA9IHtcbiAgICAgICAgXCJjaGVja1wiOiBmYWxzZSxcbiAgICAgICAgXCJ1dGY4XCI6IHRydWUsXG4gICAgICAgIFwicHJlXCI6IFwiYW5jaG9yOi8vXCIsXG4gICAgfTtcbiAgICB2YXIgc2VsZiA9IHtcbiAgICAgICAgZ2V0UGFyYW1zOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgICAgICB2YXIgYXJyID0gc3RyLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IGFycltpXTtcbiAgICAgICAgICAgICAgICB2YXIga3YgPSByb3cuc3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgICAgIGlmIChrdi5sZW5ndGggIT09IDIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHBhcmFtZXRlclwiIH07XG4gICAgICAgICAgICAgICAgbWFwW2t2WzBdXSA9IGt2WzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSxcbiAgICAgICAgY29tYmluZVBhcmFtczogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgaWYgKCFvYmopXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goXCJcIi5jb25jYXQoaywgXCI9XCIpLmNvbmNhdChvYmpba10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICByZXR1cm4gbGlzdC5qb2luKFwiJlwiKTtcbiAgICAgICAgfSxcbiAgICB9O1xuICAgIHZhciBjcmVhdG9yID0gZnVuY3Rpb24gKGxvY2FsLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIHN0ciA9IHNlbGYuY29tYmluZVBhcmFtcyhwYXJhbXMpO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShsb2NhbCkpIHtcbiAgICAgICAgICAgIGlmIChsb2NhbFsxXSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChzZXR0aW5nLnByZSkuY29uY2F0KGxvY2FsWzBdLCBcIi9cIikuY29uY2F0KGxvY2FsWzFdKS5jb25jYXQoIXN0ciA/IHN0ciA6IFwiP1wiICsgc3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChzZXR0aW5nLnByZSkuY29uY2F0KGxvY2FsWzBdKS5jb25jYXQoIXN0ciA/IHN0ciA6IFwiP1wiICsgc3RyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChzZXR0aW5nLnByZSkuY29uY2F0KGxvY2FsKS5jb25jYXQoIXN0ciA/IHN0ciA6IFwiP1wiICsgc3RyKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZXhwb3J0cy5saW5rQ3JlYXRvciA9IGNyZWF0b3I7XG4gICAgdmFyIGRlY29kZXIgPSBmdW5jdGlvbiAobGluaywgY2ZnKSB7XG4gICAgICAgIHZhciByZXMgPSB7XG4gICAgICAgICAgICBsb2NhdGlvbjogW1wiXCIsIDBdLFxuICAgICAgICB9O1xuICAgICAgICB2YXIgc3RyID0gbGluay50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgICAgICB2YXIgcHJlID0gc2V0dGluZy5wcmU7XG4gICAgICAgIGlmIChzdHIubGVuZ3RoIDw9IHByZS5sZW5ndGggKyAxKVxuICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiaW52YWxpZCBzdHJpbmdcIiB9O1xuICAgICAgICB2YXIgaGVhZCA9IHN0ci5zdWJzdHJpbmcoMCwgcHJlLmxlbmd0aCk7XG4gICAgICAgIGlmIChoZWFkICE9PSBwcmUpXG4gICAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJpbnZhbGlkIHByb3RvY29sXCIgfTtcbiAgICAgICAgdmFyIGJvZHkgPSBzdHIuc3Vic3RyaW5nKHByZS5sZW5ndGgsIHN0ci5sZW5ndGgpO1xuICAgICAgICB2YXIgYXJyID0gYm9keS5zcGxpdChcIj9cIik7XG4gICAgICAgIGlmIChhcnIubGVuZ3RoID4gMilcbiAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHJlcXVlc3QsIHBsZWFzZSBjaGVjayBhbmNob3IgbmFtZVwiIH07XG4gICAgICAgIHZhciBpc1BhcmFtID0gYXJyLmxlbmd0aCA9PT0gMSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICAgaWYgKGlzUGFyYW0pIHtcbiAgICAgICAgICAgIHZhciBwcyA9IHNlbGYuZ2V0UGFyYW1zKGFyclsxXSk7XG4gICAgICAgICAgICBpZiAocHMuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMucGFyYW0gPSBzZWxmLmdldFBhcmFtcyhhcnJbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGJvZHkgPSBhcnJbMF07XG4gICAgICAgIHZhciBscyA9IGJvZHkuc3BsaXQoXCIvXCIpO1xuICAgICAgICB2YXIgbGFzdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobHNbaV0gIT09ICcnKVxuICAgICAgICAgICAgICAgIGxhc3QucHVzaChsc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXMubG9jYXRpb25bMF0gPSBsYXN0WzBdO1xuICAgICAgICAgICAgcmVzLmxvY2F0aW9uWzFdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBlbGUgPSBsYXN0LnBvcCgpO1xuICAgICAgICAgICAgdmFyIGJsb2NrID0gcGFyc2VJbnQoZWxlKTtcbiAgICAgICAgICAgIGlmIChpc05hTihibG9jaykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiYmxvY2sgbnVtYmVyIGVycm9yXCIgfTtcbiAgICAgICAgICAgIHJlcy5sb2NhdGlvblsxXSA9IGJsb2NrO1xuICAgICAgICAgICAgcmVzLmxvY2F0aW9uWzBdID0gbGFzdC5qb2luKCcvJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIGV4cG9ydHMubGlua0RlY29kZXIgPSBkZWNvZGVyO1xufSk7XG5kZWZpbmUoXCJmb3JtYXRcIiwgW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIiwgXCJwcm90b2NvbFwiXSwgZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMsIHByb3RvY29sXzEpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgZXhwb3J0cy5lYXN5UHJvdG9jb2wgPSB2b2lkIDA7XG4gICAgdmFyIGZvcm1hdCA9IGZ1bmN0aW9uICh0eXBlLCBjZmcpIHtcbiAgICAgICAgdmFyIHByb3RvY29sO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgcHJvdG9jb2xfMS5yYXdUeXBlLkFQUDpcbiAgICAgICAgICAgICAgICBwcm90b2NvbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IHByb3RvY29sXzEucmF3VHlwZS5BUFAsXG4gICAgICAgICAgICAgICAgICAgIFwiZm10XCI6IHByb3RvY29sXzEuZm9ybWF0VHlwZS5KQVZBU0NSSVBULFxuICAgICAgICAgICAgICAgICAgICBcInZlclwiOiBcIjEuMC4wXCIsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAoY2ZnICYmIGNmZy5hdXRoKVxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbC5hdXRoID0gY2ZnLmF1dGg7XG4gICAgICAgICAgICAgICAgaWYgKGNmZyAmJiBjZmcubGliKVxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbC5saWIgPSBjZmcubGliO1xuICAgICAgICAgICAgICAgIGlmIChjZmcgJiYgY2ZnLnZlcilcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2wudmVyID0gY2ZnLnZlcjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgcHJvdG9jb2xfMS5yYXdUeXBlLkRBVEE6XG4gICAgICAgICAgICAgICAgcHJvdG9jb2wgPSB7XG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBwcm90b2NvbF8xLnJhd1R5cGUuREFUQSxcbiAgICAgICAgICAgICAgICAgICAgXCJmbXRcIjogcHJvdG9jb2xfMS5mb3JtYXRUeXBlLk5PTkUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAoY2ZnICYmIGNmZy5mbXQpXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sLmZtdCA9IGNmZy5mbXQ7XG4gICAgICAgICAgICAgICAgaWYgKGNmZyAmJiBjZmcuY29kZSlcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2wuY29kZSA9IGNmZy5jb2RlO1xuICAgICAgICAgICAgICAgIGlmIChjZmcgJiYgY2ZnLmF1dGgpXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sLmF1dGggPSBjZmcuYXV0aDtcbiAgICAgICAgICAgICAgICBpZiAoY2ZnICYmIGNmZy5jYWxsKVxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbC5jYWxsID0gY2ZnLmNhbGw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHByb3RvY29sXzEucmF3VHlwZS5MSUI6XG4gICAgICAgICAgICAgICAgcHJvdG9jb2wgPSB7XG4gICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBwcm90b2NvbF8xLnJhd1R5cGUuTElCLFxuICAgICAgICAgICAgICAgICAgICBcImZtdFwiOiBwcm90b2NvbF8xLmZvcm1hdFR5cGUuTk9ORSxcbiAgICAgICAgICAgICAgICAgICAgXCJ2ZXJcIjogXCIxLjAuMFwiLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHByb3RvY29sID0ge1xuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogcHJvdG9jb2xfMS5yYXdUeXBlLkRBVEEsXG4gICAgICAgICAgICAgICAgICAgIFwiZm10XCI6IHByb3RvY29sXzEuZm9ybWF0VHlwZS5OT05FLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3RvY29sO1xuICAgIH07XG4gICAgZXhwb3J0cy5lYXN5UHJvdG9jb2wgPSBmb3JtYXQ7XG59KTtcbmRlZmluZShcImhpZGVcIiwgW1wicmVxdWlyZVwiLCBcImV4cG9ydHNcIl0sIGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuICAgIGV4cG9ydHMuY2hlY2tIaWRlID0gZXhwb3J0cy5lYXN5SGlkZSA9IHZvaWQgMDtcbiAgICB2YXIgbWQ1ID0gcmVxdWlyZShcIm1kNVwiKTtcbiAgICB2YXIgY3JlYXRvciA9IGZ1bmN0aW9uIChhbmNob3IpIHtcbiAgICB9O1xuICAgIGV4cG9ydHMuZWFzeUhpZGUgPSBjcmVhdG9yO1xuICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uIChhbmNob3IsIHByb3RvY29sLCBjaykge1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIFwibGlzdFwiOiBudWxsLFxuICAgICAgICAgICAgXCJhbmNob3JcIjogbnVsbCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHByb3RvY29sLmhpZGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvdG9jb2wuaGlkZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGRhdGEuYW5jaG9yID0gcHJvdG9jb2wuaGlkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocHJvdG9jb2wuaGlkZSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhLmxpc3QgPSBwcm90b2NvbC5oaWRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAocHJvdG9jb2wuc2FsdCkge1xuICAgICAgICAgICAgICAgIGRhdGEuYW5jaG9yID0gbWQ1KGFuY2hvciArIHByb3RvY29sLnNhbHRbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjayAmJiBjayhkYXRhKTtcbiAgICB9O1xuICAgIGV4cG9ydHMuY2hlY2tIaWRlID0gY2hlY2s7XG59KTtcbmRlZmluZShcImludGVycHJldGVyXCIsIFtcInJlcXVpcmVcIiwgXCJleHBvcnRzXCIsIFwicHJvdG9jb2xcIiwgXCJwcm90b2NvbFwiLCBcImRlY29kZXJcIiwgXCJhdXRoXCIsIFwiaGlkZVwiXSwgZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMsIHByb3RvY29sXzIsIHByb3RvY29sXzMsIGRlY29kZXJfMSwgYXV0aF8xLCBoaWRlXzEpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4gICAgZXhwb3J0cy5lYXN5UnVuID0gdm9pZCAwO1xuICAgIHZhciBfYSA9IHJlcXVpcmUoXCIuLi9saWIvbG9hZGVyXCIpLCBMb2FkZXIgPSBfYS5Mb2FkZXIsIExpYnMgPSBfYS5MaWJzO1xuICAgIHZhciBBUEkgPSBudWxsO1xuICAgIHZhciBzZWxmID0ge1xuICAgICAgICBnZXRBbmNob3I6IGZ1bmN0aW9uIChsb2NhdGlvbiwgY2spIHtcbiAgICAgICAgICAgIGlmIChBUEkgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8gQVBJIHRvIGdldCBkYXRhLlwiLCBsZXZlbDogcHJvdG9jb2xfMi5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICAgICAgdmFyIGFuY2hvciA9IGxvY2F0aW9uWzBdLCBibG9jayA9IGxvY2F0aW9uWzFdO1xuICAgICAgICAgICAgaWYgKGJsb2NrICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgQVBJLmNvbW1vbi50YXJnZXQoYW5jaG9yLCBibG9jaywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5maWx0ZXJBbmNob3IoZGF0YSwgY2spO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgQVBJLmNvbW1vbi5sYXRlc3QoYW5jaG9yLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmZpbHRlckFuY2hvcihkYXRhLCBjayk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlckFuY2hvcjogZnVuY3Rpb24gKGRhdGEsIGNrKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8gc3VjaCBhbmNob3IuXCIsIGxldmVsOiBwcm90b2NvbF8yLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgICAgICB2YXIgZXJyID0gZGF0YTtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IGVyci5lcnJvciwgbGV2ZWw6IHByb3RvY29sXzIuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgICAgIHZhciBhbmNob3IgPSBkYXRhO1xuICAgICAgICAgICAgaWYgKGFuY2hvci5lbXB0eSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJFbXB0eSBhbmNob3IuXCIsIGxldmVsOiBwcm90b2NvbF8yLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgICAgICBpZiAoIWFuY2hvci5wcm90b2NvbClcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJOby1wcm90b2NvbCBhbmNob3IuXCIgfSk7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBhbmNob3IucHJvdG9jb2w7XG4gICAgICAgICAgICBpZiAoIXByb3RvY29sLnR5cGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm90IEVhc3lQcm90b2NvbCBhbmNob3IuXCIgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soYW5jaG9yKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVjb2RlRGF0YTogZnVuY3Rpb24gKGNPYmplY3QsIGNrKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRlY29kZSBkYXRhIGFuY2hvclwiKTtcbiAgICAgICAgICAgIGNPYmplY3QudHlwZSA9IHByb3RvY29sXzIucmF3VHlwZS5EQVRBO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBjT2JqZWN0LmRhdGFbXCJcIi5jb25jYXQoY09iamVjdC5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzFdKV07XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBkYXRhLnByb3RvY29sO1xuICAgICAgICAgICAgaWYgKHByb3RvY29sICE9PSBudWxsICYmIHByb3RvY29sLmNhbGwpIHtcbiAgICAgICAgICAgICAgICBjT2JqZWN0LmNhbGwgPSBwcm90b2NvbC5jYWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9LFxuICAgICAgICBkZWNvZGVBcHA6IGZ1bmN0aW9uIChjT2JqZWN0LCBjaykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWNvZGUgYXBwIGFuY2hvclwiKTtcbiAgICAgICAgICAgIGNPYmplY3QudHlwZSA9IHByb3RvY29sXzIucmF3VHlwZS5BUFA7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGNPYmplY3QuZGF0YVtcIlwiLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzBdLCBcIl9cIikuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMV0pXTtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IGRhdGEucHJvdG9jb2w7XG4gICAgICAgICAgICBjT2JqZWN0LmNvZGUgPSBkYXRhLnJhdztcbiAgICAgICAgICAgIGlmIChwcm90b2NvbCAhPT0gbnVsbCAmJiBwcm90b2NvbC5saWIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmdldExpYnMocHJvdG9jb2wubGliLCBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmxpYnMgPSBjb2RlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRlY29kZUxpYjogZnVuY3Rpb24gKGNPYmplY3QsIGNrKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRlY29kZSBsaWIgYW5jaG9yXCIpO1xuICAgICAgICAgICAgY09iamVjdC50eXBlID0gcHJvdG9jb2xfMi5yYXdUeXBlLkxJQjtcbiAgICAgICAgICAgIHZhciBkYXRhID0gY09iamVjdC5kYXRhW1wiXCIuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY09iamVjdC5sb2NhdGlvblsxXSldO1xuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gZGF0YS5wcm90b2NvbDtcbiAgICAgICAgICAgIGlmIChwcm90b2NvbCAhPT0gbnVsbCAmJiBwcm90b2NvbC5saWIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmdldExpYnMocHJvdG9jb2wubGliLCBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmxpYnMgPSBjb2RlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldExpYnM6IGZ1bmN0aW9uIChsaXN0LCBjaykge1xuICAgICAgICAgICAgaWYgKEFQSSA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsIGxldmVsOiBwcm90b2NvbF8yLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlJlYWR5IHRvIGdldCBsaWJzOiBcIi5jb25jYXQoSlNPTi5zdHJpbmdpZnkobGlzdCkpKTtcbiAgICAgICAgICAgIHZhciBSUEMgPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoOiBBUEkuY29tbW9uLmxhdGVzdCxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IEFQSS5jb21tb24udGFyZ2V0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIExpYnMobGlzdCwgUlBDLCBjayk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEhpc3Rvcnk6IGZ1bmN0aW9uIChsb2NhdGlvbiwgY2spIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICAgICAgaWYgKEFQSSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzIuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgZXJycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYW5jaG9yID0gbG9jYXRpb25bMF0sIGJsb2NrID0gbG9jYXRpb25bMV07XG4gICAgICAgICAgICBBUEkuY29tbW9uLmhpc3RvcnkoYW5jaG9yLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlcztcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgZXJycyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBhbGlzdCA9IHJlcztcbiAgICAgICAgICAgICAgICBpZiAoYWxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIkVtcHR5IGhpc3RvcnlcIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIGVycnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soYWxpc3QsIGVycnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG1lcmdlOiBmdW5jdGlvbiAoYW5jaG9yLCBwcm90b2NvbCwgY2ZnLCBjaykge1xuICAgICAgICAgICAgaWYgKEFQSSA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsIGxldmVsOiBwcm90b2NvbF8yLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIFwiaGlkZVwiOiBbXSxcbiAgICAgICAgICAgICAgICBcImF1dGhcIjogbnVsbCxcbiAgICAgICAgICAgICAgICBcImVycm9yXCI6IFtdLFxuICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogW251bGwsIG51bGxdLFxuICAgICAgICAgICAgICAgIFwibWFwXCI6IHt9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBtbGlzdCA9IFtdO1xuICAgICAgICAgICAgKDAsIGF1dGhfMS5jaGVja0F1dGgpKGFuY2hvciwgcHJvdG9jb2wsIGZ1bmN0aW9uIChyZXNBdXRoKSB7XG4gICAgICAgICAgICAgICAgKDAsIGhpZGVfMS5jaGVja0hpZGUpKGFuY2hvciwgcHJvdG9jb2wsIGZ1bmN0aW9uIChyZXNIaWRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNBdXRoLmFuY2hvciA9PT0gbnVsbCAmJiByZXNIaWRlLmFuY2hvciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc0F1dGgubGlzdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuYXV0aCA9IHJlc0F1dGgubGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNIaWRlLmxpc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmhpZGUgPSByZXNIaWRlLmxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNBdXRoLmFuY2hvciA9PT0gbnVsbCAmJiByZXNIaWRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhpZGVfYW5jaG9yID0gdHlwZW9mIHJlc0hpZGUuYW5jaG9yID09PSBcInN0cmluZ1wiID8gW3Jlc0hpZGUuYW5jaG9yLCAwXSA6IFtyZXNIaWRlLmFuY2hvclswXSwgcmVzSGlkZS5hbmNob3JbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRBbmNob3IoaGlkZV9hbmNob3IsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IGVyci5lcnJvciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jb21iaW5lSGlkZShyZXN1bHQsIGRhdGEsIGVycnMsIGNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc0F1dGguYW5jaG9yICE9PSBudWxsICYmIHJlc0hpZGUuYW5jaG9yID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXV0aF9hbmNob3IgPSB0eXBlb2YgcmVzQXV0aC5hbmNob3IgPT09IFwic3RyaW5nXCIgPyBbcmVzQXV0aC5hbmNob3IsIDBdIDogW3Jlc0F1dGguYW5jaG9yWzBdLCByZXNBdXRoLmFuY2hvclsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldEhpc3RvcnkoYXV0aF9hbmNob3IsIGZ1bmN0aW9uIChhbGlzdCwgZXJyc0EpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jb21iaW5lQXV0aChyZXN1bHQsIGFsaXN0LCBlcnJzQSwgY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzQXV0aC5hbmNob3IgIT09IG51bGwgJiYgcmVzSGlkZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoaWRlX2FuY2hvciA9IHR5cGVvZiByZXNIaWRlLmFuY2hvciA9PT0gXCJzdHJpbmdcIiA/IFtyZXNIaWRlLmFuY2hvciwgMF0gOiBbcmVzSGlkZS5hbmNob3JbMF0sIHJlc0hpZGUuYW5jaG9yWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdXRoX2FuY2hvcl8xID0gdHlwZW9mIHJlc0F1dGguYW5jaG9yID09PSBcInN0cmluZ1wiID8gW3Jlc0F1dGguYW5jaG9yLCAwXSA6IFtyZXNBdXRoLmFuY2hvclswXSwgcmVzQXV0aC5hbmNob3JbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRBbmNob3IoaGlkZV9hbmNob3IsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IGVyci5lcnJvciB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5jb21iaW5lSGlkZShyZXN1bHQsIGRhdGEsIGVycnMsIGZ1bmN0aW9uIChjaFJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldEhpc3RvcnkoYXV0aF9hbmNob3JfMSwgZnVuY3Rpb24gKGFsaXN0LCBlcnJzQSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jb21iaW5lQXV0aChjaFJlc3VsdCwgYWxpc3QsIGVycnNBLCBjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBjb21iaW5lSGlkZTogZnVuY3Rpb24gKHJlc3VsdCwgYW5jaG9yLCBlcnJzLCBjaykge1xuICAgICAgICAgICAgaWYgKGVycnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChlcnJzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5tYXBbXCJcIi5jb25jYXQoYW5jaG9yLm5hbWUsIFwiX1wiKS5jb25jYXQoYW5jaG9yLmJsb2NrKV0gPSBhbmNob3I7XG4gICAgICAgICAgICByZXN1bHQuaW5kZXhbcHJvdG9jb2xfMy5yZWxhdGVkSW5kZXguSElERV0gPSBbYW5jaG9yLm5hbWUsIGFuY2hvci5ibG9ja107XG4gICAgICAgICAgICB2YXIgZGhpZGUgPSBzZWxmLmRlY29kZUhpZGVBbmNob3IoYW5jaG9yKTtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShkaGlkZSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChkaGlkZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQuaGlkZSA9IGRoaWRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc3VsdCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbWJpbmVBdXRoOiBmdW5jdGlvbiAocmVzdWx0LCBsaXN0LCBlcnJzLCBjaykge1xuICAgICAgICAgICAgaWYgKGVycnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChlcnJzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBsaXN0W2ldO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tYXBbXCJcIi5jb25jYXQocm93Lm5hbWUsIFwiX1wiKS5jb25jYXQocm93LmJsb2NrKV0gPSByb3c7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbGFzdCA9IGxpc3RbMF07XG4gICAgICAgICAgICB2YXIgaGxpc3QgPSBbXTtcbiAgICAgICAgICAgIHNlbGYuZGVjb2RlQXV0aEFuY2hvcihsaXN0LCBobGlzdCwgZnVuY3Rpb24gKG1hcCwgYW1hcCwgZXJycykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gYW1hcClcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lm1hcFtrXSA9IGFtYXBba107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChlcnJzW2ldKTtcbiAgICAgICAgICAgICAgICByZXN1bHQuaW5kZXhbcHJvdG9jb2xfMy5yZWxhdGVkSW5kZXguQVVUSF0gPSBbbGFzdC5uYW1lLCAwXTtcbiAgICAgICAgICAgICAgICByZXN1bHQuYXV0aCA9IG1hcDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBkZWNvZGVIaWRlQW5jaG9yOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gb2JqLnByb3RvY29sO1xuICAgICAgICAgICAgaWYgKChwcm90b2NvbCA9PT0gbnVsbCB8fCBwcm90b2NvbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogcHJvdG9jb2wuZm10KSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJhdyA9IEpTT04ucGFyc2Uob2JqLnJhdyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJhdykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmF3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG4gPSBwYXJzZUludChyYXdbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4obikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6ICdmYWlsZWQgdG8gcGFyc2UgSlNPTicgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgICAgfSxcbiAgICAgICAgZGVjb2RlQXV0aEFuY2hvcjogZnVuY3Rpb24gKGxpc3QsIGhsaXN0LCBjaykge1xuICAgICAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICAgICAgdmFyIGFtYXAgPSB7fTtcbiAgICAgICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgICAgICB2YXIgbGFzdCA9IGxpc3RbMF07XG4gICAgICAgICAgICBpZiAobGFzdC5wcm90b2NvbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIk5vdCB2YWxpZCBhbmNob3JcIiB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobWFwLCBhbWFwLCBlcnJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IGxhc3QucHJvdG9jb2w7XG4gICAgICAgICAgICBzZWxmLmF1dGhIaWRlTGlzdChwcm90b2NvbCwgZnVuY3Rpb24gKGhsaXN0LCByZXNNYXAsIGhlcnJzKSB7XG4gICAgICAgICAgICAgICAgZXJycy5wdXNoLmFwcGx5KGVycnMsIGhlcnJzKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIHJlc01hcCkge1xuICAgICAgICAgICAgICAgICAgICBhbWFwW2tdID0gcmVzTWFwW2tdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgaG1hcCA9IHt9O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaG1hcFtobGlzdFtpXS50b1N0cmluZygpXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm93ID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhtYXBbcm93LmJsb2NrLnRvU3RyaW5nKCldKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcm93LnByb3RvY29sIHx8IHJvdy5wcm90b2NvbC5mbXQgIT09IHByb3RvY29sXzIuZm9ybWF0VHlwZS5KU09OIHx8IHJvdy5yYXcgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bWFwID0gSlNPTi5wYXJzZShyb3cucmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gdG1hcClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBba10gPSB0bWFwW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IGVycm9yIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhtYXAsIGFtYXAsIGVycnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGF1dGhIaWRlTGlzdDogZnVuY3Rpb24gKHByb3RvY29sLCBjaykge1xuICAgICAgICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgICAgICBpZiAoIXByb3RvY29sLmhpZGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIG1hcCwgZXJycyk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbC5oaWRlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socHJvdG9jb2wuaGlkZSwgbWFwLCBlcnJzKTtcbiAgICAgICAgICAgIHNlbGYuZ2V0QW5jaG9yKFtwcm90b2NvbC5oaWRlLCAwXSwgZnVuY3Rpb24gKGFuY2hvckgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gYW5jaG9ySDtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgbWFwLCBlcnJzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGhsaXN0ID0gc2VsZi5kZWNvZGVIaWRlQW5jaG9yKGFuY2hvckgpO1xuICAgICAgICAgICAgICAgIHZhciBlcnJIID0gaGxpc3Q7XG4gICAgICAgICAgICAgICAgaWYgKGVyckguZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnJIKTtcbiAgICAgICAgICAgICAgICB2YXIgYW5jaG9yID0gYW5jaG9ySDtcbiAgICAgICAgICAgICAgICBtYXBbXCJcIi5jb25jYXQoYW5jaG9yLm5hbWUsIFwiX1wiKS5jb25jYXQoYW5jaG9yLmJsb2NrKV0gPSBhbmNob3I7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGhsaXN0LCBtYXAsIGVycnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGlzVmFsaWRBbmNob3I6IGZ1bmN0aW9uIChoaWRlLCBkYXRhLCBjaywgcGFyYW1zKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwYXJhbXMpO1xuICAgICAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBjdXIgPSBkYXRhLmJsb2NrO1xuICAgICAgICAgICAgdmFyIG92ZXJsb2FkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShoaWRlKSkge1xuICAgICAgICAgICAgICAgIHZhciBobGlzdCA9IGhpZGU7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBobGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyID09PSBobGlzdFtpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucHJlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKHsgZXJyb3I6IFwiT3V0IG9mIFwiLmNvbmNhdChkYXRhLm5hbWUsIFwiIGxpbWl0ZWRcIikgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxvYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhudWxsLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3X2xpbmsgPSAoMCwgZGVjb2Rlcl8xLmxpbmtDcmVhdG9yKShbZGF0YS5uYW1lLCBkYXRhLnByZV0sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobmV3X2xpbmssIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgaF9sb2NhdGlvbiA9IFtoaWRlLCAwXTtcbiAgICAgICAgICAgICAgICBzZWxmLmdldEFuY2hvcihoX2xvY2F0aW9uLCBmdW5jdGlvbiAoaGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcyA9IHNlbGYuZGVjb2RlSGlkZUFuY2hvcihoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhsaXN0ID0gcmVzO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyID09PSBobGlzdFtpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnByZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJPdXQgb2YgXCIuY29uY2F0KGRhdGEubmFtZSwgXCIgbGltaXRlZFwiKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxvYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycywgb3ZlcmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3X2xpbmsgPSAoMCwgZGVjb2Rlcl8xLmxpbmtDcmVhdG9yKShbZGF0YS5uYW1lLCBkYXRhLnByZV0sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG5ld19saW5rLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG51bGwsIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2hlY2tBdXRob3JpdHk6IGZ1bmN0aW9uIChjYWxsZXIsIGFwcCwgY2spIHtcbiAgICAgICAgICAgIGlmIChhcHAudHlwZSAhPT0gcHJvdG9jb2xfMi5yYXdUeXBlLkFQUCkge1xuICAgICAgICAgICAgICAgIGNhbGxlci5lcnJvci5wdXNoKHsgZXJyb3I6IFwiQW5zd2VyIGlzIG5vdCBjQXBwLlwiIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGZyb20gPSBjYWxsZXIuZGF0YVtcIlwiLmNvbmNhdChjYWxsZXIubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY2FsbGVyLmxvY2F0aW9uWzFdKV07XG4gICAgICAgICAgICB2YXIgc2lnbmVyID0gZnJvbS5zaWduZXI7XG4gICAgICAgICAgICB2YXIgYXV0aHMgPSBhcHAuYXV0aDtcbiAgICAgICAgICAgIGlmIChhdXRocyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmVtcHR5KGF1dGhzKSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsZXIuYXBwID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRoc1tzaWduZXJdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxlci5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm8gYXV0aG9yaXR5IG9mIGNhbGxlci5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF1dGhzW3NpZ25lcl0gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsZXIuYXBwID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQVBJID09PSBudWxsIHx8IEFQSSA9PT0gdm9pZCAwID8gdm9pZCAwIDogQVBJLmNvbW1vbi5ibG9jayhmdW5jdGlvbiAoYmxvY2ssIGhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYmxvY2sgPiBhdXRoc1tzaWduZXJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsZXIuZXJyb3IucHVzaCh7IGVycm9yOiBcIkF1dGhvcml0eSBvdXQgb2YgdGltZS5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldFBhcmFtczogZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgICAgIHZhciBhcnIgPSBhcmdzLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IGFycltpXTtcbiAgICAgICAgICAgICAgICB2YXIga3YgPSByb3cuc3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgICAgIGlmIChrdi5sZW5ndGggIT09IDIpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHBhcmFtZXRlclwiIH07XG4gICAgICAgICAgICAgICAgbWFwW2t2WzBdXSA9IGt2WzFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSxcbiAgICAgICAgZW1wdHk6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgfTtcbiAgICB2YXIgZGVjb2RlciA9IHt9O1xuICAgIGRlY29kZXJbcHJvdG9jb2xfMi5yYXdUeXBlLkFQUF0gPSBzZWxmLmRlY29kZUFwcDtcbiAgICBkZWNvZGVyW3Byb3RvY29sXzIucmF3VHlwZS5EQVRBXSA9IHNlbGYuZGVjb2RlRGF0YTtcbiAgICBkZWNvZGVyW3Byb3RvY29sXzIucmF3VHlwZS5MSUJdID0gc2VsZi5kZWNvZGVMaWI7XG4gICAgdmFyIHJ1biA9IGZ1bmN0aW9uIChsaW5rZXIsIGlucHV0QVBJLCBjaywgZmVuY2UpIHtcbiAgICAgICAgaWYgKEFQSSA9PT0gbnVsbCAmJiBpbnB1dEFQSSAhPT0gbnVsbClcbiAgICAgICAgICAgIEFQSSA9IGlucHV0QVBJO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gKDAsIGRlY29kZXJfMS5saW5rRGVjb2RlcikobGlua2VyKTtcbiAgICAgICAgaWYgKHRhcmdldC5lcnJvcilcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh0YXJnZXQpO1xuICAgICAgICB2YXIgY09iamVjdCA9IHtcbiAgICAgICAgICAgIHR5cGU6IHByb3RvY29sXzIucmF3VHlwZS5OT05FLFxuICAgICAgICAgICAgbG9jYXRpb246IFt0YXJnZXQubG9jYXRpb25bMF0sIHRhcmdldC5sb2NhdGlvblsxXSAhPT0gMCA/IHRhcmdldC5sb2NhdGlvblsxXSA6IDBdLFxuICAgICAgICAgICAgZXJyb3I6IFtdLFxuICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICBpbmRleDogW251bGwsIG51bGxdLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGFyZ2V0LnBhcmFtKVxuICAgICAgICAgICAgY09iamVjdC5wYXJhbWV0ZXIgPSB0YXJnZXQucGFyYW07XG4gICAgICAgIGNvbnNvbGUubG9nKHRhcmdldCk7XG4gICAgICAgIHNlbGYuZ2V0QW5jaG9yKHRhcmdldC5sb2NhdGlvbiwgZnVuY3Rpb24gKHJlc0FuY2hvcikge1xuICAgICAgICAgICAgdmFyIGVyciA9IHJlc0FuY2hvcjtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjT2JqZWN0LmVycm9yLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc0FuY2hvcjtcbiAgICAgICAgICAgIGlmIChjT2JqZWN0LmxvY2F0aW9uWzFdID09PSAwKVxuICAgICAgICAgICAgICAgIGNPYmplY3QubG9jYXRpb25bMV0gPSBkYXRhLmJsb2NrO1xuICAgICAgICAgICAgY09iamVjdC5kYXRhW1wiXCIuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY09iamVjdC5sb2NhdGlvblsxXSldID0gZGF0YTtcbiAgICAgICAgICAgIGlmIChkYXRhLnByb3RvY29sID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm8gdmFsaWQgcHJvdG9jb2xcIiB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdHlwZSA9ICFkYXRhLnByb3RvY29sLnR5cGUgPyBcIlwiIDogZGF0YS5wcm90b2NvbC50eXBlO1xuICAgICAgICAgICAgaWYgKCFkZWNvZGVyW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm90IGVhc3kgcHJvdG9jb2wgdHlwZVwiIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhLnByb3RvY29sICYmIGRhdGEucHJvdG9jb2wuaGlkZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5pc1ZhbGlkQW5jaG9yKGRhdGEucHJvdG9jb2wuaGlkZSwgZGF0YSwgZnVuY3Rpb24gKHZhbGlkTGluaywgZXJycywgb3ZlcmxvYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgICAgICAgICAoX2EgPSBjT2JqZWN0LmVycm9yKS5wdXNoLmFwcGx5KF9hLCBlcnJzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG92ZXJsb2FkKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsaWRMaW5rICE9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bih2YWxpZExpbmssIEFQSSwgY2spO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UmVzdWx0KHR5cGUpO1xuICAgICAgICAgICAgICAgIH0sIGNPYmplY3QucGFyYW1ldGVyID09PSB1bmRlZmluZWQgPyB7fSA6IGNPYmplY3QucGFyYW1ldGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHQodHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRSZXN1bHQodHlwZSkge1xuICAgICAgICAgICAgICAgIHNlbGYubWVyZ2UoZGF0YS5uYW1lLCBkYXRhLnByb3RvY29sLCB7fSwgZnVuY3Rpb24gKG1lcmdlUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lcmdlUmVzdWx0LmF1dGggIT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmF1dGggPSBtZXJnZVJlc3VsdC5hdXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaGlkZSAhPSBudWxsICYmIG1lcmdlUmVzdWx0LmhpZGUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmhpZGUgPSBtZXJnZVJlc3VsdC5oaWRlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5lcnJvci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIChfYSA9IGNPYmplY3QuZXJyb3IpLnB1c2guYXBwbHkoX2EsIG1lcmdlUmVzdWx0LmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMy5yZWxhdGVkSW5kZXguQVVUSF0gIT09IG51bGwgJiYgY09iamVjdC5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY09iamVjdC5pbmRleFtwcm90b2NvbF8zLnJlbGF0ZWRJbmRleC5BVVRIXSA9IG1lcmdlUmVzdWx0LmluZGV4W3Byb3RvY29sXzMucmVsYXRlZEluZGV4LkFVVEhdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5pbmRleFtwcm90b2NvbF8zLnJlbGF0ZWRJbmRleC5ISURFXSAhPT0gbnVsbCAmJiBjT2JqZWN0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmluZGV4W3Byb3RvY29sXzMucmVsYXRlZEluZGV4LkhJREVdID0gbWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMy5yZWxhdGVkSW5kZXguSElERV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBtZXJnZVJlc3VsdC5tYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNPYmplY3QuZGF0YVtrXSA9IG1lcmdlUmVzdWx0Lm1hcFtrXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2Rlclt0eXBlXShjT2JqZWN0LCBmdW5jdGlvbiAocmVzRmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNGaXJzdC5jYWxsICYmICFmZW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcHBfbGluayA9ICgwLCBkZWNvZGVyXzEubGlua0NyZWF0b3IpKHJlc0ZpcnN0LmNhbGwsIHJlc0ZpcnN0LnBhcmFtZXRlciA9PT0gdW5kZWZpbmVkID8ge30gOiByZXNGaXJzdC5wYXJhbWV0ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bihhcHBfbGluaywgQVBJLCBmdW5jdGlvbiAocmVzQXBwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNoZWNrQXV0aG9yaXR5KHJlc0ZpcnN0LCByZXNBcHAsIGNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXNGaXJzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGV4cG9ydHMuZWFzeVJ1biA9IHJ1bjtcbn0pO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2ludGVycHJldGVyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9