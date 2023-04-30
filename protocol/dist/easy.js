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
    search: [],
    start: 0,
    end: 0,
    stamp: function () {
        return new Date().getTime();
    },
};
var self = {
    getAnchor: function (location, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var anchor = location[0], block = location[1];
        if (!debug.disable)
            debug.search.push(location); //debug information 
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
    debug.start = debug.stamp();
    run(linker, inputAPI, function (resRun) {
        if (!debug.disable)
            resRun.debug = debug; //add debug information
        debug.end = debug.stamp();
        return ck && ck(resRun);
    });
};
var final_run = (debug.disable ? run : debug_run);
exports.easyRun = final_run;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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eEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLDRCQUE0QjtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLGlDQUFpQztBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLHVDQUF1QztBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVIQUF1SDtBQUN2SDtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsZUFBZSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL2xpYi9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NoYXJlbmMvY2hhcmVuYy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY3J5cHQvY3J5cHQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2lzLWJ1ZmZlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbWQ1L21kNS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXV0aC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZGVjb2Rlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaGlkZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcHJvdG9jb2wuanMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy8uL3NyYy9pbnRlcnByZXRlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJsZXQgc2VhcmNoPW51bGw7XG5sZXQgdGFyZ2V0PW51bGw7XG5jb25zdCBzZWxmPXtcbiAgICBnZXRMaWJzOihsaXN0LGNrLGNhY2hlLG9yZGVyKT0+e1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBTdGFydDoke0pTT04uc3RyaW5naWZ5KGxpc3QpfWApO1xuICAgICAgICBpZighY2FjaGUpIGNhY2hlPXt9O1xuICAgICAgICBpZighb3JkZXIpIG9yZGVyPVtdO1xuICAgICAgICBjb25zdCByb3c9bGlzdC5zaGlmdCgpO1xuICAgICAgICBjb25zdCBhbmNob3I9KEFycmF5LmlzQXJyYXkocm93KT9yb3dbMF06cm93KS50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBibG9jaz1BcnJheS5pc0FycmF5KHJvdyk/cm93WzFdOjA7XG5cbiAgICAgICAgLy8xLmNoZWNrIGxpYiBsb2FkaW5nIHN0YXR1c1xuICAgICAgICBpZihjYWNoZVthbmNob3JdKSByZXR1cm4gc2VsZi5nZXRMaWJzKGxpc3QsY2ssY2FjaGUsb3JkZXIpO1xuXG4gICAgICAgIC8vMi5nZXQgdGFyZ2V0IGFuY2hvclxuICAgICAgICBzZWxmLmdldEFuY2hvcihhbmNob3IsYmxvY2ssKGFuLHJlcyk9PntcbiAgICAgICAgICAgIGNhY2hlW2FuXT0hcmVzP3tlcnJvcjonbm8gc3VjaCBhbmNob3InfTpyZXM7XG4gICAgICAgICAgICBpZighcmVzLnByb3RvY29sIHx8ICghcmVzLnByb3RvY29sLmV4dCAmJiAhcmVzLnByb3RvY29sLmxpYikpe1xuICAgICAgICAgICAgICAgIG9yZGVyLnB1c2goYW4pO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgY29uc3QgcXU9e1xuICAgICAgICAgICAgICAgICAgICBlbnRyeTphbixcbiAgICAgICAgICAgICAgICAgICAgbGliOnJlcy5wcm90b2NvbCAmJiByZXMucHJvdG9jb2wubGliP3Jlcy5wcm90b2NvbC5saWI6W10sXG4gICAgICAgICAgICAgICAgICAgIGV4dDpyZXMucHJvdG9jb2wgJiYgcmVzLnByb3RvY29sLmV4dD9yZXMucHJvdG9jb2wuZXh0OltdLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgb3JkZXIucHVzaChxdSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHJlcy5wcm90b2NvbCAmJiByZXMucHJvdG9jb2wuZXh0KXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk9cmVzLnByb3RvY29sLmV4dC5sZW5ndGg7aT4wO2ktLSkgbGlzdC51bnNoaWZ0KHJlcy5wcm90b2NvbC5leHRbaS0xXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihyZXMucHJvdG9jb2wgJiYgcmVzLnByb3RvY29sLmxpYil7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpPXJlcy5wcm90b2NvbC5saWIubGVuZ3RoO2k+MDtpLS0pIGxpc3QudW5zaGlmdChyZXMucHJvdG9jb2wubGliW2ktMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihsaXN0Lmxlbmd0aD09PTApIHJldHVybiBjayAmJiBjayhjYWNoZSxvcmRlcik7XG4gICAgICAgICAgICBzZWxmLmdldExpYnMobGlzdCxjayxjYWNoZSxvcmRlcik7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0QW5jaG9yOihhbmNob3IsYmxvY2ssY2spPT57XG4gICAgICAgIGlmKCFhbmNob3IpIHJldHVybiBjayAmJiBjayhhbmNob3IsJycpO1xuICAgICAgICBjb25zdCBmdW49YmxvY2s9PT0wP3NlYXJjaDp0YXJnZXQ7XG4gICAgICAgIGZ1bihhbmNob3IsIChyZXMpPT57XG4gICAgICAgICAgICBpZighcmVzIHx8ICghcmVzLm93bmVyKSkgcmV0dXJuIGNrICYmIGNrKGFuY2hvciwnJyk7XG4gICAgICAgICAgICBpZighcmVzLmVtcHR5KXtcbiAgICAgICAgICAgICAgICAgY29uc3QgZHQ9e1xuICAgICAgICAgICAgICAgICAgICBrZXk6cmVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHJhdzpyZXMucmF3LFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbDpyZXMucHJvdG9jb2wsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soYW5jaG9yLGR0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWNvZGVMaWI6KGR0KT0+e1xuICAgICAgICBjb25zdCByZXN1bHQ9e3R5cGU6J2Vycm9yJyxkYXRhOicnfTtcbiAgICAgICAgaWYoZHQuZXJyb3Ipe1xuICAgICAgICAgICAgcmVzdWx0LmVycm9yPWR0LmVycm9yO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCFkdC5wcm90b2NvbCl7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3I9J1VuZXhjZXB0IGRhdGEgZm9ybWF0JztcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm90bz1kdC5wcm90b2NvbDtcbiAgICAgICAgaWYoIXByb3RvLmZtdCl7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3I9J0FuY2hvciBmb3JtYXQgbG9zdCc7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC50eXBlPXByb3RvLmZtdDtcblxuICAgICAgICAvL3NvbHZlIHJhdyBwcm9ibGVtOyBoZXggdG8gYXNjaWlcbiAgICAgICAgaWYoZHQucmF3LnN1YnN0cigwLCAyKS50b0xvd2VyQ2FzZSgpPT09JzB4Jyl7XG4gICAgICAgICAgICByZXN1bHQuZGF0YT1kZWNvZGVVUklDb21wb25lbnQoZHQucmF3LnNsaWNlKDIpLnJlcGxhY2UoL1xccysvZywgJycpLnJlcGxhY2UoL1swLTlhLWZdezJ9L2csICclJCYnKSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzdWx0LmRhdGE9ZHQucmF3O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcbiAgICBcbiAgICBnZXRDb21wbGV4T3JkZXI6KG5hbWUsbWFwLHF1ZXVlLGhvbGQpPT57XG4gICAgICAgIGlmKCFxdWV1ZSkgcXVldWU9W107ICAgICAgICAvL+iOt+WPlueahFxuICAgICAgICBpZighaG9sZCkgaG9sZD1bXTsgICAgICAgICAgLy8xLueUqOadpeihqOi+vuWkhOeQhueKtuaAgVxuXG4gICAgICAgIGlmKG1hcFtuYW1lXT09PXRydWUgJiYgaG9sZC5sZW5ndGg9PT0wKSByZXR1cm4gcXVldWU7XG4gICAgICAgIGNvbnN0IHJvdz1tYXBbbmFtZV07XG5cbiAgICAgICAgY29uc3QgbGFzdD1ob2xkLmxlbmd0aCE9PTA/aG9sZFtob2xkLmxlbmd0aC0xXTpudWxsO1xuICAgICAgICBjb25zdCByZWNvdmVyPShsYXN0IT09bnVsbCYmbGFzdC5uYW1lPT09bmFtZSk/aG9sZC5wb3AoKTpudWxsO1xuXG4gICAgICAgIC8vMS5jaGVjayBsaWIgY29tcGxleDtcbiAgICAgICAgaWYocm93LmxpYiAmJiByb3cubGliLmxlbmd0aD4wKXtcbiAgICAgICAgICAgIGlmKHJlY292ZXI9PT1udWxsKXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPHJvdy5saWIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpYj1yb3cubGliW2ldO1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdyZWFkeSB0byBjaGVjayBsaWI6JytsaWIpO1xuICAgICAgICAgICAgICAgICAgICBpZihtYXBbbGliXT09PXRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChsaWIpO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGQucHVzaCh7bGliOmksbmFtZTpuYW1lfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIobGliLG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIGlmKHJlY292ZXIubGliIT09dW5kZWZpbmVkICYmIHJlY292ZXIubGliIT09cm93LmxpYi5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9cmVjb3Zlci5saWIrMTtpPHJvdy5saWIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaWI9cm93LmxpYltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3JlYWR5IHRvIGNoZWNrIGxpYjonK2xpYik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihtYXBbbGliXT09PXRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gobGliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbGQucHVzaCh7bGliOmksbmFtZTpuYW1lfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Q29tcGxleE9yZGVyKGxpYixtYXAscXVldWUsaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihyZWNvdmVyPT09bnVsbCkgcXVldWUucHVzaChuYW1lKTtcblxuICAgICAgICAvLzIuY2hlY2sgZXh0ZW5kIGNvbXBsZXg7XG4gICAgICAgIGlmKHJvdy5leHQgJiYgcm93LmV4dC5sZW5ndGg+MCl7XG4gICAgICAgICAgICBpZihyZWNvdmVyIT09bnVsbCl7XG4gICAgICAgICAgICAgICAgaWYocmVjb3Zlci5leHQhPT11bmRlZmluZWQgJiYgcmVjb3Zlci5leHQhPT1yb3cuZXh0Lmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT1yZWNvdmVyLmV4dCsxO2k8cm93LmV4dC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dD1yb3cuZXh0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYobWFwW2V4dF09PT10cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob2xkLnB1c2goe2V4dDppLG5hbWU6bmFtZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihleHQsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxyb3cuZXh0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHQ9cm93LmV4dFtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYobWFwW2V4dF09PT10cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBob2xkLnB1c2goe2V4dDppLG5hbWU6bmFtZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Q29tcGxleE9yZGVyKGV4dCxtYXAscXVldWUsaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihob2xkLmxlbmd0aCE9PTApe1xuICAgICAgICAgICAgY29uc3QgbGFzdD1ob2xkW2hvbGQubGVuZ3RoLTFdO1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Q29tcGxleE9yZGVyKGxhc3QubmFtZSxtYXAscXVldWUsaG9sZCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcXVldWU7XG4gICAgfSxcbiAgICBtZXJnZU9yZGVyOihvcmRlcik9PntcbiAgICAgICAgY29uc3QgY29tcGxleD17fTtcbiAgICAgICAgY29uc3QgbWFwPXt9O1xuICAgICAgICBjb25zdCBkb25lPXt9O1xuICAgICAgICBjb25zdCBxdWV1ZT1bXTtcbiAgICAgICAgZm9yKGxldCBpPTA7aTxvcmRlci5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGNvbnN0IHJvdz1vcmRlcltpXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygcm93ICE9PSAnc3RyaW5nJyAmJiByb3cuZW50cnkhPT11bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIGNvbXBsZXhbcm93LmVudHJ5XT10cnVlO1xuICAgICAgICAgICAgICAgIG1hcFtyb3cuZW50cnldPXJvdztcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIG1hcFtyb3ddPXRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IobGV0IGk9MDtpPG9yZGVyLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgY29uc3Qgcm93PW9yZGVyW2ldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByb3cgPT09ICdzdHJpbmcnIHx8IHJvdyBpbnN0YW5jZW9mIFN0cmluZyl7XG4gICAgICAgICAgICAgICAgaWYoZG9uZVtyb3ddKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgICAgZG9uZVtyb3ddPXRydWU7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAvLzIuY29tcGxleCBsaWJcbiAgICAgICAgICAgICAgICAvLzIuMS5hZGQgcmVxdWlyZWQgbGlic1xuICAgICAgICAgICAgICAgIGlmKHJvdy5saWIgJiYgcm93LmxpYi5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cm93LmxpYi5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpYj1yb3cubGliW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZVtsaWJdKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbXBsZXhbbGliXSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3F1ZXVlPXNlbGYuZ2V0Q29tcGxleE9yZGVyKGxpYixtYXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2xpYn06JHtKU09OLnN0cmluZ2lmeShjcXVldWUpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBqPTA7ajxjcXVldWUubGVuZ3RoO2orKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaWI9Y3F1ZXVlW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lW2NsaWJdKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChjbGliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZVtjbGliXT10cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gobGliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lW2xpYl09dHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLzIuMi5hZGQgbGliIGJvZHlcbiAgICAgICAgICAgICAgICBpZighZG9uZVtyb3cuZW50cnldKXtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChyb3cuZW50cnkpO1xuICAgICAgICAgICAgICAgICAgICBkb25lW3Jvdy5lbnRyeV09dHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLzIuMy5hZGQgcmVxdWlyZWQgZXh0ZW5kIHBsdWdpbnNcbiAgICAgICAgICAgICAgICBpZihyb3cuZXh0ICYmIHJvdy5leHQubGVuZ3RoPjApe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPHJvdy5leHQubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleHQ9cm93LmV4dFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmVbZXh0XSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjb21wbGV4W2V4dF0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNxdWV1ZT1zZWxmLmdldENvbXBsZXhPcmRlcihleHQsbWFwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGo9MDtqPGNxdWV1ZS5sZW5ndGg7aisrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2V4dD1jcXVldWVbal07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmVbY2V4dF0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGNleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lW2NleHRdPXRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVbZXh0XT10cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHF1ZXVlO1xuICAgIH0sXG4gICAgcmVncm91cENvZGU6KG1hcCxvcmRlcik9PntcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtYXApO1xuICAgICAgICBjb25zdCBkZWNvZGU9c2VsZi5kZWNvZGVMaWI7XG4gICAgICAgIGxldCBqcz0nJztcbiAgICAgICAgbGV0IGNzcz0nJztcbiAgICAgICAgbGV0IGRvbmU9e307XG4gICAgICAgIGxldCBmYWlsZWQ9e307XG4gICAgICAgIGxldCBlcnJvcj1mYWxzZTsgICAgLy/moIflv5fkvY3ovpPlh7pcblxuICAgICAgICBjb25zdCBvZHM9c2VsZi5tZXJnZU9yZGVyKG9yZGVyKTtcbiAgICAgICAgZm9yKGxldCBpPTA7aTxvZHMubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBjb25zdCByb3c9b2RzW2ldO1xuICAgICAgICAgICAgaWYoZG9uZVtyb3ddKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGR0PW1hcFtyb3ddO1xuICAgICAgICAgICAgY29uc3QgcmVzPWRlY29kZShkdCk7XG4gICAgICAgICAgICBkb25lW3Jvd109dHJ1ZTtcbiAgICAgICAgICAgIGlmKHJlcy5lcnJvcil7XG4gICAgICAgICAgICAgICAgZmFpbGVkW3Jvd109cmVzLmVycm9yO1xuICAgICAgICAgICAgICAgIGVycm9yPXRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqcys9cmVzLnR5cGU9PT1cImpzXCI/cmVzLmRhdGE6Jyc7XG4gICAgICAgICAgICBjc3MrPXJlcy50eXBlPT09XCJjc3NcIj9yZXMuZGF0YTonJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2pzOmpzLGNzczpjc3MsZmFpbGVkOmZhaWxlZCxvcmRlcjpvZHMsZXJyb3I6ZXJyb3J9O1xuICAgIH0sXG59XG5cbmV4cG9ydHMuTG9hZGVyID0obGlzdCxBUEksY2spPT57XG4gICAgc2VhcmNoPUFQSS5zZWFyY2g7XG4gICAgdGFyZ2V0PUFQSS50YXJnZXQ7XG4gICAgc2VsZi5nZXRMaWJzKGxpc3QsY2spO1xufTtcblxuZXhwb3J0cy5MaWJzPShsaXN0LEFQSSxjayk9PntcbiAgICBzZWFyY2g9QVBJLnNlYXJjaDtcbiAgICB0YXJnZXQ9QVBJLnRhcmdldDtcbiAgICBzZWxmLmdldExpYnMobGlzdCwoZHQsb3JkZXIpPT57ICAgICAgICAgICAgICAgIFxuICAgICAgICBjb25zdCBjb2RlPXNlbGYucmVncm91cENvZGUoZHQsb3JkZXIpO1xuICAgICAgICByZXR1cm4gY2sgJiYgY2soY29kZSk7XG4gICAgfSk7XG59OyIsInZhciBjaGFyZW5jID0ge1xuICAvLyBVVEYtOCBlbmNvZGluZ1xuICB1dGY4OiB7XG4gICAgLy8gQ29udmVydCBhIHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBzdHJpbmdUb0J5dGVzOiBmdW5jdGlvbihzdHIpIHtcbiAgICAgIHJldHVybiBjaGFyZW5jLmJpbi5zdHJpbmdUb0J5dGVzKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdHIpKSk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgc3RyaW5nXG4gICAgYnl0ZXNUb1N0cmluZzogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKGNoYXJlbmMuYmluLmJ5dGVzVG9TdHJpbmcoYnl0ZXMpKSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIEJpbmFyeSBlbmNvZGluZ1xuICBiaW46IHtcbiAgICAvLyBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIHN0cmluZ1RvQnl0ZXM6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspXG4gICAgICAgIGJ5dGVzLnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBzdHJpbmdcbiAgICBieXRlc1RvU3RyaW5nOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgZm9yICh2YXIgc3RyID0gW10sIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIHN0ci5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pKTtcbiAgICAgIHJldHVybiBzdHIuam9pbignJyk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNoYXJlbmM7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBiYXNlNjRtYXBcbiAgICAgID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nLFxuXG4gIGNyeXB0ID0ge1xuICAgIC8vIEJpdC13aXNlIHJvdGF0aW9uIGxlZnRcbiAgICByb3RsOiBmdW5jdGlvbihuLCBiKSB7XG4gICAgICByZXR1cm4gKG4gPDwgYikgfCAobiA+Pj4gKDMyIC0gYikpO1xuICAgIH0sXG5cbiAgICAvLyBCaXQtd2lzZSByb3RhdGlvbiByaWdodFxuICAgIHJvdHI6IGZ1bmN0aW9uKG4sIGIpIHtcbiAgICAgIHJldHVybiAobiA8PCAoMzIgLSBiKSkgfCAobiA+Pj4gYik7XG4gICAgfSxcblxuICAgIC8vIFN3YXAgYmlnLWVuZGlhbiB0byBsaXR0bGUtZW5kaWFuIGFuZCB2aWNlIHZlcnNhXG4gICAgZW5kaWFuOiBmdW5jdGlvbihuKSB7XG4gICAgICAvLyBJZiBudW1iZXIgZ2l2ZW4sIHN3YXAgZW5kaWFuXG4gICAgICBpZiAobi5jb25zdHJ1Y3RvciA9PSBOdW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIGNyeXB0LnJvdGwobiwgOCkgJiAweDAwRkYwMEZGIHwgY3J5cHQucm90bChuLCAyNCkgJiAweEZGMDBGRjAwO1xuICAgICAgfVxuXG4gICAgICAvLyBFbHNlLCBhc3N1bWUgYXJyYXkgYW5kIHN3YXAgYWxsIGl0ZW1zXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG4ubGVuZ3RoOyBpKyspXG4gICAgICAgIG5baV0gPSBjcnlwdC5lbmRpYW4obltpXSk7XG4gICAgICByZXR1cm4gbjtcbiAgICB9LFxuXG4gICAgLy8gR2VuZXJhdGUgYW4gYXJyYXkgb2YgYW55IGxlbmd0aCBvZiByYW5kb20gYnl0ZXNcbiAgICByYW5kb21CeXRlczogZnVuY3Rpb24obikge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXTsgbiA+IDA7IG4tLSlcbiAgICAgICAgYnl0ZXMucHVzaChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTYpKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYmlnLWVuZGlhbiAzMi1iaXQgd29yZHNcbiAgICBieXRlc1RvV29yZHM6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciB3b3JkcyA9IFtdLCBpID0gMCwgYiA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKywgYiArPSA4KVxuICAgICAgICB3b3Jkc1tiID4+PiA1XSB8PSBieXRlc1tpXSA8PCAoMjQgLSBiICUgMzIpO1xuICAgICAgcmV0dXJuIHdvcmRzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGJpZy1lbmRpYW4gMzItYml0IHdvcmRzIHRvIGEgYnl0ZSBhcnJheVxuICAgIHdvcmRzVG9CeXRlczogZnVuY3Rpb24od29yZHMpIHtcbiAgICAgIGZvciAodmFyIGJ5dGVzID0gW10sIGIgPSAwOyBiIDwgd29yZHMubGVuZ3RoICogMzI7IGIgKz0gOClcbiAgICAgICAgYnl0ZXMucHVzaCgod29yZHNbYiA+Pj4gNV0gPj4+ICgyNCAtIGIgJSAzMikpICYgMHhGRik7XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBieXRlIGFycmF5IHRvIGEgaGV4IHN0cmluZ1xuICAgIGJ5dGVzVG9IZXg6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBoZXggPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBoZXgucHVzaCgoYnl0ZXNbaV0gPj4+IDQpLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgIGhleC5wdXNoKChieXRlc1tpXSAmIDB4RikudG9TdHJpbmcoMTYpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoZXguam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBoZXggc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIGhleFRvQnl0ZXM6IGZ1bmN0aW9uKGhleCkge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgYyA9IDA7IGMgPCBoZXgubGVuZ3RoOyBjICs9IDIpXG4gICAgICAgIGJ5dGVzLnB1c2gocGFyc2VJbnQoaGV4LnN1YnN0cihjLCAyKSwgMTYpKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBiYXNlLTY0IHN0cmluZ1xuICAgIGJ5dGVzVG9CYXNlNjQ6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBiYXNlNjQgPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICB2YXIgdHJpcGxldCA9IChieXRlc1tpXSA8PCAxNikgfCAoYnl0ZXNbaSArIDFdIDw8IDgpIHwgYnl0ZXNbaSArIDJdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDQ7IGorKylcbiAgICAgICAgICBpZiAoaSAqIDggKyBqICogNiA8PSBieXRlcy5sZW5ndGggKiA4KVxuICAgICAgICAgICAgYmFzZTY0LnB1c2goYmFzZTY0bWFwLmNoYXJBdCgodHJpcGxldCA+Pj4gNiAqICgzIC0gaikpICYgMHgzRikpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGJhc2U2NC5wdXNoKCc9Jyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZTY0LmpvaW4oJycpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYmFzZS02NCBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgYmFzZTY0VG9CeXRlczogZnVuY3Rpb24oYmFzZTY0KSB7XG4gICAgICAvLyBSZW1vdmUgbm9uLWJhc2UtNjQgY2hhcmFjdGVyc1xuICAgICAgYmFzZTY0ID0gYmFzZTY0LnJlcGxhY2UoL1teQS1aMC05K1xcL10vaWcsICcnKTtcblxuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgaSA9IDAsIGltb2Q0ID0gMDsgaSA8IGJhc2U2NC5sZW5ndGg7XG4gICAgICAgICAgaW1vZDQgPSArK2kgJSA0KSB7XG4gICAgICAgIGlmIChpbW9kNCA9PSAwKSBjb250aW51ZTtcbiAgICAgICAgYnl0ZXMucHVzaCgoKGJhc2U2NG1hcC5pbmRleE9mKGJhc2U2NC5jaGFyQXQoaSAtIDEpKVxuICAgICAgICAgICAgJiAoTWF0aC5wb3coMiwgLTIgKiBpbW9kNCArIDgpIC0gMSkpIDw8IChpbW9kNCAqIDIpKVxuICAgICAgICAgICAgfCAoYmFzZTY0bWFwLmluZGV4T2YoYmFzZTY0LmNoYXJBdChpKSkgPj4+ICg2IC0gaW1vZDQgKiAyKSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGNyeXB0O1xufSkoKTtcbiIsIi8qIVxuICogRGV0ZXJtaW5lIGlmIGFuIG9iamVjdCBpcyBhIEJ1ZmZlclxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxodHRwczovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxuLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZ1xuLy8gT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIob2JqKSB8fCBpc1Nsb3dCdWZmZXIob2JqKSB8fCAhIW9iai5faXNCdWZmZXIpXG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyIChvYmopIHtcbiAgcmV0dXJuICEhb2JqLmNvbnN0cnVjdG9yICYmIHR5cGVvZiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iailcbn1cblxuLy8gRm9yIE5vZGUgdjAuMTAgc3VwcG9ydC4gUmVtb3ZlIHRoaXMgZXZlbnR1YWxseS5cbmZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBvYmouc2xpY2UgPT09ICdmdW5jdGlvbicgJiYgaXNCdWZmZXIob2JqLnNsaWNlKDAsIDApKVxufVxuIiwiKGZ1bmN0aW9uKCl7XHJcbiAgdmFyIGNyeXB0ID0gcmVxdWlyZSgnY3J5cHQnKSxcclxuICAgICAgdXRmOCA9IHJlcXVpcmUoJ2NoYXJlbmMnKS51dGY4LFxyXG4gICAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJ2lzLWJ1ZmZlcicpLFxyXG4gICAgICBiaW4gPSByZXF1aXJlKCdjaGFyZW5jJykuYmluLFxyXG5cclxuICAvLyBUaGUgY29yZVxyXG4gIG1kNSA9IGZ1bmN0aW9uIChtZXNzYWdlLCBvcHRpb25zKSB7XHJcbiAgICAvLyBDb252ZXJ0IHRvIGJ5dGUgYXJyYXlcclxuICAgIGlmIChtZXNzYWdlLmNvbnN0cnVjdG9yID09IFN0cmluZylcclxuICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5lbmNvZGluZyA9PT0gJ2JpbmFyeScpXHJcbiAgICAgICAgbWVzc2FnZSA9IGJpbi5zdHJpbmdUb0J5dGVzKG1lc3NhZ2UpO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgbWVzc2FnZSA9IHV0Zjguc3RyaW5nVG9CeXRlcyhtZXNzYWdlKTtcclxuICAgIGVsc2UgaWYgKGlzQnVmZmVyKG1lc3NhZ2UpKVxyXG4gICAgICBtZXNzYWdlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobWVzc2FnZSwgMCk7XHJcbiAgICBlbHNlIGlmICghQXJyYXkuaXNBcnJheShtZXNzYWdlKSAmJiBtZXNzYWdlLmNvbnN0cnVjdG9yICE9PSBVaW50OEFycmF5KVxyXG4gICAgICBtZXNzYWdlID0gbWVzc2FnZS50b1N0cmluZygpO1xyXG4gICAgLy8gZWxzZSwgYXNzdW1lIGJ5dGUgYXJyYXkgYWxyZWFkeVxyXG5cclxuICAgIHZhciBtID0gY3J5cHQuYnl0ZXNUb1dvcmRzKG1lc3NhZ2UpLFxyXG4gICAgICAgIGwgPSBtZXNzYWdlLmxlbmd0aCAqIDgsXHJcbiAgICAgICAgYSA9ICAxNzMyNTg0MTkzLFxyXG4gICAgICAgIGIgPSAtMjcxNzMzODc5LFxyXG4gICAgICAgIGMgPSAtMTczMjU4NDE5NCxcclxuICAgICAgICBkID0gIDI3MTczMzg3ODtcclxuXHJcbiAgICAvLyBTd2FwIGVuZGlhblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIG1baV0gPSAoKG1baV0gPDwgIDgpIHwgKG1baV0gPj4+IDI0KSkgJiAweDAwRkYwMEZGIHxcclxuICAgICAgICAgICAgICgobVtpXSA8PCAyNCkgfCAobVtpXSA+Pj4gIDgpKSAmIDB4RkYwMEZGMDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUGFkZGluZ1xyXG4gICAgbVtsID4+PiA1XSB8PSAweDgwIDw8IChsICUgMzIpO1xyXG4gICAgbVsoKChsICsgNjQpID4+PiA5KSA8PCA0KSArIDE0XSA9IGw7XHJcblxyXG4gICAgLy8gTWV0aG9kIHNob3J0Y3V0c1xyXG4gICAgdmFyIEZGID0gbWQ1Ll9mZixcclxuICAgICAgICBHRyA9IG1kNS5fZ2csXHJcbiAgICAgICAgSEggPSBtZDUuX2hoLFxyXG4gICAgICAgIElJID0gbWQ1Ll9paTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpICs9IDE2KSB7XHJcblxyXG4gICAgICB2YXIgYWEgPSBhLFxyXG4gICAgICAgICAgYmIgPSBiLFxyXG4gICAgICAgICAgY2MgPSBjLFxyXG4gICAgICAgICAgZGQgPSBkO1xyXG5cclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsgMF0sICA3LCAtNjgwODc2OTM2KTtcclxuICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIG1baSsgMV0sIDEyLCAtMzg5NTY0NTg2KTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsgMl0sIDE3LCAgNjA2MTA1ODE5KTtcclxuICAgICAgYiA9IEZGKGIsIGMsIGQsIGEsIG1baSsgM10sIDIyLCAtMTA0NDUyNTMzMCk7XHJcbiAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBtW2krIDRdLCAgNywgLTE3NjQxODg5Nyk7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krIDVdLCAxMiwgIDEyMDAwODA0MjYpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKyA2XSwgMTcsIC0xNDczMjMxMzQxKTtcclxuICAgICAgYiA9IEZGKGIsIGMsIGQsIGEsIG1baSsgN10sIDIyLCAtNDU3MDU5ODMpO1xyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKyA4XSwgIDcsICAxNzcwMDM1NDE2KTtcclxuICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIG1baSsgOV0sIDEyLCAtMTk1ODQxNDQxNyk7XHJcbiAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBtW2krMTBdLCAxNywgLTQyMDYzKTtcclxuICAgICAgYiA9IEZGKGIsIGMsIGQsIGEsIG1baSsxMV0sIDIyLCAtMTk5MDQwNDE2Mik7XHJcbiAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBtW2krMTJdLCAgNywgIDE4MDQ2MDM2ODIpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKzEzXSwgMTIsIC00MDM0MTEwMSk7XHJcbiAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBtW2krMTRdLCAxNywgLTE1MDIwMDIyOTApO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKzE1XSwgMjIsICAxMjM2NTM1MzI5KTtcclxuXHJcbiAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBtW2krIDFdLCAgNSwgLTE2NTc5NjUxMCk7XHJcbiAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBtW2krIDZdLCAgOSwgLTEwNjk1MDE2MzIpO1xyXG4gICAgICBjID0gR0coYywgZCwgYSwgYiwgbVtpKzExXSwgMTQsICA2NDM3MTc3MTMpO1xyXG4gICAgICBiID0gR0coYiwgYywgZCwgYSwgbVtpKyAwXSwgMjAsIC0zNzM4OTczMDIpO1xyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKyA1XSwgIDUsIC03MDE1NTg2OTEpO1xyXG4gICAgICBkID0gR0coZCwgYSwgYiwgYywgbVtpKzEwXSwgIDksICAzODAxNjA4Myk7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krMTVdLCAxNCwgLTY2MDQ3ODMzNSk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krIDRdLCAyMCwgLTQwNTUzNzg0OCk7XHJcbiAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBtW2krIDldLCAgNSwgIDU2ODQ0NjQzOCk7XHJcbiAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBtW2krMTRdLCAgOSwgLTEwMTk4MDM2OTApO1xyXG4gICAgICBjID0gR0coYywgZCwgYSwgYiwgbVtpKyAzXSwgMTQsIC0xODczNjM5NjEpO1xyXG4gICAgICBiID0gR0coYiwgYywgZCwgYSwgbVtpKyA4XSwgMjAsICAxMTYzNTMxNTAxKTtcclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsxM10sICA1LCAtMTQ0NDY4MTQ2Nyk7XHJcbiAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBtW2krIDJdLCAgOSwgLTUxNDAzNzg0KTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsgN10sIDE0LCAgMTczNTMyODQ3Myk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krMTJdLCAyMCwgLTE5MjY2MDc3MzQpO1xyXG5cclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsgNV0sICA0LCAtMzc4NTU4KTtcclxuICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIG1baSsgOF0sIDExLCAtMjAyMjU3NDQ2Myk7XHJcbiAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBtW2krMTFdLCAxNiwgIDE4MzkwMzA1NjIpO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKzE0XSwgMjMsIC0zNTMwOTU1Nik7XHJcbiAgICAgIGEgPSBISChhLCBiLCBjLCBkLCBtW2krIDFdLCAgNCwgLTE1MzA5OTIwNjApO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKyA0XSwgMTEsICAxMjcyODkzMzUzKTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsgN10sIDE2LCAtMTU1NDk3NjMyKTtcclxuICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIG1baSsxMF0sIDIzLCAtMTA5NDczMDY0MCk7XHJcbiAgICAgIGEgPSBISChhLCBiLCBjLCBkLCBtW2krMTNdLCAgNCwgIDY4MTI3OTE3NCk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krIDBdLCAxMSwgLTM1ODUzNzIyMik7XHJcbiAgICAgIGMgPSBISChjLCBkLCBhLCBiLCBtW2krIDNdLCAxNiwgLTcyMjUyMTk3OSk7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krIDZdLCAyMywgIDc2MDI5MTg5KTtcclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsgOV0sICA0LCAtNjQwMzY0NDg3KTtcclxuICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIG1baSsxMl0sIDExLCAtNDIxODE1ODM1KTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsxNV0sIDE2LCAgNTMwNzQyNTIwKTtcclxuICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIG1baSsgMl0sIDIzLCAtOTk1MzM4NjUxKTtcclxuXHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krIDBdLCAgNiwgLTE5ODYzMDg0NCk7XHJcbiAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBtW2krIDddLCAxMCwgIDExMjY4OTE0MTUpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKzE0XSwgMTUsIC0xNDE2MzU0OTA1KTtcclxuICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIG1baSsgNV0sIDIxLCAtNTc0MzQwNTUpO1xyXG4gICAgICBhID0gSUkoYSwgYiwgYywgZCwgbVtpKzEyXSwgIDYsICAxNzAwNDg1NTcxKTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsgM10sIDEwLCAtMTg5NDk4NjYwNik7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krMTBdLCAxNSwgLTEwNTE1MjMpO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKyAxXSwgMjEsIC0yMDU0OTIyNzk5KTtcclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsgOF0sICA2LCAgMTg3MzMxMzM1OSk7XHJcbiAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBtW2krMTVdLCAxMCwgLTMwNjExNzQ0KTtcclxuICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIG1baSsgNl0sIDE1LCAtMTU2MDE5ODM4MCk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krMTNdLCAyMSwgIDEzMDkxNTE2NDkpO1xyXG4gICAgICBhID0gSUkoYSwgYiwgYywgZCwgbVtpKyA0XSwgIDYsIC0xNDU1MjMwNzApO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKzExXSwgMTAsIC0xMTIwMjEwMzc5KTtcclxuICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIG1baSsgMl0sIDE1LCAgNzE4Nzg3MjU5KTtcclxuICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIG1baSsgOV0sIDIxLCAtMzQzNDg1NTUxKTtcclxuXHJcbiAgICAgIGEgPSAoYSArIGFhKSA+Pj4gMDtcclxuICAgICAgYiA9IChiICsgYmIpID4+PiAwO1xyXG4gICAgICBjID0gKGMgKyBjYykgPj4+IDA7XHJcbiAgICAgIGQgPSAoZCArIGRkKSA+Pj4gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY3J5cHQuZW5kaWFuKFthLCBiLCBjLCBkXSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gQXV4aWxpYXJ5IGZ1bmN0aW9uc1xyXG4gIG1kNS5fZmYgID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcclxuICAgIHZhciBuID0gYSArIChiICYgYyB8IH5iICYgZCkgKyAoeCA+Pj4gMCkgKyB0O1xyXG4gICAgcmV0dXJuICgobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSkpICsgYjtcclxuICB9O1xyXG4gIG1kNS5fZ2cgID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcclxuICAgIHZhciBuID0gYSArIChiICYgZCB8IGMgJiB+ZCkgKyAoeCA+Pj4gMCkgKyB0O1xyXG4gICAgcmV0dXJuICgobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSkpICsgYjtcclxuICB9O1xyXG4gIG1kNS5faGggID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcclxuICAgIHZhciBuID0gYSArIChiIF4gYyBeIGQpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuICBtZDUuX2lpICA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCB4LCBzLCB0KSB7XHJcbiAgICB2YXIgbiA9IGEgKyAoYyBeIChiIHwgfmQpKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcblxyXG4gIC8vIFBhY2thZ2UgcHJpdmF0ZSBibG9ja3NpemVcclxuICBtZDUuX2Jsb2Nrc2l6ZSA9IDE2O1xyXG4gIG1kNS5fZGlnZXN0c2l6ZSA9IDE2O1xyXG5cclxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtZXNzYWdlLCBvcHRpb25zKSB7XHJcbiAgICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IG1lc3NhZ2UgPT09IG51bGwpXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBhcmd1bWVudCAnICsgbWVzc2FnZSk7XHJcblxyXG4gICAgdmFyIGRpZ2VzdGJ5dGVzID0gY3J5cHQud29yZHNUb0J5dGVzKG1kNShtZXNzYWdlLCBvcHRpb25zKSk7XHJcbiAgICByZXR1cm4gb3B0aW9ucyAmJiBvcHRpb25zLmFzQnl0ZXMgPyBkaWdlc3RieXRlcyA6XHJcbiAgICAgICAgb3B0aW9ucyAmJiBvcHRpb25zLmFzU3RyaW5nID8gYmluLmJ5dGVzVG9TdHJpbmcoZGlnZXN0Ynl0ZXMpIDpcclxuICAgICAgICBjcnlwdC5ieXRlc1RvSGV4KGRpZ2VzdGJ5dGVzKTtcclxuICB9O1xyXG5cclxufSkoKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyFpbXBvcnRhbnQgVGhpcyBpcyB0aGUgbGlicmFyeSBmb3IgY3JlYXRpbmcgYXV0aCBkYXRhXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNoZWNrQXV0aCA9IGV4cG9ydHMuZWFzeUF1dGggPSB2b2lkIDA7XG52YXIgbWQ1ID0gcmVxdWlyZShcIm1kNVwiKTtcbi8vIGNyZWF0ZSB0aGUgYW5jaG9yIGhpZGRlaW5nIGRlZmF1bHQgZGF0YVxudmFyIGNyZWF0b3IgPSBmdW5jdGlvbiAoYW5jaG9yLCBjaywgaXNOZXcpIHtcbn07XG5leHBvcnRzLmVhc3lBdXRoID0gY3JlYXRvcjtcbi8vIGNoZWNrIGFuY2hvciB0byBnZXQgYXV0aCBsaXN0LiBcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChhbmNob3IsIHByb3RvY29sLCBjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICBcImxpc3RcIjogbnVsbCxcbiAgICAgICAgXCJhbmNob3JcIjogbnVsbCwgLy90YXJnZXQgYW5jaG9yIHRvIGdldCByZXN1bHRcbiAgICB9O1xuICAgIC8vVE9ETywgYXV0byBNRDUgYW5jaG9yIGZ1bmN0aW9uIGlzIG5vdCB0ZXN0ZWQgeWV0LlxuICAgIGlmIChwcm90b2NvbC5hdXRoKSB7XG4gICAgICAgIC8vMS5jaGVjayB3ZXRoZXIgdGFyZ2V0IGFuY2hvciBcbiAgICAgICAgaWYgKHR5cGVvZiBwcm90b2NvbC5hdXRoID09PSBcInN0cmluZ1wiIHx8IEFycmF5LmlzQXJyYXkocHJvdG9jb2wuYXV0aCkpIHtcbiAgICAgICAgICAgIGRhdGEuYW5jaG9yID0gcHJvdG9jb2wuYXV0aDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEubGlzdCA9IHByb3RvY29sLmF1dGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vMi5jaGVjayBkZWZhdWx0IGFuY2hvclxuICAgICAgICBpZiAocHJvdG9jb2wuc2FsdCkge1xuICAgICAgICAgICAgZGF0YS5hbmNob3IgPSBtZDUoYW5jaG9yICsgcHJvdG9jb2wuc2FsdFswXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNrICYmIGNrKGRhdGEpO1xufTtcbmV4cG9ydHMuY2hlY2tBdXRoID0gY2hlY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBsaWJyYXJ5IGZvciBkZWNvZGluZyBhbmNob3IgbGlua1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5saW5rRGVjb2RlciA9IGV4cG9ydHMubGlua0NyZWF0b3IgPSB2b2lkIDA7XG52YXIgc2V0dGluZyA9IHtcbiAgICBcImNoZWNrXCI6IGZhbHNlLFxuICAgIFwidXRmOFwiOiB0cnVlLFxuICAgIFwicHJlXCI6IFwiYW5jaG9yOi8vXCIsIC8vcHJvdG9jb2wgcHJlZml4XG59O1xudmFyIHNlbGYgPSB7XG4gICAgZ2V0UGFyYW1zOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFyciA9IHN0ci5zcGxpdChcIiZcIik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm93ID0gYXJyW2ldO1xuICAgICAgICAgICAgdmFyIGt2ID0gcm93LnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIGlmIChrdi5sZW5ndGggIT09IDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiZXJyb3IgcGFyYW1ldGVyXCIgfTtcbiAgICAgICAgICAgIG1hcFtrdlswXV0gPSBrdlsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH0sXG4gICAgY29tYmluZVBhcmFtczogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAoIW9iailcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgbGlzdC5wdXNoKFwiXCIuY29uY2F0KGssIFwiPVwiKS5jb25jYXQob2JqW2tdKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICByZXR1cm4gbGlzdC5qb2luKFwiJlwiKTtcbiAgICB9LFxufTtcbnZhciBjcmVhdG9yID0gZnVuY3Rpb24gKGxvY2FsLCBwYXJhbXMpIHtcbiAgICB2YXIgc3RyID0gc2VsZi5jb21iaW5lUGFyYW1zKHBhcmFtcyk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobG9jYWwpKSB7XG4gICAgICAgIGlmIChsb2NhbFsxXSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHNldHRpbmcucHJlKS5jb25jYXQobG9jYWxbMF0sIFwiL1wiKS5jb25jYXQobG9jYWxbMV0pLmNvbmNhdCghc3RyID8gc3RyIDogXCI/XCIgKyBzdHIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHNldHRpbmcucHJlKS5jb25jYXQobG9jYWxbMF0pLmNvbmNhdCghc3RyID8gc3RyIDogXCI/XCIgKyBzdHIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQoc2V0dGluZy5wcmUpLmNvbmNhdChsb2NhbCkuY29uY2F0KCFzdHIgPyBzdHIgOiBcIj9cIiArIHN0cik7XG4gICAgfVxufTtcbmV4cG9ydHMubGlua0NyZWF0b3IgPSBjcmVhdG9yO1xudmFyIGRlY29kZXIgPSBmdW5jdGlvbiAobGluaykge1xuICAgIHZhciByZXMgPSB7XG4gICAgICAgIGxvY2F0aW9uOiBbXCJcIiwgMF0sXG4gICAgfTtcbiAgICB2YXIgc3RyID0gbGluay50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgIHZhciBwcmUgPSBzZXR0aW5nLnByZTtcbiAgICAvLzAuIGZvcm1hdCBjaGVja1xuICAgIGlmIChzdHIubGVuZ3RoIDw9IHByZS5sZW5ndGggKyAxKVxuICAgICAgICByZXR1cm4geyBlcnJvcjogXCJpbnZhbGlkIHN0cmluZ1wiIH07XG4gICAgdmFyIGhlYWQgPSBzdHIuc3Vic3RyaW5nKDAsIHByZS5sZW5ndGgpO1xuICAgIGlmIChoZWFkICE9PSBwcmUpXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcImludmFsaWQgcHJvdG9jb2xcIiB9O1xuICAgIC8vMS4gcmVtb3ZlIHByZWZpeCBgYW5jaG9yOi8vYFxuICAgIHZhciBib2R5ID0gc3RyLnN1YnN0cmluZyhwcmUubGVuZ3RoLCBzdHIubGVuZ3RoKTtcbiAgICAvLzIuIGNoZWNrIHBhcmFtZXRlclxuICAgIHZhciBhcnIgPSBib2R5LnNwbGl0KFwiP1wiKTtcbiAgICBpZiAoYXJyLmxlbmd0aCA+IDIpXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHJlcXVlc3QsIHBsZWFzZSBjaGVjayBhbmNob3IgbmFtZVwiIH07XG4gICAgdmFyIGlzUGFyYW0gPSBhcnIubGVuZ3RoID09PSAxID8gZmFsc2UgOiB0cnVlO1xuICAgIGlmIChpc1BhcmFtKSB7XG4gICAgICAgIHZhciBwcyA9IHNlbGYuZ2V0UGFyYW1zKGFyclsxXSk7XG4gICAgICAgIGlmIChwcy5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHBzO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5wYXJhbSA9IHNlbGYuZ2V0UGFyYW1zKGFyclsxXSk7XG4gICAgfVxuICAgIGJvZHkgPSBhcnJbMF07XG4gICAgLy8zLiBkZWNvZGUgYW5jaG9yIGxvY2F0aW9uXG4gICAgdmFyIGxzID0gYm9keS5zcGxpdChcIi9cIik7XG4gICAgdmFyIGxhc3QgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChsc1tpXSAhPT0gJycpXG4gICAgICAgICAgICBsYXN0LnB1c2gobHNbaV0pO1xuICAgIH1cbiAgICAvLzQuIGV4cG9ydCByZXN1bHRcbiAgICBpZiAobGFzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVzLmxvY2F0aW9uWzBdID0gbGFzdFswXTtcbiAgICAgICAgcmVzLmxvY2F0aW9uWzFdID0gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBlbGUgPSBsYXN0LnBvcCgpO1xuICAgICAgICB2YXIgYmxvY2sgPSBwYXJzZUludChlbGUpO1xuICAgICAgICBpZiAoaXNOYU4oYmxvY2spKVxuICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiYmxvY2sgbnVtYmVyIGVycm9yXCIgfTtcbiAgICAgICAgcmVzLmxvY2F0aW9uWzFdID0gYmxvY2s7XG4gICAgICAgIHJlcy5sb2NhdGlvblswXSA9IGxhc3Quam9pbignLycpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcbmV4cG9ydHMubGlua0RlY29kZXIgPSBkZWNvZGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNoZWNrSGlkZSA9IGV4cG9ydHMuZWFzeUhpZGUgPSB2b2lkIDA7XG52YXIgbWQ1ID0gcmVxdWlyZShcIm1kNVwiKTtcbnZhciBjcmVhdG9yID0gZnVuY3Rpb24gKGFuY2hvcikge1xufTtcbmV4cG9ydHMuZWFzeUhpZGUgPSBjcmVhdG9yO1xuLy8gY2hlY2sgYW5jaG9yIHRvIGdldCBoaWRlIGxpc3RcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChhbmNob3IsIHByb3RvY29sLCBjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICBcImxpc3RcIjogbnVsbCxcbiAgICAgICAgXCJhbmNob3JcIjogbnVsbCwgLy90YXJnZXQgYW5jaG9yIHRvIGdldCByZXN1bHRcbiAgICB9O1xuICAgIC8vVE9ETywgYXV0byBNRDUgYW5jaG9yIGZ1bmN0aW9uIGlzIG5vdCB0ZXN0ZWQgeWV0LlxuICAgIGlmIChwcm90b2NvbC5oaWRlKSB7XG4gICAgICAgIC8vMS5jaGVjayB3ZXRoZXIgdGFyZ2V0IGFuY2hvciBcbiAgICAgICAgaWYgKHR5cGVvZiBwcm90b2NvbC5oaWRlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBkYXRhLmFuY2hvciA9IHByb3RvY29sLmhpZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbC5oaWRlKSkge1xuICAgICAgICAgICAgZGF0YS5saXN0ID0gcHJvdG9jb2wuaGlkZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vZGF0YS5saXN0PXByb3RvY29sLmhpZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vMi5jaGVjayBkZWZhdWx0IGFuY2hvclxuICAgICAgICBpZiAocHJvdG9jb2wuc2FsdCkge1xuICAgICAgICAgICAgZGF0YS5hbmNob3IgPSBtZDUoYW5jaG9yICsgcHJvdG9jb2wuc2FsdFsxXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNrICYmIGNrKGRhdGEpO1xufTtcbmV4cG9ydHMuY2hlY2tIaWRlID0gY2hlY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBUeXBlc2NyaXB0IGltcGxlbWVudCBvZiBFc2F5IFByb3RvY29sIHZlcnNpb24gMS4wLlxuLy8haW1wb3J0YW50IEVhc3kgUHJvdG9jb2wgaXMgYSBzaW1wbGUgcHJvdG9jb2wgdG8gbGF1bmNoIGNBcHAgdmlhIEFuY2hvciBuZXR3b3JrLlxuLy8haW1wb3J0YW50IEFsbCBmdW5jdGlvbnMgaW1wbGVtZW50LCBidXQgdGhpcyBpbXBsZW1lbnQgb25seSBzdXBwb3J0IEpTIHdpdGggQ1NTIGFwcGxpY2F0aW9uIFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5yZWxhdGVkSW5kZXggPSBleHBvcnRzLmtleXNBcHAgPSBleHBvcnRzLmNvZGVUeXBlID0gZXhwb3J0cy5mb3JtYXRUeXBlID0gZXhwb3J0cy5yYXdUeXBlID0gZXhwb3J0cy5lcnJvckxldmVsID0gdm9pZCAwO1xudmFyIGVycm9yTGV2ZWw7XG4oZnVuY3Rpb24gKGVycm9yTGV2ZWwpIHtcbiAgICBlcnJvckxldmVsW1wiRVJST1JcIl0gPSBcImVycm9yXCI7XG4gICAgZXJyb3JMZXZlbFtcIldBUk5cIl0gPSBcIndhcm5pbmdcIjtcbiAgICBlcnJvckxldmVsW1wiVU5FWENFUFRcIl0gPSBcInVuZXhjZXB0XCI7XG59KShlcnJvckxldmVsID0gZXhwb3J0cy5lcnJvckxldmVsIHx8IChleHBvcnRzLmVycm9yTGV2ZWwgPSB7fSkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKioqKioqZm9ybWF0IHBhcnQqKioqKioqKioqL1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIHJhd1R5cGU7XG4oZnVuY3Rpb24gKHJhd1R5cGUpIHtcbiAgICByYXdUeXBlW1wiREFUQVwiXSA9IFwiZGF0YVwiO1xuICAgIHJhd1R5cGVbXCJBUFBcIl0gPSBcImFwcFwiO1xuICAgIHJhd1R5cGVbXCJMSUJcIl0gPSBcImxpYlwiO1xuICAgIHJhd1R5cGVbXCJOT05FXCJdID0gXCJ1bmtub3dcIjtcbn0pKHJhd1R5cGUgPSBleHBvcnRzLnJhd1R5cGUgfHwgKGV4cG9ydHMucmF3VHlwZSA9IHt9KSk7XG52YXIgZm9ybWF0VHlwZTtcbihmdW5jdGlvbiAoZm9ybWF0VHlwZSkge1xuICAgIGZvcm1hdFR5cGVbXCJKQVZBU0NSSVBUXCJdID0gXCJqc1wiO1xuICAgIGZvcm1hdFR5cGVbXCJDU1NcIl0gPSBcImNzc1wiO1xuICAgIGZvcm1hdFR5cGVbXCJNQVJLRE9XTlwiXSA9IFwibWRcIjtcbiAgICBmb3JtYXRUeXBlW1wiSlNPTlwiXSA9IFwianNvblwiO1xuICAgIGZvcm1hdFR5cGVbXCJNSVhcIl0gPSBcIm1peFwiO1xuICAgIGZvcm1hdFR5cGVbXCJOT05FXCJdID0gXCJcIjtcbn0pKGZvcm1hdFR5cGUgPSBleHBvcnRzLmZvcm1hdFR5cGUgfHwgKGV4cG9ydHMuZm9ybWF0VHlwZSA9IHt9KSk7XG52YXIgY29kZVR5cGU7XG4oZnVuY3Rpb24gKGNvZGVUeXBlKSB7XG4gICAgY29kZVR5cGVbXCJBU0NJSVwiXSA9IFwiYXNjaWlcIjtcbiAgICBjb2RlVHlwZVtcIlVURjhcIl0gPSBcInV0ZjhcIjtcbiAgICBjb2RlVHlwZVtcIkhFWFwiXSA9IFwiaGV4XCI7XG4gICAgY29kZVR5cGVbXCJOT05FXCJdID0gXCJcIjtcbn0pKGNvZGVUeXBlID0gZXhwb3J0cy5jb2RlVHlwZSB8fCAoZXhwb3J0cy5jb2RlVHlwZSA9IHt9KSk7XG52YXIga2V5c0FwcDtcbihmdW5jdGlvbiAoa2V5c0FwcCkge1xufSkoa2V5c0FwcCA9IGV4cG9ydHMua2V5c0FwcCB8fCAoZXhwb3J0cy5rZXlzQXBwID0ge30pKTtcbnZhciByZWxhdGVkSW5kZXg7XG4oZnVuY3Rpb24gKHJlbGF0ZWRJbmRleCkge1xuICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJBVVRIXCJdID0gMF0gPSBcIkFVVEhcIjtcbiAgICByZWxhdGVkSW5kZXhbcmVsYXRlZEluZGV4W1wiSElERVwiXSA9IDFdID0gXCJISURFXCI7XG4gICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIlRSVVNUXCJdID0gMl0gPSBcIlRSVVNUXCI7XG4gICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIk5BTUVcIl0gPSAwXSA9IFwiTkFNRVwiO1xuICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJCTE9DS1wiXSA9IDFdID0gXCJCTE9DS1wiO1xufSkocmVsYXRlZEluZGV4ID0gZXhwb3J0cy5yZWxhdGVkSW5kZXggfHwgKGV4cG9ydHMucmVsYXRlZEluZGV4ID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBsaWJyYXJ5IGZvciBFc2F5IFByb3RvY29sIHYxLjBcbi8vIWltcG9ydGFudCBBbGwgZGF0YSBjb21lIGZyb20gYEFuY2hvciBMaW5rYFxuLy8haW1wb3J0YW50IFRoaXMgaW1wbGVtZW50IGV4dGVuZCBgYXV0aGAgYW5kIGBoaWRlYCBieSBzYWx0IHdheSB0byBsb2FkIGRhdGFcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZWFzeVJ1biA9IHZvaWQgMDtcbnZhciBwcm90b2NvbF8xID0gcmVxdWlyZShcIi4vcHJvdG9jb2xcIik7XG52YXIgcHJvdG9jb2xfMiA9IHJlcXVpcmUoXCIuL3Byb3RvY29sXCIpO1xudmFyIGRlY29kZXJfMSA9IHJlcXVpcmUoXCIuL2RlY29kZXJcIik7XG52YXIgYXV0aF8xID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbnZhciBoaWRlXzEgPSByZXF1aXJlKFwiLi9oaWRlXCIpO1xudmFyIF9hID0gcmVxdWlyZShcIi4uL2xpYi9sb2FkZXJcIiksIExvYWRlciA9IF9hLkxvYWRlciwgTGlicyA9IF9hLkxpYnM7XG4vL2NvbnN0IHthbmNob3JKU30gPXJlcXVpcmUoXCIuLi9saWIvYW5jaG9yXCIpO1xudmFyIEFQSSA9IG51bGw7XG4vL2RlYnVnIGRhdGEgdG8gaW1wcm92ZSB0aGUgZGV2ZWxvcG1lbnRcbnZhciBkZWJ1ZyA9IHtcbiAgICBkaXNhYmxlOiBmYWxzZSxcbiAgICBzZWFyY2g6IFtdLFxuICAgIHN0YXJ0OiAwLFxuICAgIGVuZDogMCxcbiAgICBzdGFtcDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfSxcbn07XG52YXIgc2VsZiA9IHtcbiAgICBnZXRBbmNob3I6IGZ1bmN0aW9uIChsb2NhdGlvbiwgY2spIHtcbiAgICAgICAgaWYgKEFQSSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIGFuY2hvciA9IGxvY2F0aW9uWzBdLCBibG9jayA9IGxvY2F0aW9uWzFdO1xuICAgICAgICBpZiAoIWRlYnVnLmRpc2FibGUpXG4gICAgICAgICAgICBkZWJ1Zy5zZWFyY2gucHVzaChsb2NhdGlvbik7IC8vZGVidWcgaW5mb3JtYXRpb24gXG4gICAgICAgIC8vY29uc29sZS5sb2coYENoZWNraW5nIDogJHtKU09OLnN0cmluZ2lmeShsb2NhdGlvbil9IHZpYSAke2FkZHJlc3N9YCk7XG4gICAgICAgIGlmIChibG9jayAhPT0gMCkge1xuICAgICAgICAgICAgQVBJLmNvbW1vbi50YXJnZXQoYW5jaG9yLCBibG9jaywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpbHRlckFuY2hvcihkYXRhLCBjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEFQSS5jb21tb24ubGF0ZXN0KGFuY2hvciwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpbHRlckFuY2hvcihkYXRhLCBjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZmlsdGVyQW5jaG9yOiBmdW5jdGlvbiAoZGF0YSwgY2spIHtcbiAgICAgICAgaWYgKCFkYXRhKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8gc3VjaCBhbmNob3IuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgIHZhciBlcnIgPSBkYXRhO1xuICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IGVyci5lcnJvciwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIGFuY2hvciA9IGRhdGE7XG4gICAgICAgIGlmIChhbmNob3IuZW1wdHkpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJFbXB0eSBhbmNob3IuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgIGlmICghYW5jaG9yLnByb3RvY29sKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8tcHJvdG9jb2wgYW5jaG9yLlwiIH0pO1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSBhbmNob3IucHJvdG9jb2w7XG4gICAgICAgIGlmICghcHJvdG9jb2wudHlwZSlcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIk5vdCBFYXN5UHJvdG9jb2wgYW5jaG9yLlwiIH0pO1xuICAgICAgICByZXR1cm4gY2sgJiYgY2soYW5jaG9yKTtcbiAgICB9LFxuICAgIGRlY29kZURhdGE6IGZ1bmN0aW9uIChjT2JqZWN0LCBjaykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBEZWNvZGUgZGF0YSBhbmNob3JgKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjT2JqZWN0KTtcbiAgICAgICAgY09iamVjdC50eXBlID0gcHJvdG9jb2xfMS5yYXdUeXBlLkRBVEE7XG4gICAgICAgIHZhciBkYXRhID0gY09iamVjdC5kYXRhW1wiXCIuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY09iamVjdC5sb2NhdGlvblsxXSldO1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSBkYXRhLnByb3RvY29sO1xuICAgICAgICBpZiAocHJvdG9jb2wgIT09IG51bGwgJiYgcHJvdG9jb2wuY2FsbCkge1xuICAgICAgICAgICAgY09iamVjdC5jYWxsID0gcHJvdG9jb2wuY2FsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgfSxcbiAgICBkZWNvZGVBcHA6IGZ1bmN0aW9uIChjT2JqZWN0LCBjaykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBEZWNvZGUgYXBwIGFuY2hvcmApO1xuICAgICAgICBjT2JqZWN0LnR5cGUgPSBwcm90b2NvbF8xLnJhd1R5cGUuQVBQO1xuICAgICAgICB2YXIgZGF0YSA9IGNPYmplY3QuZGF0YVtcIlwiLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzBdLCBcIl9cIikuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMV0pXTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gZGF0YS5wcm90b2NvbDtcbiAgICAgICAgY09iamVjdC5jb2RlID0gZGF0YS5yYXc7XG4gICAgICAgIGlmIChwcm90b2NvbCAhPT0gbnVsbCAmJiBwcm90b2NvbC5saWIpIHtcbiAgICAgICAgICAgIC8vRklYTUUgY29kZSBzaG91bGQgYmUgZGVmaW5lZCBjbGVhcmx5XG4gICAgICAgICAgICBzZWxmLmdldExpYnMocHJvdG9jb2wubGliLCBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY29kZSk7XG4gICAgICAgICAgICAgICAgY09iamVjdC5saWJzID0gY29kZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGVjb2RlTGliOiBmdW5jdGlvbiAoY09iamVjdCwgY2spIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgRGVjb2RlIGxpYiBhbmNob3JgKTtcbiAgICAgICAgY09iamVjdC50eXBlID0gcHJvdG9jb2xfMS5yYXdUeXBlLkxJQjtcbiAgICAgICAgdmFyIGRhdGEgPSBjT2JqZWN0LmRhdGFbXCJcIi5jb25jYXQoY09iamVjdC5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzFdKV07XG4gICAgICAgIHZhciBwcm90b2NvbCA9IGRhdGEucHJvdG9jb2w7XG4gICAgICAgIC8vMS5jaGVjayBhbmQgZ2V0IGxpYnNcbiAgICAgICAgaWYgKHByb3RvY29sICE9PSBudWxsICYmIHByb3RvY29sLmxpYikge1xuICAgICAgICAgICAgc2VsZi5nZXRMaWJzKHByb3RvY29sLmxpYiwgZnVuY3Rpb24gKGNvZGUpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGNvZGUpO1xuICAgICAgICAgICAgICAgIGNPYmplY3QubGlicyA9IGNvZGU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldExpYnM6IGZ1bmN0aW9uIChsaXN0LCBjaykge1xuICAgICAgICBpZiAoQVBJID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8gQVBJIHRvIGdldCBkYXRhLlwiLCBsZXZlbDogcHJvdG9jb2xfMS5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBSZWFkeSB0byBnZXQgbGliczogJHtKU09OLnN0cmluZ2lmeShsaXN0KX1gKTtcbiAgICAgICAgdmFyIFJQQyA9IHtcbiAgICAgICAgICAgIHNlYXJjaDogQVBJLmNvbW1vbi5sYXRlc3QsXG4gICAgICAgICAgICB0YXJnZXQ6IEFQSS5jb21tb24udGFyZ2V0LFxuICAgICAgICB9O1xuICAgICAgICBMaWJzKGxpc3QsIFJQQywgY2spO1xuICAgIH0sXG4gICAgZ2V0SGlzdG9yeTogZnVuY3Rpb24gKGxvY2F0aW9uLCBjaykge1xuICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICBpZiAoQVBJID09PSBudWxsKSB7XG4gICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgZXJycyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9pZihBUEk9PT1udWxsKSByZXR1cm4gY2sgJiYgY2soe2Vycm9yOlwiTm8gQVBJIHRvIGdldCBkYXRhLlwiLGxldmVsOmVycm9yTGV2ZWwuRVJST1J9KTtcbiAgICAgICAgdmFyIGFuY2hvciA9IGxvY2F0aW9uWzBdLCBibG9jayA9IGxvY2F0aW9uWzFdO1xuICAgICAgICBBUEkuY29tbW9uLmhpc3RvcnkoYW5jaG9yLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gcmVzO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJvcikge1xuICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0LCBlcnJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhbGlzdCA9IHJlcztcbiAgICAgICAgICAgIGlmIChhbGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJFbXB0eSBoaXN0b3J5XCIgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIGVycnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGFsaXN0LCBlcnJzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBjb21iaW5lIHRoZSBoaWRlIGFuZCBhdXRoIGxpc3QgdG8gcmVzdWx0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICAgYW5jaG9yXHQgICAgLy9gQW5jaG9yYCBuYW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9ICAgICAgcHJvdG9jb2wgICAgLy9FYXN5IFByb3RvY29sXG4gICAgICogQHBhcmFtIHtvYmplY3R9ICAgICAgY2ZnICAgICAgICAgLy9yZXZlcnNlZCBjb25maWcgcGFyYW1ldGVyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gICAgY2sgICAgICAgICAgLy9jYWxsYmFjaywgd2lsbCByZXR1cm4gdGhlIG1lcmdlIHJlc3VsdCwgaW5jbHVkaW5nIHRoZSByZWxhdGVkIGBhbmNob3JgXG4gICAgICogKi9cbiAgICBtZXJnZTogZnVuY3Rpb24gKGFuY2hvciwgcHJvdG9jb2wsIGNmZywgY2spIHtcbiAgICAgICAgaWYgKEFQSSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIFwiaGlkZVwiOiBbXSxcbiAgICAgICAgICAgIFwiYXV0aFwiOiBudWxsLFxuICAgICAgICAgICAgXCJlcnJvclwiOiBbXSxcbiAgICAgICAgICAgIFwiaW5kZXhcIjogW251bGwsIG51bGxdLFxuICAgICAgICAgICAgXCJtYXBcIjoge30sXG4gICAgICAgIH07XG4gICAgICAgIHZhciBtbGlzdCA9IFtdO1xuICAgICAgICAvLzEuIGNoZWNrIGBkZWNsYXJlZCBoaWRkZW5gIGFuZCBgYXV0aG9yaXR5YCBqdXN0IGJ5IHByb3RvY29sIGRhdGEuXG4gICAgICAgICgwLCBhdXRoXzEuY2hlY2tBdXRoKShhbmNob3IsIHByb3RvY29sLCBmdW5jdGlvbiAocmVzQXV0aCkge1xuICAgICAgICAgICAgKDAsIGhpZGVfMS5jaGVja0hpZGUpKGFuY2hvciwgcHJvdG9jb2wsIGZ1bmN0aW9uIChyZXNIaWRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc0F1dGguYW5jaG9yID09PSBudWxsICYmIHJlc0hpZGUuYW5jaG9yID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNBdXRoLmxpc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuYXV0aCA9IHJlc0F1dGgubGlzdDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc0hpZGUubGlzdClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5oaWRlID0gcmVzSGlkZS5saXN0O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzQXV0aC5hbmNob3IgPT09IG51bGwgJiYgcmVzSGlkZS5hbmNob3IgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhpZGVfYW5jaG9yID0gdHlwZW9mIHJlc0hpZGUuYW5jaG9yID09PSBcInN0cmluZ1wiID8gW3Jlc0hpZGUuYW5jaG9yLCAwXSA6IFtyZXNIaWRlLmFuY2hvclswXSwgcmVzSGlkZS5hbmNob3JbMV1dO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldEFuY2hvcihoaWRlX2FuY2hvciwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBlcnIuZXJyb3IgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNvbWJpbmVIaWRlKHJlc3VsdCwgZGF0YSwgZXJycywgY2spO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzQXV0aC5hbmNob3IgIT09IG51bGwgJiYgcmVzSGlkZS5hbmNob3IgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF1dGhfYW5jaG9yID0gdHlwZW9mIHJlc0F1dGguYW5jaG9yID09PSBcInN0cmluZ1wiID8gW3Jlc0F1dGguYW5jaG9yLCAwXSA6IFtyZXNBdXRoLmFuY2hvclswXSwgcmVzQXV0aC5hbmNob3JbMV1dO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldEhpc3RvcnkoYXV0aF9hbmNob3IsIGZ1bmN0aW9uIChhbGlzdCwgZXJyc0EpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNvbWJpbmVBdXRoKHJlc3VsdCwgYWxpc3QsIGVycnNBLCBjayk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNBdXRoLmFuY2hvciAhPT0gbnVsbCAmJiByZXNIaWRlLmFuY2hvciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGlkZV9hbmNob3IgPSB0eXBlb2YgcmVzSGlkZS5hbmNob3IgPT09IFwic3RyaW5nXCIgPyBbcmVzSGlkZS5hbmNob3IsIDBdIDogW3Jlc0hpZGUuYW5jaG9yWzBdLCByZXNIaWRlLmFuY2hvclsxXV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdXRoX2FuY2hvcl8xID0gdHlwZW9mIHJlc0F1dGguYW5jaG9yID09PSBcInN0cmluZ1wiID8gW3Jlc0F1dGguYW5jaG9yLCAwXSA6IFtyZXNBdXRoLmFuY2hvclswXSwgcmVzQXV0aC5hbmNob3JbMV1dO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldEFuY2hvcihoaWRlX2FuY2hvciwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBlcnIuZXJyb3IgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNvbWJpbmVIaWRlKHJlc3VsdCwgZGF0YSwgZXJycywgZnVuY3Rpb24gKGNoUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRIaXN0b3J5KGF1dGhfYW5jaG9yXzEsIGZ1bmN0aW9uIChhbGlzdCwgZXJyc0EpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jb21iaW5lQXV0aChjaFJlc3VsdCwgYWxpc3QsIGVycnNBLCBjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY29tYmluZUhpZGU6IGZ1bmN0aW9uIChyZXN1bHQsIGFuY2hvciwgZXJycywgY2spIHtcbiAgICAgICAgaWYgKGVycnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAvL0ZJWE1FIGNoYW5nZSB0byBzaW1wbGUgd2F5IHRvIGNvbWJpbmUgdGhlIGVycm9ycy5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXJycy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChlcnJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQubWFwW1wiXCIuY29uY2F0KGFuY2hvci5uYW1lLCBcIl9cIikuY29uY2F0KGFuY2hvci5ibG9jayldID0gYW5jaG9yO1xuICAgICAgICByZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguSElERV0gPSBbYW5jaG9yLm5hbWUsIGFuY2hvci5ibG9ja107XG4gICAgICAgIHZhciBkaGlkZSA9IHNlbGYuZGVjb2RlSGlkZUFuY2hvcihhbmNob3IpO1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGhpZGUpKSB7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3IucHVzaChkaGlkZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQuaGlkZSA9IGRoaWRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQpO1xuICAgIH0sXG4gICAgY29tYmluZUF1dGg6IGZ1bmN0aW9uIChyZXN1bHQsIGxpc3QsIGVycnMsIGNrKSB7XG4gICAgICAgIGlmIChlcnJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvci5wdXNoKGVycnNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdyA9IGxpc3RbaV07XG4gICAgICAgICAgICByZXN1bHQubWFwW1wiXCIuY29uY2F0KHJvdy5uYW1lLCBcIl9cIikuY29uY2F0KHJvdy5ibG9jayldID0gcm93O1xuICAgICAgICB9XG4gICAgICAgIHZhciBsYXN0ID0gbGlzdFswXTtcbiAgICAgICAgdmFyIGhsaXN0ID0gW107IC8vZ2V0IGxhdGVzdCBhdXRoIGFuY2hvciBoaWRlIGxpc3QuXG4gICAgICAgIHNlbGYuZGVjb2RlQXV0aEFuY2hvcihsaXN0LCBobGlzdCwgZnVuY3Rpb24gKG1hcCwgYW1hcCwgZXJycykge1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBhbWFwKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5tYXBba10gPSBhbWFwW2tdOyAvL2lmIGhpZGUgYW5jaG9yIGRhdGEsIG1lcmdlIHRvIHJlc3VsdFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlcnJzLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvci5wdXNoKGVycnNbaV0pO1xuICAgICAgICAgICAgcmVzdWx0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkFVVEhdID0gW2xhc3QubmFtZSwgMF07XG4gICAgICAgICAgICByZXN1bHQuYXV0aCA9IG1hcDtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRlY29kZUhpZGVBbmNob3I6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gb2JqLnByb3RvY29sO1xuICAgICAgICBpZiAoKHByb3RvY29sID09PSBudWxsIHx8IHByb3RvY29sID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcm90b2NvbC5mbXQpID09PSAnanNvbicpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhdyA9IEpTT04ucGFyc2Uob2JqLnJhdyk7XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhdy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG4gPSBwYXJzZUludChyYXdbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2gobik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBlcnJvcjogJ2ZhaWxlZCB0byBwYXJzZSBKU09OJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH0sXG4gICAgLy8haW1wb3J0YW50LCBieSB1c2luZyB0aGUgaGlzdG9yeSBvZiBhbmNob3IsIGBoaWRlYCBrZXl3b3JkIGlzIHN0aWxsIHN1cHBvcnRcbiAgICAvLyFpbXBvcnRhbnQsIGNoZWNraW5nIHRoZSBsYXRlc3QgYW5jaG9yIGRhdGEsIHVzaW5nIHRoZSBgaGlkZWAgZmVpbGQgdG8gZ2V0IGRhdGEuXG4gICAgZGVjb2RlQXV0aEFuY2hvcjogZnVuY3Rpb24gKGxpc3QsIGhsaXN0LCBjaykge1xuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhbWFwID0ge307XG4gICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgIC8vRklYTUUsIGlmIHRoZSBsYXRlc3QgYXV0aCBhbmNob3IgaXMgaGlkZGVuLG5lZWQgdG8gY2hlY2sgbmV4dCBvbmUuXG4gICAgICAgIHZhciBsYXN0ID0gbGlzdFswXTtcbiAgICAgICAgaWYgKGxhc3QucHJvdG9jb2wgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIk5vdCB2YWxpZCBhbmNob3JcIiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhtYXAsIGFtYXAsIGVycnMpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm90b2NvbCA9IGxhc3QucHJvdG9jb2w7XG4gICAgICAgIHNlbGYuYXV0aEhpZGVMaXN0KHByb3RvY29sLCBmdW5jdGlvbiAoaGxpc3QsIHJlc01hcCwgaGVycnMpIHtcbiAgICAgICAgICAgIGVycnMucHVzaC5hcHBseShlcnJzLCBoZXJycyk7XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIHJlc01hcCkge1xuICAgICAgICAgICAgICAgIGFtYXBba10gPSByZXNNYXBba107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaG1hcCA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBobGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGhtYXBbaGxpc3RbaV0udG9TdHJpbmcoKV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IGxpc3RbaV07XG4gICAgICAgICAgICAgICAgaWYgKGhtYXBbcm93LmJsb2NrLnRvU3RyaW5nKCldKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBpZiAoIXJvdy5wcm90b2NvbCB8fCByb3cucHJvdG9jb2wuZm10ICE9PSBwcm90b2NvbF8xLmZvcm1hdFR5cGUuSlNPTiB8fCByb3cucmF3ID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdG1hcCA9IEpTT04ucGFyc2Uocm93LnJhdyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gdG1hcClcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFtrXSA9IHRtYXBba107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogZXJyb3IgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG1hcCwgYW1hcCwgZXJycyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy9jaGVjayBhdXRoIGFuY2hvcidzIGhpZGUgbGlzdFxuICAgIGF1dGhIaWRlTGlzdDogZnVuY3Rpb24gKHByb3RvY29sLCBjaykge1xuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIGlmICghcHJvdG9jb2wuaGlkZSlcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0LCBtYXAsIGVycnMpO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbC5oaWRlKSlcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhwcm90b2NvbC5oaWRlLCBtYXAsIGVycnMpO1xuICAgICAgICBzZWxmLmdldEFuY2hvcihbcHJvdG9jb2wuaGlkZSwgMF0sIGZ1bmN0aW9uIChhbmNob3JIKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gYW5jaG9ySDtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBlcnJzLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgbWFwLCBlcnJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBobGlzdCA9IHNlbGYuZGVjb2RlSGlkZUFuY2hvcihhbmNob3JIKTtcbiAgICAgICAgICAgIHZhciBlcnJIID0gaGxpc3Q7XG4gICAgICAgICAgICBpZiAoZXJySC5lcnJvcilcbiAgICAgICAgICAgICAgICBlcnJzLnB1c2goZXJySCk7XG4gICAgICAgICAgICB2YXIgYW5jaG9yID0gYW5jaG9ySDtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5jaG9yKTtcbiAgICAgICAgICAgIG1hcFtcIlwiLmNvbmNhdChhbmNob3IubmFtZSwgXCJfXCIpLmNvbmNhdChhbmNob3IuYmxvY2spXSA9IGFuY2hvcjtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhobGlzdCwgbWFwLCBlcnJzKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjaGVja0xhc3Q6IGZ1bmN0aW9uIChuYW1lLCBibG9jaywgY2spIHtcbiAgICAgICAgQVBJID09PSBudWxsIHx8IEFQSSA9PT0gdm9pZCAwID8gdm9pZCAwIDogQVBJLmNvbW1vbi5vd25lcihuYW1lLCBmdW5jdGlvbiAob3duZXIsIGxhc3QpIHtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhibG9jayA9PT0gbGFzdCA/IHRydWUgOiBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy9jaGVjayB3ZXRoZXIgY3VycmVudCBhbmNob3IgaXMgaW4gdGhlIGhpZGUgbGlzdFxuICAgIGlzVmFsaWRBbmNob3I6IGZ1bmN0aW9uIChoaWRlLCBkYXRhLCBjaywgcGFyYW1zKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2cocGFyYW1zKTtcbiAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgdmFyIGN1ciA9IGRhdGEuYmxvY2s7XG4gICAgICAgIHZhciBvdmVybG9hZCA9IGZhbHNlOyAvL3dldGhlciB0byB0aGUgZW5kIG9mIGBBbmNob3JgIGhpc3RvcnlcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaGlkZSkpIHtcbiAgICAgICAgICAgIC8vMS5pZiB0aGUgaGlkZSBpcyBhcnJheSwgY2hlY2sgZGlyZWN0bHlcbiAgICAgICAgICAgIHZhciBobGlzdCA9IGhpZGU7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1ciA9PT0gaGxpc3RbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucHJlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJPdXQgb2YgXCIuY29uY2F0KGRhdGEubmFtZSwgXCIgbGltaXRlZFwiKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhudWxsLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld19saW5rID0gKDAsIGRlY29kZXJfMS5saW5rQ3JlYXRvcikoW2RhdGEubmFtZSwgZGF0YS5wcmVdLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobmV3X2xpbmssIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLzIuZ2V0IHRoZSBsYXRlc3QgaGlkZSBhbmNob3IgZGF0YVxuICAgICAgICAgICAgdmFyIGhfbG9jYXRpb24gPSBbaGlkZSwgMF07XG4gICAgICAgICAgICBzZWxmLmdldEFuY2hvcihoX2xvY2F0aW9uLCBmdW5jdGlvbiAoaGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gc2VsZi5kZWNvZGVIaWRlQW5jaG9yKGhkYXRhKTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVzO1xuICAgICAgICAgICAgICAgIGlmIChlcnIuZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgIHZhciBobGlzdCA9IHJlcztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXIgPT09IGhsaXN0W2ldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5wcmUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJPdXQgb2YgXCIuY29uY2F0KGRhdGEubmFtZSwgXCIgbGltaXRlZFwiKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVybG9hZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG51bGwsIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdfbGluayA9ICgwLCBkZWNvZGVyXzEubGlua0NyZWF0b3IpKFtkYXRhLm5hbWUsIGRhdGEucHJlXSwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhuZXdfbGluaywgZXJycywgb3ZlcmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhudWxsLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy9jaGVjayB0aGUgYXV0aG9yaXR5IGJldHdlZW4gYW5jaG9yc1xuICAgIGNoZWNrVHJ1c3Q6IGZ1bmN0aW9uIChjYWxsZXIsIGFwcCwgY2spIHtcbiAgICB9LFxuICAgIC8vY2hlY2sgdGhlIGF1dGhvcml0eSB0byBhY2NvdW50IGFkZHJlc3NcbiAgICBjaGVja0F1dGhvcml0eTogZnVuY3Rpb24gKGNhbGxlciwgYXBwLCBjaykge1xuICAgICAgICAvLzEuY2hlY2sgdGhlIGNhbGxlZCBhbmNob3IgdHlwZS5cbiAgICAgICAgaWYgKGFwcC50eXBlICE9PSBwcm90b2NvbF8xLnJhd1R5cGUuQVBQKSB7XG4gICAgICAgICAgICBjYWxsZXIuZXJyb3IucHVzaCh7IGVycm9yOiBcIkFuc3dlciBpcyBub3QgY0FwcC5cIiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vMi5jaGVjayB0aGUgYXV0aG9yaXR5XG4gICAgICAgIHZhciBmcm9tID0gY2FsbGVyLmRhdGFbXCJcIi5jb25jYXQoY2FsbGVyLmxvY2F0aW9uWzBdLCBcIl9cIikuY29uY2F0KGNhbGxlci5sb2NhdGlvblsxXSldO1xuICAgICAgICB2YXIgc2lnbmVyID0gZnJvbS5zaWduZXI7XG4gICAgICAgIHZhciBhdXRocyA9IGFwcC5hdXRoO1xuICAgICAgICAvLzIuMS4gbm8gYXV0aG9yaXR5IGRhdGEsIGNhbiBcbiAgICAgICAgaWYgKGF1dGhzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNhbGxlci5hcHAgPSBhcHA7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzZWxmLmVtcHR5KGF1dGhzKSkge1xuICAgICAgICAgICAgICAgIGNhbGxlci5hcHAgPSBhcHA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoYXV0aHNbc2lnbmVyXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxlci5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm8gYXV0aG9yaXR5IG9mIGNhbGxlci5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXV0aHNbc2lnbmVyXSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgQVBJID09PSBudWxsIHx8IEFQSSA9PT0gdm9pZCAwID8gdm9pZCAwIDogQVBJLmNvbW1vbi5ibG9jayhmdW5jdGlvbiAoYmxvY2ssIGhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhibG9jayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJsb2NrID4gYXV0aHNbc2lnbmVyXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsZXIuZXJyb3IucHVzaCh7IGVycm9yOiBcIkF1dGhvcml0eSBvdXQgb2YgdGltZS5cIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsZXIuYXBwID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy9nZXQgdGhlIGxhdGVzdCBkZWNhcmVkIGhpZGUgYW5jaG9yIGxpc3QuXG4gICAgZ2V0TGF0ZXN0RGVjbGFyZWRIaWRkZW46IGZ1bmN0aW9uIChsb2NhdGlvbiwgY2spIHtcbiAgICAgICAgc2VsZi5nZXRBbmNob3IoW2xvY2F0aW9uWzBdLCAwXSwgZnVuY3Rpb24gKHJlc0xhdGVzdCkge1xuICAgICAgICAgICAgLy8xLiBmYWlsZGUgdG8gZ2V0IHRoZSBoaWRlIGFuY2hvci5cbiAgICAgICAgICAgIHZhciBlcnIgPSByZXNMYXRlc3Q7XG4gICAgICAgICAgICAvL2lmKGVyci5lcnJvcikgcmV0dXJuIGNrICYmIGNrKGVycik7XG4gICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhbXSk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc0xhdGVzdDtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IGRhdGEucHJvdG9jb2w7XG4gICAgICAgICAgICBpZiAocHJvdG9jb2wgPT09IG51bGwgfHwgIXByb3RvY29sLmhpZGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKFtdKTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByb3RvY29sLmhpZGUpKVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhwcm90b2NvbC5oaWRlKTtcbiAgICAgICAgICAgIHNlbGYuZ2V0QW5jaG9yKFtwcm90b2NvbC5oaWRlLCAwXSwgZnVuY3Rpb24gKHJlc0hpZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVzTGF0ZXN0O1xuICAgICAgICAgICAgICAgIC8vaWYoZXJyLmVycm9yKSByZXR1cm4gY2sgJiYgY2soZXJyKTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soW10pO1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gcmVzSGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCB8fCAhZGF0YS5yYXcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhbXSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxpc3QgPSBKU09OLnBhcnNlKGRhdGEucmF3KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IGVycm9yIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIGdldCBwYXJhbXMgZnJvbSBzdHJpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICBhcmdzXHQgICAgLy9TdHJpbmcgc3VjaCBhcyBga2V5X2E9dmFsJmtleV9iPXZhbCZrZXlfYz12YWxgXG4gICAgICogKi9cbiAgICBnZXRQYXJhbXM6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFyciA9IGFyZ3Muc3BsaXQoXCImXCIpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvdyA9IGFycltpXTtcbiAgICAgICAgICAgIHZhciBrdiA9IHJvdy5zcGxpdChcIj1cIik7XG4gICAgICAgICAgICBpZiAoa3YubGVuZ3RoICE9PSAyKVxuICAgICAgICAgICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHBhcmFtZXRlclwiIH07XG4gICAgICAgICAgICBtYXBba3ZbMF1dID0ga3ZbMV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIGNoZWNrIHdldGhlciBvYmplY3QgZW1wdHlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gICAgICBvYmpcdCAgICAvL25vcm1hbCBvYmplY3RcbiAgICAgKiAqL1xuICAgIGVtcHR5OiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxufTtcbnZhciBkZWNvZGVyID0ge307XG5kZWNvZGVyW3Byb3RvY29sXzEucmF3VHlwZS5BUFBdID0gc2VsZi5kZWNvZGVBcHA7XG5kZWNvZGVyW3Byb3RvY29sXzEucmF3VHlwZS5EQVRBXSA9IHNlbGYuZGVjb2RlRGF0YTtcbmRlY29kZXJbcHJvdG9jb2xfMS5yYXdUeXBlLkxJQl0gPSBzZWxmLmRlY29kZUxpYjtcbi8vIWltcG9ydGFudCwgYXMgc3VwcG9ydCBgZGVjbGFyZWQgaGlkZGVuYCwgdGhpcyBmdW5jdGlvbiBtYXkgcmVkaXJlY3QgbWFueSB0aW1lcywgYmUgY2FyZWZ1bC5cbi8qKlxuICogRXhwb3NlZCBtZXRob2Qgb2YgRWFzeSBQcm90b2NvbCBpbXBsZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgIGxpbmtlclx0ICAgIC8vQW5jaG9yIGxpbmtlciwgc3VjaCBhcyBgYW5jaG9yOi8vaGVsbG8vYFxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgaW5wdXRBUEkgICAgLy90aGUgQVBJIG5lZWRlZCB0byBhY2Nlc3MgQW5jaG9yIG5ldHdvcmssIGBhbmNob3JKU2AgbWFpbmx5XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSAgICBjayAgICAgICAgICAvL2NhbGxiYWNrLCB3aWxsIHJldHVybiB0aGUgZGVjb2RlZCByZXN1bHRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgIFtmZW5jZV0gICAgIC8vaWYgdHJ1ZSwgdHJlYXQgdGhlIHJ1biByZXN1bHQgYXMgY0FwcC4gVGhlbiBlbmQgb2YgdGhlIGxvb3AuXG4gKiAqL1xudmFyIHJ1biA9IGZ1bmN0aW9uIChsaW5rZXIsIGlucHV0QVBJLCBjaywgaGxpc3QsIGZlbmNlKSB7XG4gICAgaWYgKEFQSSA9PT0gbnVsbCAmJiBpbnB1dEFQSSAhPT0gbnVsbClcbiAgICAgICAgQVBJID0gaW5wdXRBUEk7XG4gICAgdmFyIHRhcmdldCA9ICgwLCBkZWNvZGVyXzEubGlua0RlY29kZXIpKGxpbmtlcik7XG4gICAgaWYgKHRhcmdldC5lcnJvcilcbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKHRhcmdldCk7XG4gICAgLy8wLmdldCB0aGUgbGF0ZXN0IGRlY2xhcmVkIGhpZGRlbiBsaXN0XG4gICAgaWYgKGhsaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuZ2V0TGF0ZXN0RGVjbGFyZWRIaWRkZW4odGFyZ2V0LmxvY2F0aW9uLCBmdW5jdGlvbiAobGFzdEhpZGUpIHtcbiAgICAgICAgICAgIHZhciBjT2JqZWN0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IHByb3RvY29sXzEucmF3VHlwZS5OT05FLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBbdGFyZ2V0LmxvY2F0aW9uWzBdLCB0YXJnZXQubG9jYXRpb25bMV0gIT09IDAgPyB0YXJnZXQubG9jYXRpb25bMV0gOiAwXSxcbiAgICAgICAgICAgICAgICBlcnJvcjogW10sXG4gICAgICAgICAgICAgICAgZGF0YToge30sXG4gICAgICAgICAgICAgICAgaW5kZXg6IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgcmVzID0gbGFzdEhpZGU7XG4gICAgICAgICAgICBpZiAocmVzLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKHJlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhSZXN1bHQgPSBsYXN0SGlkZTtcbiAgICAgICAgICAgIHJldHVybiBydW4obGlua2VyLCBBUEksIGNrLCBoUmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vMS5kZWNvZGUgdGhlIGBBbmNob3IgTGlua2AsIHByZXBhcmUgdGhlIHJlc3VsdCBvYmplY3QuXG4gICAgdmFyIGNPYmplY3QgPSB7XG4gICAgICAgIHR5cGU6IHByb3RvY29sXzEucmF3VHlwZS5OT05FLFxuICAgICAgICBsb2NhdGlvbjogW3RhcmdldC5sb2NhdGlvblswXSwgdGFyZ2V0LmxvY2F0aW9uWzFdICE9PSAwID8gdGFyZ2V0LmxvY2F0aW9uWzFdIDogMF0sXG4gICAgICAgIGVycm9yOiBbXSxcbiAgICAgICAgZGF0YToge30sXG4gICAgICAgIGluZGV4OiBbbnVsbCwgbnVsbF0sXG4gICAgICAgIGhpZGU6IGhsaXN0LFxuICAgIH07XG4gICAgaWYgKHRhcmdldC5wYXJhbSlcbiAgICAgICAgY09iamVjdC5wYXJhbWV0ZXIgPSB0YXJnZXQucGFyYW07XG4gICAgLy8yLlRyeSB0byBnZXQgdGhlIHRhcmdldCBgQW5jaG9yYCBkYXRhLlxuICAgIHNlbGYuZ2V0QW5jaG9yKHRhcmdldC5sb2NhdGlvbiwgZnVuY3Rpb24gKHJlc0FuY2hvcikge1xuICAgICAgICAvLzIuMS5lcnJvciBoYW5kbGUuXG4gICAgICAgIHZhciBlcnIgPSByZXNBbmNob3I7XG4gICAgICAgIGlmIChlcnIuZXJyb3IpIHtcbiAgICAgICAgICAgIGNPYmplY3QuZXJyb3IucHVzaChlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRhID0gcmVzQW5jaG9yO1xuICAgICAgICBpZiAoY09iamVjdC5sb2NhdGlvblsxXSA9PT0gMClcbiAgICAgICAgICAgIGNPYmplY3QubG9jYXRpb25bMV0gPSBkYXRhLmJsb2NrO1xuICAgICAgICBjT2JqZWN0LmRhdGFbXCJcIi5jb25jYXQoY09iamVjdC5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzFdKV0gPSBkYXRhO1xuICAgICAgICAvLzIuMi5XZXRoZXIgSlNPTiBwcm90b2NvbFxuICAgICAgICBpZiAoZGF0YS5wcm90b2NvbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm8gdmFsaWQgcHJvdG9jb2xcIiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAvLzIuMy5XZXRoZXIgRWFzeSBQcm90b2NvbFxuICAgICAgICB2YXIgdHlwZSA9ICFkYXRhLnByb3RvY29sLnR5cGUgPyBcIlwiIDogZGF0YS5wcm90b2NvbC50eXBlO1xuICAgICAgICBpZiAoIWRlY29kZXJbdHlwZV0pIHtcbiAgICAgICAgICAgIGNPYmplY3QuZXJyb3IucHVzaCh7IGVycm9yOiBcIk5vdCBlYXN5IHByb3RvY29sIHR5cGVcIiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAvLzMuIGNoZWNrIHdldGhlciB0aGUgbGF0ZXN0IGFuY2hvci4gSWYgbm90LCBuZWVkIHRvIGdldCBsYXRlc3QgaGlkZSBkYXRhLlxuICAgICAgICBpZiAoZGF0YS5wcm90b2NvbCkge1xuICAgICAgICAgICAgc2VsZi5pc1ZhbGlkQW5jaG9yKGhsaXN0LCBkYXRhLCBmdW5jdGlvbiAodmFsaWRMaW5rLCBlcnJzLCBvdmVybG9hZCkge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAoX2EgPSBjT2JqZWN0LmVycm9yKS5wdXNoLmFwcGx5KF9hLCBlcnJzKTtcbiAgICAgICAgICAgICAgICBpZiAob3ZlcmxvYWQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAodmFsaWRMaW5rICE9PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnVuKHZhbGlkTGluaywgQVBJLCBjaywgaGxpc3QpO1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHQodHlwZSk7XG4gICAgICAgICAgICB9LCBjT2JqZWN0LnBhcmFtZXRlciA9PT0gdW5kZWZpbmVkID8ge30gOiBjT2JqZWN0LnBhcmFtZXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmVzdWx0KHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vaW5saW5lIGZ1bmN0aW9uIHRvIGF2b2lkIHRoZSByZXBldGl0aXZlIGNvZGUuXG4gICAgICAgIGZ1bmN0aW9uIGdldFJlc3VsdCh0eXBlKSB7XG4gICAgICAgICAgICBzZWxmLm1lcmdlKGRhdGEubmFtZSwgZGF0YS5wcm90b2NvbCwge30sIGZ1bmN0aW9uIChtZXJnZVJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuYXV0aCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgY09iamVjdC5hdXRoID0gbWVyZ2VSZXN1bHQuYXV0aDtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaGlkZSAhPSBudWxsICYmIG1lcmdlUmVzdWx0LmhpZGUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuaGlkZSA9IG1lcmdlUmVzdWx0LmhpZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5lcnJvci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgKF9hID0gY09iamVjdC5lcnJvcikucHVzaC5hcHBseShfYSwgbWVyZ2VSZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSF0gIT09IG51bGwgJiYgY09iamVjdC5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkFVVEhdID0gbWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFXSAhPT0gbnVsbCAmJiBjT2JqZWN0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguSElERV0gPSBtZXJnZVJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBtZXJnZVJlc3VsdC5tYXApIHtcbiAgICAgICAgICAgICAgICAgICAgY09iamVjdC5kYXRhW2tdID0gbWVyZ2VSZXN1bHQubWFwW2tdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2Rlclt0eXBlXShjT2JqZWN0LCBmdW5jdGlvbiAocmVzRmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc0ZpcnN0LmNhbGwgJiYgIWZlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXBwX2xpbmsgPSAoMCwgZGVjb2Rlcl8xLmxpbmtDcmVhdG9yKShyZXNGaXJzdC5jYWxsLCByZXNGaXJzdC5wYXJhbWV0ZXIgPT09IHVuZGVmaW5lZCA/IHt9IDogcmVzRmlyc3QucGFyYW1ldGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBydW4oYXBwX2xpbmssIEFQSSwgZnVuY3Rpb24gKHJlc0FwcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmNoZWNrQXV0aG9yaXR5KHJlc0ZpcnN0LCByZXNBcHAsIGNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGhsaXN0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXNGaXJzdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuLy9EZWJ1ZyBwYXJ0IHRvIGdldCBtb3JlIGRldGFpbHMgb2YgcHJvY2Vzcy5cbnZhciBkZWJ1Z19ydW4gPSBmdW5jdGlvbiAobGlua2VyLCBpbnB1dEFQSSwgY2spIHtcbiAgICBkZWJ1Zy5zdGFydCA9IGRlYnVnLnN0YW1wKCk7XG4gICAgcnVuKGxpbmtlciwgaW5wdXRBUEksIGZ1bmN0aW9uIChyZXNSdW4pIHtcbiAgICAgICAgaWYgKCFkZWJ1Zy5kaXNhYmxlKVxuICAgICAgICAgICAgcmVzUnVuLmRlYnVnID0gZGVidWc7IC8vYWRkIGRlYnVnIGluZm9ybWF0aW9uXG4gICAgICAgIGRlYnVnLmVuZCA9IGRlYnVnLnN0YW1wKCk7XG4gICAgICAgIHJldHVybiBjayAmJiBjayhyZXNSdW4pO1xuICAgIH0pO1xufTtcbnZhciBmaW5hbF9ydW4gPSAoZGVidWcuZGlzYWJsZSA/IHJ1biA6IGRlYnVnX3J1bik7XG5leHBvcnRzLmVhc3lSdW4gPSBmaW5hbF9ydW47XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=