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
exports.checkTrust = exports.checkAuth = exports.easyAuth = void 0;
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
var trust_check = function (anchor, protocol, ck) {
    var data = {
        "list": null,
        "anchor": null, //target anchor to get result
    };
    //TODO, auto MD5 anchor function is not tested yet.
    if (protocol.trust) {
        //1.check wether target anchor 
        if (typeof protocol.trust === "string" || Array.isArray(protocol.trust)) {
            data.anchor = protocol.trust;
        }
        else {
            data.list = protocol.trust;
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
exports.checkTrust = trust_check;


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
/*************************debug part****************************/
//debug data to improve the development
var debug = {
    disable: false,
    cache: true,
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
/*************************debug part****************************/
var self = {
    /**************************************************************************/
    /*************************Anchor data functions****************************/
    /**************************************************************************/
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
        if (!debug.disable)
            debug.search.push([anchor.name, anchor.block]); //debug hook 
        if (!debug.cache)
            cache.set(anchor.name, anchor.block, anchor); //debug hook
        if (anchor.empty)
            return ck && ck({ error: "Empty anchor.", level: protocol_1.errorLevel.ERROR });
        if (!anchor.protocol)
            return ck && ck({ error: "No-protocol anchor." });
        var protocol = anchor.protocol;
        if (!protocol.type)
            return ck && ck({ error: "Not EasyProtocol anchor." });
        return ck && ck(anchor);
    },
    /**************************************************************************/
    /************************Decode Result functions***************************/
    /**************************************************************************/
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
    /**************************************************************************/
    /*************************Merge related anchors****************************/
    /**************************************************************************/
    /**
     * combine the hide and auth list to result
     * @param {string}      anchor	    //`Anchor` name
     * @param {object}      protocol    //Easy Protocol
     * @param {object}      cfg         //reversed config parameter
     * @param {function}    ck          //callback, will return the merge result, including the related `anchor`
     * */
    merge: function (anchor, protocol, ck) {
        if (API === null)
            return ck && ck({ error: "No API to get data.", level: protocol_1.errorLevel.ERROR });
        var result = {
            "hide": [],
            "auth": null,
            "trust": null,
            "error": [],
            "index": [null, null, null],
            "map": {},
        };
        //console.log(`Merging function ready to go...`);
        //1.get hide related data and merge to result
        self.singleRule(anchor, protocol, protocol_2.relatedIndex.HIDE, function (res, map, local, errs) {
            var _a;
            //console.log(`singleRule 1 ready`);
            if (local !== null)
                result.index[protocol_2.relatedIndex.HIDE] = local;
            for (var k in map)
                result.map[k] = map[k];
            if (errs.length !== 0)
                (_a = result.error).push.apply(_a, errs);
            result.hide = res;
            //2.get auth related data and merge to result
            self.singleRule(anchor, protocol, protocol_2.relatedIndex.AUTH, function (res, map, local, errs) {
                var _a;
                //console.log(`singleRule 2 ready`);
                if (local !== null)
                    result.index[protocol_2.relatedIndex.AUTH] = local;
                for (var k in map)
                    result.map[k] = map[k];
                if (errs.length !== 0)
                    (_a = result.error).push.apply(_a, errs);
                result.auth = res;
                //3.get trust related data and merge to result
                self.singleRule(anchor, protocol, protocol_2.relatedIndex.TRUST, function (res, map, local, errs) {
                    //console.log(`singleRule 3 ready`);
                    var _a;
                    if (local !== null)
                        result.index[protocol_2.relatedIndex.TRUST] = local;
                    for (var k in map)
                        result.map[k] = map[k];
                    if (errs.length !== 0)
                        (_a = result.error).push.apply(_a, errs);
                    result.trust = res;
                    return ck && ck(result);
                });
            });
        });
    },
    //get whole related data by protocol
    singleRule: function (anchor, protocol, tag, ck) {
        var result = null;
        var map = {};
        var location = null;
        var errs = [];
        //console.log(`singleRule ${anchor}, tag : ${tag}, protocol : ${JSON.stringify(protocol)}`);
        //1.decode protocol to check wether get more data
        switch (tag) {
            case protocol_2.relatedIndex.HIDE:
                (0, hide_1.checkHide)(anchor, protocol, function (resHide) {
                    if (resHide.anchor === null && resHide.list !== null) {
                        result = resHide.list;
                        return ck && ck(result, map, location, errs);
                    }
                    else if (resHide.anchor !== null && resHide.list === null) {
                        self.singleExtend(resHide.anchor, false, function (resSingle, mapSingle, errsSingle) {
                            result = resSingle;
                            for (var k in mapSingle)
                                map[k] = mapSingle[k];
                            errs.push.apply(errs, errsSingle);
                            return ck && ck(result, map, location, errs);
                        });
                    }
                    else if (resHide.anchor !== null && resHide.list !== null) {
                        errs.push({ error: "Format error." });
                        return ck && ck(result, map, location, errs);
                    }
                    else {
                        return ck && ck(result, map, location, errs);
                    }
                });
                break;
            case protocol_2.relatedIndex.AUTH:
                //console.log(`Auth athority check...`);
                (0, auth_1.checkAuth)(anchor, protocol, function (resAuth) {
                    if (resAuth.anchor === null && resAuth.list !== null) {
                        result = resAuth.list;
                        return ck && ck(result, map, location, errs);
                    }
                    else if (resAuth.anchor !== null && resAuth.list === null) {
                        //console.log(`This way...`);
                        self.singleExtend(resAuth.anchor, true, function (resSingle, mapSingle, errsSingle) {
                            result = resSingle;
                            for (var k in mapSingle)
                                map[k] = mapSingle[k];
                            errs.push.apply(errs, errsSingle);
                            return ck && ck(result, map, location, errs);
                        });
                    }
                    else if (resAuth.anchor !== null && resAuth.list !== null) {
                        errs.push({ error: "Format error." });
                        return ck && ck(result, map, location, errs);
                    }
                    else {
                        return ck && ck(result, map, location, errs);
                    }
                });
                break;
            case protocol_2.relatedIndex.TRUST:
                (0, auth_1.checkTrust)(anchor, protocol, function (resTrust) {
                    if (resTrust.anchor === null && resTrust.list !== null) {
                        result = resTrust.list;
                        return ck && ck(result, map, location, errs);
                    }
                    else if (resTrust.anchor !== null && resTrust.list === null) {
                        self.singleExtend(resTrust.anchor, true, function (resSingle, mapSingle, errsSingle) {
                            result = resSingle;
                            for (var k in mapSingle)
                                map[k] = mapSingle[k];
                            errs.push.apply(errs, errsSingle);
                            return ck && ck(result, map, location, errs);
                        });
                    }
                    else if (resTrust.anchor !== null && resTrust.list !== null) {
                        errs.push({ error: "Format error." });
                        return ck && ck(result, map, location, errs);
                    }
                    else {
                        return ck && ck(result, map, location, errs);
                    }
                });
                break;
            default:
                errs.push({ error: "unknow related index." });
                ck && ck(result, map, location, errs);
                break;
        }
    },
    //get anchor extend data, two parts: 1.extend anchor itself; 2.declared hidden anchor
    singleExtend: function (name, history, ck) {
        //console.log(`${name}:${history}`);
        var result = null;
        var map = {};
        var errs = [];
        var last = Array.isArray(name) ? [name[0], 0] : [name, 0];
        if (history) {
            //1.get the latest declared hidden list.
            self.getLatestDeclaredHidden(last, function (resHidden, resAnchor) {
                var err = resHidden;
                if (err !== undefined && err.error)
                    errs.push(err);
                if (resAnchor !== undefined) {
                    map["".concat(resAnchor.name, "_").concat(resAnchor.block)] = resAnchor;
                }
                //console.log(resHidden);
                //console.log(resAnchor);
                //1.1.set hidden history map
                var lastHidden = resHidden;
                var hmap = {};
                if (Array.isArray(lastHidden))
                    for (var i = 0; i < lastHidden.length; i++)
                        hmap[lastHidden[i]] = true;
                self.getHistory([Array.isArray(name) ? name[0] : name, 0], function (listHistory, errsHistory) {
                    if (errsHistory !== undefined)
                        errs.push.apply(errs, errsHistory);
                    //console.log(listHistory);
                    for (var i = 0; i < listHistory.length; i++) {
                        var data = listHistory[i];
                        map["".concat(data.name, "_").concat(data.block)] = data;
                        if (hmap[data.block])
                            continue;
                        if (!data.protocol || !data.raw || data.protocol.type !== protocol_1.rawType.DATA) {
                            errs.push({ error: "Not valid anchor. ".concat(data.name, ":").concat(data.block) });
                            continue;
                        }
                        try {
                            var target = JSON.parse(data.raw);
                            if (result === null)
                                result = {};
                            for (var k in target) {
                                result[k] = target[k];
                            }
                        }
                        catch (error) {
                            errs.push({ error: "JSON format failed. ".concat(data.name, ":").concat(data.block) });
                            continue;
                        }
                    }
                    return ck && ck(result, map, errs);
                });
            });
        }
        else {
            self.getAnchor(Array.isArray(name) ? name : [name, 0], function (resSingle) {
                var err = resSingle;
                if (err !== undefined && err.error) {
                    errs.push(err);
                    return ck && ck(result, map, errs);
                }
                var data = resSingle;
                map["".concat(data.name, "_").concat(data.block)] = data;
                if (!data.protocol || !data.raw || data.protocol.type !== protocol_1.rawType.DATA) {
                    errs.push({ error: "Not valid anchor." });
                    return ck && ck(result, map, errs);
                }
                try {
                    result = JSON.parse(data.raw);
                    return ck && ck(result, map, errs);
                }
                catch (error) {
                    errs.push({ error: JSON.stringify(error) });
                    return ck && ck(result, map, errs);
                }
            });
        }
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
                            //console.log(block);
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
                    return ck && ck([], data);
                try {
                    var list = JSON.parse(data.raw);
                    return ck && ck(list, data);
                }
                catch (error) {
                    return ck && ck({ error: error });
                }
            });
        });
    },
    /**************************************************************************/
    /*************************Declared anchor check****************************/
    /**************************************************************************/
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
    /**************************************************************************/
    /****************************Basic functions*******************************/
    /**************************************************************************/
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
    //console.log(`Hidden list checking...`);
    //console.log(hlist);
    //0.get the latest declared hidden list
    if (hlist === undefined) {
        //console.log(`Checking the hide list`);
        return self.getLatestDeclaredHidden(target.location, function (lastHide, lastAnchor) {
            var cObject = {
                type: protocol_1.rawType.NONE,
                location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
                error: [],
                data: {},
                index: [null, null, null],
            };
            //console.log(lastHide);
            //console.log(lastAnchor);
            var res = lastHide;
            //console.log(res);
            if (res !== undefined && res.error) {
                cObject.error.push(res);
                return run(linker, API, ck, []);
            }
            var hResult = lastHide;
            //console.log(`Hidden list...`);
            //console.log(hResult);
            return run(linker, API, ck, hResult);
        });
    }
    //1.decode the `Anchor Link`, prepare the result object.
    var cObject = {
        type: protocol_1.rawType.NONE,
        location: [target.location[0], target.location[1] !== 0 ? target.location[1] : 0],
        error: [],
        data: {},
        index: [null, null, null],
        hide: hlist,
        //trust:{},
    };
    if (target.param)
        cObject.parameter = target.param;
    //console.log(`Continue...`);
    //console.log(target);
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
            //console.log(`Getting result...`);
            self.merge(data.name, data.protocol, function (mergeResult) {
                var _a;
                //console.log(`Merging...`);
                if (mergeResult.auth !== null)
                    cObject.auth = mergeResult.auth;
                if (mergeResult.trust !== null)
                    cObject.trust = mergeResult.trust;
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
                if (mergeResult.index[protocol_2.relatedIndex.TRUST] !== null && cObject.index) {
                    cObject.index[protocol_2.relatedIndex.TRUST] = mergeResult.index[protocol_2.relatedIndex.TRUST];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyw0QkFBNEI7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxpQ0FBaUM7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSx1Q0FBdUM7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1SEFBdUg7QUFDdkg7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxlQUFlIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vbGliL2xvYWRlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY2hhcmVuYy9jaGFyZW5jLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jcnlwdC9jcnlwdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9tZDUvbWQ1LmpzIiwid2VicGFjazovLy8uL3NyYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3NyYy9kZWNvZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9oaWRlLmpzIiwid2VicGFjazovLy8uL3NyYy9wcm90b2NvbC5qcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVycHJldGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImxldCBzZWFyY2g9bnVsbDtcbmxldCB0YXJnZXQ9bnVsbDtcbmNvbnN0IHNlbGY9e1xuICAgIGdldExpYnM6KGxpc3QsY2ssY2FjaGUsb3JkZXIpPT57XG4gICAgICAgIC8vY29uc29sZS5sb2coYFN0YXJ0OiR7SlNPTi5zdHJpbmdpZnkobGlzdCl9YCk7XG4gICAgICAgIGlmKCFjYWNoZSkgY2FjaGU9e307XG4gICAgICAgIGlmKCFvcmRlcikgb3JkZXI9W107XG4gICAgICAgIGNvbnN0IHJvdz1saXN0LnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IGFuY2hvcj0oQXJyYXkuaXNBcnJheShyb3cpP3Jvd1swXTpyb3cpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGNvbnN0IGJsb2NrPUFycmF5LmlzQXJyYXkocm93KT9yb3dbMV06MDtcblxuICAgICAgICAvLzEuY2hlY2sgbGliIGxvYWRpbmcgc3RhdHVzXG4gICAgICAgIGlmKGNhY2hlW2FuY2hvcl0pIHJldHVybiBzZWxmLmdldExpYnMobGlzdCxjayxjYWNoZSxvcmRlcik7XG5cbiAgICAgICAgLy8yLmdldCB0YXJnZXQgYW5jaG9yXG4gICAgICAgIHNlbGYuZ2V0QW5jaG9yKGFuY2hvcixibG9jaywoYW4scmVzKT0+e1xuICAgICAgICAgICAgY2FjaGVbYW5dPSFyZXM/e2Vycm9yOidubyBzdWNoIGFuY2hvcid9OnJlcztcbiAgICAgICAgICAgIGlmKCFyZXMucHJvdG9jb2wgfHwgKCFyZXMucHJvdG9jb2wuZXh0ICYmICFyZXMucHJvdG9jb2wubGliKSl7XG4gICAgICAgICAgICAgICAgb3JkZXIucHVzaChhbik7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBjb25zdCBxdT17XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5OmFuLFxuICAgICAgICAgICAgICAgICAgICBsaWI6cmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5saWI/cmVzLnByb3RvY29sLmxpYjpbXSxcbiAgICAgICAgICAgICAgICAgICAgZXh0OnJlcy5wcm90b2NvbCAmJiByZXMucHJvdG9jb2wuZXh0P3Jlcy5wcm90b2NvbC5leHQ6W10sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBvcmRlci5wdXNoKHF1KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocmVzLnByb3RvY29sICYmIHJlcy5wcm90b2NvbC5leHQpe1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT1yZXMucHJvdG9jb2wuZXh0Lmxlbmd0aDtpPjA7aS0tKSBsaXN0LnVuc2hpZnQocmVzLnByb3RvY29sLmV4dFtpLTFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHJlcy5wcm90b2NvbCAmJiByZXMucHJvdG9jb2wubGliKXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk9cmVzLnByb3RvY29sLmxpYi5sZW5ndGg7aT4wO2ktLSkgbGlzdC51bnNoaWZ0KHJlcy5wcm90b2NvbC5saWJbaS0xXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKGxpc3QubGVuZ3RoPT09MCkgcmV0dXJuIGNrICYmIGNrKGNhY2hlLG9yZGVyKTtcbiAgICAgICAgICAgIHNlbGYuZ2V0TGlicyhsaXN0LGNrLGNhY2hlLG9yZGVyKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRBbmNob3I6KGFuY2hvcixibG9jayxjayk9PntcbiAgICAgICAgaWYoIWFuY2hvcikgcmV0dXJuIGNrICYmIGNrKGFuY2hvciwnJyk7XG4gICAgICAgIGNvbnN0IGZ1bj1ibG9jaz09PTA/c2VhcmNoOnRhcmdldDtcbiAgICAgICAgZnVuKGFuY2hvciwgKHJlcyk9PntcbiAgICAgICAgICAgIGlmKCFyZXMgfHwgKCFyZXMub3duZXIpKSByZXR1cm4gY2sgJiYgY2soYW5jaG9yLCcnKTtcbiAgICAgICAgICAgIGlmKCFyZXMuZW1wdHkpe1xuICAgICAgICAgICAgICAgICBjb25zdCBkdD17XG4gICAgICAgICAgICAgICAgICAgIGtleTpyZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcmF3OnJlcy5yYXcsXG4gICAgICAgICAgICAgICAgICAgIHByb3RvY29sOnJlcy5wcm90b2NvbCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhhbmNob3IsZHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGRlY29kZUxpYjooZHQpPT57XG4gICAgICAgIGNvbnN0IHJlc3VsdD17dHlwZTonZXJyb3InLGRhdGE6Jyd9O1xuICAgICAgICBpZihkdC5lcnJvcil7XG4gICAgICAgICAgICByZXN1bHQuZXJyb3I9ZHQuZXJyb3I7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoIWR0LnByb3RvY29sKXtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcj0nVW5leGNlcHQgZGF0YSBmb3JtYXQnO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3RvPWR0LnByb3RvY29sO1xuICAgICAgICBpZighcHJvdG8uZm10KXtcbiAgICAgICAgICAgIHJlc3VsdC5lcnJvcj0nQW5jaG9yIGZvcm1hdCBsb3N0JztcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnR5cGU9cHJvdG8uZm10O1xuXG4gICAgICAgIC8vc29sdmUgcmF3IHByb2JsZW07IGhleCB0byBhc2NpaVxuICAgICAgICBpZihkdC5yYXcuc3Vic3RyKDAsIDIpLnRvTG93ZXJDYXNlKCk9PT0nMHgnKXtcbiAgICAgICAgICAgIHJlc3VsdC5kYXRhPWRlY29kZVVSSUNvbXBvbmVudChkdC5yYXcuc2xpY2UoMikucmVwbGFjZSgvXFxzKy9nLCAnJykucmVwbGFjZSgvWzAtOWEtZl17Mn0vZywgJyUkJicpKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXN1bHQuZGF0YT1kdC5yYXc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuICAgIFxuICAgIGdldENvbXBsZXhPcmRlcjoobmFtZSxtYXAscXVldWUsaG9sZCk9PntcbiAgICAgICAgaWYoIXF1ZXVlKSBxdWV1ZT1bXTsgICAgICAgIC8v6I635Y+W55qEXG4gICAgICAgIGlmKCFob2xkKSBob2xkPVtdOyAgICAgICAgICAvLzEu55So5p2l6KGo6L6+5aSE55CG54q25oCBXG5cbiAgICAgICAgaWYobWFwW25hbWVdPT09dHJ1ZSAmJiBob2xkLmxlbmd0aD09PTApIHJldHVybiBxdWV1ZTtcbiAgICAgICAgY29uc3Qgcm93PW1hcFtuYW1lXTtcblxuICAgICAgICBjb25zdCBsYXN0PWhvbGQubGVuZ3RoIT09MD9ob2xkW2hvbGQubGVuZ3RoLTFdOm51bGw7XG4gICAgICAgIGNvbnN0IHJlY292ZXI9KGxhc3QhPT1udWxsJiZsYXN0Lm5hbWU9PT1uYW1lKT9ob2xkLnBvcCgpOm51bGw7XG5cbiAgICAgICAgLy8xLmNoZWNrIGxpYiBjb21wbGV4O1xuICAgICAgICBpZihyb3cubGliICYmIHJvdy5saWIubGVuZ3RoPjApe1xuICAgICAgICAgICAgaWYocmVjb3Zlcj09PW51bGwpe1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cm93LmxpYi5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGliPXJvdy5saWJbaV07XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3JlYWR5IHRvIGNoZWNrIGxpYjonK2xpYik7XG4gICAgICAgICAgICAgICAgICAgIGlmKG1hcFtsaWJdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGxpYik7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtsaWI6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLmdldENvbXBsZXhPcmRlcihsaWIsbWFwLHF1ZXVlLGhvbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaWYocmVjb3Zlci5saWIhPT11bmRlZmluZWQgJiYgcmVjb3Zlci5saWIhPT1yb3cubGliLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT1yZWNvdmVyLmxpYisxO2k8cm93LmxpYi5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpYj1yb3cubGliW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygncmVhZHkgdG8gY2hlY2sgbGliOicrbGliKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1hcFtsaWJdPT09dHJ1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9sZC5wdXNoKHtsaWI6aSxuYW1lOm5hbWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIobGliLG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHJlY292ZXI9PT1udWxsKSBxdWV1ZS5wdXNoKG5hbWUpO1xuXG4gICAgICAgIC8vMi5jaGVjayBleHRlbmQgY29tcGxleDtcbiAgICAgICAgaWYocm93LmV4dCAmJiByb3cuZXh0Lmxlbmd0aD4wKXtcbiAgICAgICAgICAgIGlmKHJlY292ZXIhPT1udWxsKXtcbiAgICAgICAgICAgICAgICBpZihyZWNvdmVyLmV4dCE9PXVuZGVmaW5lZCAmJiByZWNvdmVyLmV4dCE9PXJvdy5leHQubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPXJlY292ZXIuZXh0KzE7aTxyb3cuZXh0Lmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXh0PXJvdy5leHRbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihtYXBbZXh0XT09PXRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbGQucHVzaCh7ZXh0OmksbmFtZTpuYW1lfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0Q29tcGxleE9yZGVyKGV4dCxtYXAscXVldWUsaG9sZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk9MDtpPHJvdy5leHQubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dD1yb3cuZXh0W2ldO1xuICAgICAgICAgICAgICAgICAgICBpZihtYXBbZXh0XT09PXRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChleHQpO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvbGQucHVzaCh7ZXh0OmksbmFtZTpuYW1lfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIoZXh0LG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGhvbGQubGVuZ3RoIT09MCl7XG4gICAgICAgICAgICBjb25zdCBsYXN0PWhvbGRbaG9sZC5sZW5ndGgtMV07XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5nZXRDb21wbGV4T3JkZXIobGFzdC5uYW1lLG1hcCxxdWV1ZSxob2xkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBxdWV1ZTtcbiAgICB9LFxuICAgIG1lcmdlT3JkZXI6KG9yZGVyKT0+e1xuICAgICAgICBjb25zdCBjb21wbGV4PXt9O1xuICAgICAgICBjb25zdCBtYXA9e307XG4gICAgICAgIGNvbnN0IGRvbmU9e307XG4gICAgICAgIGNvbnN0IHF1ZXVlPVtdO1xuICAgICAgICBmb3IobGV0IGk9MDtpPG9yZGVyLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgY29uc3Qgcm93PW9yZGVyW2ldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByb3cgIT09ICdzdHJpbmcnICYmIHJvdy5lbnRyeSE9PXVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgY29tcGxleFtyb3cuZW50cnldPXRydWU7XG4gICAgICAgICAgICAgICAgbWFwW3Jvdy5lbnRyeV09cm93O1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgbWFwW3Jvd109dHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvcihsZXQgaT0wO2k8b3JkZXIubGVuZ3RoO2krKyl7XG4gICAgICAgICAgICBjb25zdCByb3c9b3JkZXJbaV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJvdyA9PT0gJ3N0cmluZycgfHwgcm93IGluc3RhbmNlb2YgU3RyaW5nKXtcbiAgICAgICAgICAgICAgICBpZihkb25lW3Jvd10pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gocm93KTtcbiAgICAgICAgICAgICAgICBkb25lW3Jvd109dHJ1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIC8vMi5jb21wbGV4IGxpYlxuICAgICAgICAgICAgICAgIC8vMi4xLmFkZCByZXF1aXJlZCBsaWJzXG4gICAgICAgICAgICAgICAgaWYocm93LmxpYiAmJiByb3cubGliLmxlbmd0aD4wKXtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpPTA7aTxyb3cubGliLmxlbmd0aDtpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGliPXJvdy5saWJbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkb25lW2xpYl0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY29tcGxleFtsaWJdKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjcXVldWU9c2VsZi5nZXRDb21wbGV4T3JkZXIobGliLG1hcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7bGlifToke0pTT04uc3RyaW5naWZ5KGNxdWV1ZSl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGo9MDtqPGNxdWV1ZS5sZW5ndGg7aisrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpYj1jcXVldWVbal07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGRvbmVbY2xpYl0pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGNsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lW2NsaWJdPXRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChsaWIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVbbGliXT10cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vMi4yLmFkZCBsaWIgYm9keVxuICAgICAgICAgICAgICAgIGlmKCFkb25lW3Jvdy5lbnRyeV0pe1xuICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKHJvdy5lbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGRvbmVbcm93LmVudHJ5XT10cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vMi4zLmFkZCByZXF1aXJlZCBleHRlbmQgcGx1Z2luc1xuICAgICAgICAgICAgICAgIGlmKHJvdy5leHQgJiYgcm93LmV4dC5sZW5ndGg+MCl7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wO2k8cm93LmV4dC5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4dD1yb3cuZXh0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZVtleHRdKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGNvbXBsZXhbZXh0XSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3F1ZXVlPXNlbGYuZ2V0Q29tcGxleE9yZGVyKGV4dCxtYXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaj0wO2o8Y3F1ZXVlLmxlbmd0aDtqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjZXh0PWNxdWV1ZVtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoZG9uZVtjZXh0XSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY2V4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmVbY2V4dF09dHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZS5wdXNoKGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZVtleHRdPXRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcXVldWU7XG4gICAgfSxcbiAgICByZWdyb3VwQ29kZToobWFwLG9yZGVyKT0+e1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1hcCk7XG4gICAgICAgIGNvbnN0IGRlY29kZT1zZWxmLmRlY29kZUxpYjtcbiAgICAgICAgbGV0IGpzPScnO1xuICAgICAgICBsZXQgY3NzPScnO1xuICAgICAgICBsZXQgZG9uZT17fTtcbiAgICAgICAgbGV0IGZhaWxlZD17fTtcbiAgICAgICAgbGV0IGVycm9yPWZhbHNlOyAgICAvL+agh+W/l+S9jei+k+WHulxuXG4gICAgICAgIGNvbnN0IG9kcz1zZWxmLm1lcmdlT3JkZXIob3JkZXIpO1xuICAgICAgICBmb3IobGV0IGk9MDtpPG9kcy5sZW5ndGg7aSsrKXtcbiAgICAgICAgICAgIGNvbnN0IHJvdz1vZHNbaV07XG4gICAgICAgICAgICBpZihkb25lW3Jvd10pIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgZHQ9bWFwW3Jvd107XG4gICAgICAgICAgICBjb25zdCByZXM9ZGVjb2RlKGR0KTtcbiAgICAgICAgICAgIGRvbmVbcm93XT10cnVlO1xuICAgICAgICAgICAgaWYocmVzLmVycm9yKXtcbiAgICAgICAgICAgICAgICBmYWlsZWRbcm93XT1yZXMuZXJyb3I7XG4gICAgICAgICAgICAgICAgZXJyb3I9dHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpzKz1yZXMudHlwZT09PVwianNcIj9yZXMuZGF0YTonJztcbiAgICAgICAgICAgIGNzcys9cmVzLnR5cGU9PT1cImNzc1wiP3Jlcy5kYXRhOicnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7anM6anMsY3NzOmNzcyxmYWlsZWQ6ZmFpbGVkLG9yZGVyOm9kcyxlcnJvcjplcnJvcn07XG4gICAgfSxcbn1cblxuZXhwb3J0cy5Mb2FkZXIgPShsaXN0LEFQSSxjayk9PntcbiAgICBzZWFyY2g9QVBJLnNlYXJjaDtcbiAgICB0YXJnZXQ9QVBJLnRhcmdldDtcbiAgICBzZWxmLmdldExpYnMobGlzdCxjayk7XG59O1xuXG5leHBvcnRzLkxpYnM9KGxpc3QsQVBJLGNrKT0+e1xuICAgIHNlYXJjaD1BUEkuc2VhcmNoO1xuICAgIHRhcmdldD1BUEkudGFyZ2V0O1xuICAgIHNlbGYuZ2V0TGlicyhsaXN0LChkdCxvcmRlcik9PnsgICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvZGU9c2VsZi5yZWdyb3VwQ29kZShkdCxvcmRlcik7XG4gICAgICAgIHJldHVybiBjayAmJiBjayhjb2RlKTtcbiAgICB9KTtcbn07IiwidmFyIGNoYXJlbmMgPSB7XG4gIC8vIFVURi04IGVuY29kaW5nXG4gIHV0Zjg6IHtcbiAgICAvLyBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheVxuICAgIHN0cmluZ1RvQnl0ZXM6IGZ1bmN0aW9uKHN0cikge1xuICAgICAgcmV0dXJuIGNoYXJlbmMuYmluLnN0cmluZ1RvQnl0ZXModW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBzdHJpbmdcbiAgICBieXRlc1RvU3RyaW5nOiBmdW5jdGlvbihieXRlcykge1xuICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlc2NhcGUoY2hhcmVuYy5iaW4uYnl0ZXNUb1N0cmluZyhieXRlcykpKTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQmluYXJ5IGVuY29kaW5nXG4gIGJpbjoge1xuICAgIC8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgc3RyaW5nVG9CeXRlczogZnVuY3Rpb24oc3RyKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKylcbiAgICAgICAgYnl0ZXMucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIHN0cmluZ1xuICAgIGJ5dGVzVG9TdHJpbmc6IGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBmb3IgKHZhciBzdHIgPSBbXSwgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgc3RyLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSkpO1xuICAgICAgcmV0dXJuIHN0ci5qb2luKCcnKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2hhcmVuYztcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIGJhc2U2NG1hcFxuICAgICAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLycsXG5cbiAgY3J5cHQgPSB7XG4gICAgLy8gQml0LXdpc2Ugcm90YXRpb24gbGVmdFxuICAgIHJvdGw6IGZ1bmN0aW9uKG4sIGIpIHtcbiAgICAgIHJldHVybiAobiA8PCBiKSB8IChuID4+PiAoMzIgLSBiKSk7XG4gICAgfSxcblxuICAgIC8vIEJpdC13aXNlIHJvdGF0aW9uIHJpZ2h0XG4gICAgcm90cjogZnVuY3Rpb24obiwgYikge1xuICAgICAgcmV0dXJuIChuIDw8ICgzMiAtIGIpKSB8IChuID4+PiBiKTtcbiAgICB9LFxuXG4gICAgLy8gU3dhcCBiaWctZW5kaWFuIHRvIGxpdHRsZS1lbmRpYW4gYW5kIHZpY2UgdmVyc2FcbiAgICBlbmRpYW46IGZ1bmN0aW9uKG4pIHtcbiAgICAgIC8vIElmIG51bWJlciBnaXZlbiwgc3dhcCBlbmRpYW5cbiAgICAgIGlmIChuLmNvbnN0cnVjdG9yID09IE51bWJlcikge1xuICAgICAgICByZXR1cm4gY3J5cHQucm90bChuLCA4KSAmIDB4MDBGRjAwRkYgfCBjcnlwdC5yb3RsKG4sIDI0KSAmIDB4RkYwMEZGMDA7XG4gICAgICB9XG5cbiAgICAgIC8vIEVsc2UsIGFzc3VtZSBhcnJheSBhbmQgc3dhcCBhbGwgaXRlbXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbi5sZW5ndGg7IGkrKylcbiAgICAgICAgbltpXSA9IGNyeXB0LmVuZGlhbihuW2ldKTtcbiAgICAgIHJldHVybiBuO1xuICAgIH0sXG5cbiAgICAvLyBHZW5lcmF0ZSBhbiBhcnJheSBvZiBhbnkgbGVuZ3RoIG9mIHJhbmRvbSBieXRlc1xuICAgIHJhbmRvbUJ5dGVzOiBmdW5jdGlvbihuKSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdOyBuID4gMDsgbi0tKVxuICAgICAgICBieXRlcy5wdXNoKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1NikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBiaWctZW5kaWFuIDMyLWJpdCB3b3Jkc1xuICAgIGJ5dGVzVG9Xb3JkczogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIHdvcmRzID0gW10sIGkgPSAwLCBiID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrLCBiICs9IDgpXG4gICAgICAgIHdvcmRzW2IgPj4+IDVdIHw9IGJ5dGVzW2ldIDw8ICgyNCAtIGIgJSAzMik7XG4gICAgICByZXR1cm4gd29yZHM7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYmlnLWVuZGlhbiAzMi1iaXQgd29yZHMgdG8gYSBieXRlIGFycmF5XG4gICAgd29yZHNUb0J5dGVzOiBmdW5jdGlvbih3b3Jkcykge1xuICAgICAgZm9yICh2YXIgYnl0ZXMgPSBbXSwgYiA9IDA7IGIgPCB3b3Jkcy5sZW5ndGggKiAzMjsgYiArPSA4KVxuICAgICAgICBieXRlcy5wdXNoKCh3b3Jkc1tiID4+PiA1XSA+Pj4gKDI0IC0gYiAlIDMyKSkgJiAweEZGKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGJ5dGUgYXJyYXkgdG8gYSBoZXggc3RyaW5nXG4gICAgYnl0ZXNUb0hleDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGhleCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGhleC5wdXNoKChieXRlc1tpXSA+Pj4gNCkudG9TdHJpbmcoMTYpKTtcbiAgICAgICAgaGV4LnB1c2goKGJ5dGVzW2ldICYgMHhGKS50b1N0cmluZygxNikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhleC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIGhleCBzdHJpbmcgdG8gYSBieXRlIGFycmF5XG4gICAgaGV4VG9CeXRlczogZnVuY3Rpb24oaGV4KSB7XG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBjID0gMDsgYyA8IGhleC5sZW5ndGg7IGMgKz0gMilcbiAgICAgICAgYnl0ZXMucHVzaChwYXJzZUludChoZXguc3Vic3RyKGMsIDIpLCAxNikpO1xuICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IGEgYnl0ZSBhcnJheSB0byBhIGJhc2UtNjQgc3RyaW5nXG4gICAgYnl0ZXNUb0Jhc2U2NDogZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGZvciAodmFyIGJhc2U2NCA9IFtdLCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIHZhciB0cmlwbGV0ID0gKGJ5dGVzW2ldIDw8IDE2KSB8IChieXRlc1tpICsgMV0gPDwgOCkgfCBieXRlc1tpICsgMl07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgNDsgaisrKVxuICAgICAgICAgIGlmIChpICogOCArIGogKiA2IDw9IGJ5dGVzLmxlbmd0aCAqIDgpXG4gICAgICAgICAgICBiYXNlNjQucHVzaChiYXNlNjRtYXAuY2hhckF0KCh0cmlwbGV0ID4+PiA2ICogKDMgLSBqKSkgJiAweDNGKSk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgYmFzZTY0LnB1c2goJz0nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBiYXNlNjQuam9pbignJyk7XG4gICAgfSxcblxuICAgIC8vIENvbnZlcnQgYSBiYXNlLTY0IHN0cmluZyB0byBhIGJ5dGUgYXJyYXlcbiAgICBiYXNlNjRUb0J5dGVzOiBmdW5jdGlvbihiYXNlNjQpIHtcbiAgICAgIC8vIFJlbW92ZSBub24tYmFzZS02NCBjaGFyYWN0ZXJzXG4gICAgICBiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvW15BLVowLTkrXFwvXS9pZywgJycpO1xuXG4gICAgICBmb3IgKHZhciBieXRlcyA9IFtdLCBpID0gMCwgaW1vZDQgPSAwOyBpIDwgYmFzZTY0Lmxlbmd0aDtcbiAgICAgICAgICBpbW9kNCA9ICsraSAlIDQpIHtcbiAgICAgICAgaWYgKGltb2Q0ID09IDApIGNvbnRpbnVlO1xuICAgICAgICBieXRlcy5wdXNoKCgoYmFzZTY0bWFwLmluZGV4T2YoYmFzZTY0LmNoYXJBdChpIC0gMSkpXG4gICAgICAgICAgICAmIChNYXRoLnBvdygyLCAtMiAqIGltb2Q0ICsgOCkgLSAxKSkgPDwgKGltb2Q0ICogMikpXG4gICAgICAgICAgICB8IChiYXNlNjRtYXAuaW5kZXhPZihiYXNlNjQuY2hhckF0KGkpKSA+Pj4gKDYgLSBpbW9kNCAqIDIpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gY3J5cHQ7XG59KSgpO1xuIiwiLyohXG4gKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGh0dHBzOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG4vLyBUaGUgX2lzQnVmZmVyIGNoZWNrIGlzIGZvciBTYWZhcmkgNS03IHN1cHBvcnQsIGJlY2F1c2UgaXQncyBtaXNzaW5nXG4vLyBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yLiBSZW1vdmUgdGhpcyBldmVudHVhbGx5XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPSBudWxsICYmIChpc0J1ZmZlcihvYmopIHx8IGlzU2xvd0J1ZmZlcihvYmopIHx8ICEhb2JqLl9pc0J1ZmZlcilcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIgKG9iaikge1xuICByZXR1cm4gISFvYmouY29uc3RydWN0b3IgJiYgdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiBvYmouY29uc3RydWN0b3IuaXNCdWZmZXIob2JqKVxufVxuXG4vLyBGb3IgTm9kZSB2MC4xMCBzdXBwb3J0LiBSZW1vdmUgdGhpcyBldmVudHVhbGx5LlxuZnVuY3Rpb24gaXNTbG93QnVmZmVyIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmoucmVhZEZsb2F0TEUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIG9iai5zbGljZSA9PT0gJ2Z1bmN0aW9uJyAmJiBpc0J1ZmZlcihvYmouc2xpY2UoMCwgMCkpXG59XG4iLCIoZnVuY3Rpb24oKXtcclxuICB2YXIgY3J5cHQgPSByZXF1aXJlKCdjcnlwdCcpLFxyXG4gICAgICB1dGY4ID0gcmVxdWlyZSgnY2hhcmVuYycpLnV0ZjgsXHJcbiAgICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnaXMtYnVmZmVyJyksXHJcbiAgICAgIGJpbiA9IHJlcXVpcmUoJ2NoYXJlbmMnKS5iaW4sXHJcblxyXG4gIC8vIFRoZSBjb3JlXHJcbiAgbWQ1ID0gZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcclxuICAgIC8vIENvbnZlcnQgdG8gYnl0ZSBhcnJheVxyXG4gICAgaWYgKG1lc3NhZ2UuY29uc3RydWN0b3IgPT0gU3RyaW5nKVxyXG4gICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmVuY29kaW5nID09PSAnYmluYXJ5JylcclxuICAgICAgICBtZXNzYWdlID0gYmluLnN0cmluZ1RvQnl0ZXMobWVzc2FnZSk7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBtZXNzYWdlID0gdXRmOC5zdHJpbmdUb0J5dGVzKG1lc3NhZ2UpO1xyXG4gICAgZWxzZSBpZiAoaXNCdWZmZXIobWVzc2FnZSkpXHJcbiAgICAgIG1lc3NhZ2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChtZXNzYWdlLCAwKTtcclxuICAgIGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpICYmIG1lc3NhZ2UuY29uc3RydWN0b3IgIT09IFVpbnQ4QXJyYXkpXHJcbiAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlLnRvU3RyaW5nKCk7XHJcbiAgICAvLyBlbHNlLCBhc3N1bWUgYnl0ZSBhcnJheSBhbHJlYWR5XHJcblxyXG4gICAgdmFyIG0gPSBjcnlwdC5ieXRlc1RvV29yZHMobWVzc2FnZSksXHJcbiAgICAgICAgbCA9IG1lc3NhZ2UubGVuZ3RoICogOCxcclxuICAgICAgICBhID0gIDE3MzI1ODQxOTMsXHJcbiAgICAgICAgYiA9IC0yNzE3MzM4NzksXHJcbiAgICAgICAgYyA9IC0xNzMyNTg0MTk0LFxyXG4gICAgICAgIGQgPSAgMjcxNzMzODc4O1xyXG5cclxuICAgIC8vIFN3YXAgZW5kaWFuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbVtpXSA9ICgobVtpXSA8PCAgOCkgfCAobVtpXSA+Pj4gMjQpKSAmIDB4MDBGRjAwRkYgfFxyXG4gICAgICAgICAgICAgKChtW2ldIDw8IDI0KSB8IChtW2ldID4+PiAgOCkpICYgMHhGRjAwRkYwMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYWRkaW5nXHJcbiAgICBtW2wgPj4+IDVdIHw9IDB4ODAgPDwgKGwgJSAzMik7XHJcbiAgICBtWygoKGwgKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gbDtcclxuXHJcbiAgICAvLyBNZXRob2Qgc2hvcnRjdXRzXHJcbiAgICB2YXIgRkYgPSBtZDUuX2ZmLFxyXG4gICAgICAgIEdHID0gbWQ1Ll9nZyxcclxuICAgICAgICBISCA9IG1kNS5faGgsXHJcbiAgICAgICAgSUkgPSBtZDUuX2lpO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkgKz0gMTYpIHtcclxuXHJcbiAgICAgIHZhciBhYSA9IGEsXHJcbiAgICAgICAgICBiYiA9IGIsXHJcbiAgICAgICAgICBjYyA9IGMsXHJcbiAgICAgICAgICBkZCA9IGQ7XHJcblxyXG4gICAgICBhID0gRkYoYSwgYiwgYywgZCwgbVtpKyAwXSwgIDcsIC02ODA4NzY5MzYpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyAxXSwgMTIsIC0zODk1NjQ1ODYpO1xyXG4gICAgICBjID0gRkYoYywgZCwgYSwgYiwgbVtpKyAyXSwgMTcsICA2MDYxMDU4MTkpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKyAzXSwgMjIsIC0xMDQ0NTI1MzMwKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsgNF0sICA3LCAtMTc2NDE4ODk3KTtcclxuICAgICAgZCA9IEZGKGQsIGEsIGIsIGMsIG1baSsgNV0sIDEyLCAgMTIwMDA4MDQyNik7XHJcbiAgICAgIGMgPSBGRihjLCBkLCBhLCBiLCBtW2krIDZdLCAxNywgLTE0NzMyMzEzNDEpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKyA3XSwgMjIsIC00NTcwNTk4Myk7XHJcbiAgICAgIGEgPSBGRihhLCBiLCBjLCBkLCBtW2krIDhdLCAgNywgIDE3NzAwMzU0MTYpO1xyXG4gICAgICBkID0gRkYoZCwgYSwgYiwgYywgbVtpKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsxMF0sIDE3LCAtNDIwNjMpO1xyXG4gICAgICBiID0gRkYoYiwgYywgZCwgYSwgbVtpKzExXSwgMjIsIC0xOTkwNDA0MTYyKTtcclxuICAgICAgYSA9IEZGKGEsIGIsIGMsIGQsIG1baSsxMl0sICA3LCAgMTgwNDYwMzY4Mik7XHJcbiAgICAgIGQgPSBGRihkLCBhLCBiLCBjLCBtW2krMTNdLCAxMiwgLTQwMzQxMTAxKTtcclxuICAgICAgYyA9IEZGKGMsIGQsIGEsIGIsIG1baSsxNF0sIDE3LCAtMTUwMjAwMjI5MCk7XHJcbiAgICAgIGIgPSBGRihiLCBjLCBkLCBhLCBtW2krMTVdLCAyMiwgIDEyMzY1MzUzMjkpO1xyXG5cclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgMV0sICA1LCAtMTY1Nzk2NTEwKTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsgNl0sICA5LCAtMTA2OTUwMTYzMik7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krMTFdLCAxNCwgIDY0MzcxNzcxMyk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krIDBdLCAyMCwgLTM3Mzg5NzMwMik7XHJcbiAgICAgIGEgPSBHRyhhLCBiLCBjLCBkLCBtW2krIDVdLCAgNSwgLTcwMTU1ODY5MSk7XHJcbiAgICAgIGQgPSBHRyhkLCBhLCBiLCBjLCBtW2krMTBdLCAgOSwgIDM4MDE2MDgzKTtcclxuICAgICAgYyA9IEdHKGMsIGQsIGEsIGIsIG1baSsxNV0sIDE0LCAtNjYwNDc4MzM1KTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsgNF0sIDIwLCAtNDA1NTM3ODQ4KTtcclxuICAgICAgYSA9IEdHKGEsIGIsIGMsIGQsIG1baSsgOV0sICA1LCAgNTY4NDQ2NDM4KTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsxNF0sICA5LCAtMTAxOTgwMzY5MCk7XHJcbiAgICAgIGMgPSBHRyhjLCBkLCBhLCBiLCBtW2krIDNdLCAxNCwgLTE4NzM2Mzk2MSk7XHJcbiAgICAgIGIgPSBHRyhiLCBjLCBkLCBhLCBtW2krIDhdLCAyMCwgIDExNjM1MzE1MDEpO1xyXG4gICAgICBhID0gR0coYSwgYiwgYywgZCwgbVtpKzEzXSwgIDUsIC0xNDQ0NjgxNDY3KTtcclxuICAgICAgZCA9IEdHKGQsIGEsIGIsIGMsIG1baSsgMl0sICA5LCAtNTE0MDM3ODQpO1xyXG4gICAgICBjID0gR0coYywgZCwgYSwgYiwgbVtpKyA3XSwgMTQsICAxNzM1MzI4NDczKTtcclxuICAgICAgYiA9IEdHKGIsIGMsIGQsIGEsIG1baSsxMl0sIDIwLCAtMTkyNjYwNzczNCk7XHJcblxyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyA1XSwgIDQsIC0zNzg1NTgpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKyA4XSwgMTEsIC0yMDIyNTc0NDYzKTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsxMV0sIDE2LCAgMTgzOTAzMDU2Mik7XHJcbiAgICAgIGIgPSBISChiLCBjLCBkLCBhLCBtW2krMTRdLCAyMywgLTM1MzA5NTU2KTtcclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsgMV0sICA0LCAtMTUzMDk5MjA2MCk7XHJcbiAgICAgIGQgPSBISChkLCBhLCBiLCBjLCBtW2krIDRdLCAxMSwgIDEyNzI4OTMzNTMpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKyA3XSwgMTYsIC0xNTU0OTc2MzIpO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKzEwXSwgMjMsIC0xMDk0NzMwNjQwKTtcclxuICAgICAgYSA9IEhIKGEsIGIsIGMsIGQsIG1baSsxM10sICA0LCAgNjgxMjc5MTc0KTtcclxuICAgICAgZCA9IEhIKGQsIGEsIGIsIGMsIG1baSsgMF0sIDExLCAtMzU4NTM3MjIyKTtcclxuICAgICAgYyA9IEhIKGMsIGQsIGEsIGIsIG1baSsgM10sIDE2LCAtNzIyNTIxOTc5KTtcclxuICAgICAgYiA9IEhIKGIsIGMsIGQsIGEsIG1baSsgNl0sIDIzLCAgNzYwMjkxODkpO1xyXG4gICAgICBhID0gSEgoYSwgYiwgYywgZCwgbVtpKyA5XSwgIDQsIC02NDAzNjQ0ODcpO1xyXG4gICAgICBkID0gSEgoZCwgYSwgYiwgYywgbVtpKzEyXSwgMTEsIC00MjE4MTU4MzUpO1xyXG4gICAgICBjID0gSEgoYywgZCwgYSwgYiwgbVtpKzE1XSwgMTYsICA1MzA3NDI1MjApO1xyXG4gICAgICBiID0gSEgoYiwgYywgZCwgYSwgbVtpKyAyXSwgMjMsIC05OTUzMzg2NTEpO1xyXG5cclxuICAgICAgYSA9IElJKGEsIGIsIGMsIGQsIG1baSsgMF0sICA2LCAtMTk4NjMwODQ0KTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsgN10sIDEwLCAgMTEyNjg5MTQxNSk7XHJcbiAgICAgIGMgPSBJSShjLCBkLCBhLCBiLCBtW2krMTRdLCAxNSwgLTE0MTYzNTQ5MDUpO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKyA1XSwgMjEsIC01NzQzNDA1NSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krMTJdLCAgNiwgIDE3MDA0ODU1NzEpO1xyXG4gICAgICBkID0gSUkoZCwgYSwgYiwgYywgbVtpKyAzXSwgMTAsIC0xODk0OTg2NjA2KTtcclxuICAgICAgYyA9IElJKGMsIGQsIGEsIGIsIG1baSsxMF0sIDE1LCAtMTA1MTUyMyk7XHJcbiAgICAgIGIgPSBJSShiLCBjLCBkLCBhLCBtW2krIDFdLCAyMSwgLTIwNTQ5MjI3OTkpO1xyXG4gICAgICBhID0gSUkoYSwgYiwgYywgZCwgbVtpKyA4XSwgIDYsICAxODczMzEzMzU5KTtcclxuICAgICAgZCA9IElJKGQsIGEsIGIsIGMsIG1baSsxNV0sIDEwLCAtMzA2MTE3NDQpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcclxuICAgICAgYiA9IElJKGIsIGMsIGQsIGEsIG1baSsxM10sIDIxLCAgMTMwOTE1MTY0OSk7XHJcbiAgICAgIGEgPSBJSShhLCBiLCBjLCBkLCBtW2krIDRdLCAgNiwgLTE0NTUyMzA3MCk7XHJcbiAgICAgIGQgPSBJSShkLCBhLCBiLCBjLCBtW2krMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xyXG4gICAgICBjID0gSUkoYywgZCwgYSwgYiwgbVtpKyAyXSwgMTUsICA3MTg3ODcyNTkpO1xyXG4gICAgICBiID0gSUkoYiwgYywgZCwgYSwgbVtpKyA5XSwgMjEsIC0zNDM0ODU1NTEpO1xyXG5cclxuICAgICAgYSA9IChhICsgYWEpID4+PiAwO1xyXG4gICAgICBiID0gKGIgKyBiYikgPj4+IDA7XHJcbiAgICAgIGMgPSAoYyArIGNjKSA+Pj4gMDtcclxuICAgICAgZCA9IChkICsgZGQpID4+PiAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjcnlwdC5lbmRpYW4oW2EsIGIsIGMsIGRdKTtcclxuICB9O1xyXG5cclxuICAvLyBBdXhpbGlhcnkgZnVuY3Rpb25zXHJcbiAgbWQ1Ll9mZiAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgJiBjIHwgfmIgJiBkKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9nZyAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgJiBkIHwgYyAmIH5kKSArICh4ID4+PiAwKSArIHQ7XHJcbiAgICByZXR1cm4gKChuIDw8IHMpIHwgKG4gPj4+ICgzMiAtIHMpKSkgKyBiO1xyXG4gIH07XHJcbiAgbWQ1Ll9oaCAgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgeCwgcywgdCkge1xyXG4gICAgdmFyIG4gPSBhICsgKGIgXiBjIF4gZCkgKyAoeCA+Pj4gMCkgKyB0O1xyXG4gICAgcmV0dXJuICgobiA8PCBzKSB8IChuID4+PiAoMzIgLSBzKSkpICsgYjtcclxuICB9O1xyXG4gIG1kNS5faWkgID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIHgsIHMsIHQpIHtcclxuICAgIHZhciBuID0gYSArIChjIF4gKGIgfCB+ZCkpICsgKHggPj4+IDApICsgdDtcclxuICAgIHJldHVybiAoKG4gPDwgcykgfCAobiA+Pj4gKDMyIC0gcykpKSArIGI7XHJcbiAgfTtcclxuXHJcbiAgLy8gUGFja2FnZSBwcml2YXRlIGJsb2Nrc2l6ZVxyXG4gIG1kNS5fYmxvY2tzaXplID0gMTY7XHJcbiAgbWQ1Ll9kaWdlc3RzaXplID0gMTY7XHJcblxyXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcclxuICAgIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQgfHwgbWVzc2FnZSA9PT0gbnVsbClcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIGFyZ3VtZW50ICcgKyBtZXNzYWdlKTtcclxuXHJcbiAgICB2YXIgZGlnZXN0Ynl0ZXMgPSBjcnlwdC53b3Jkc1RvQnl0ZXMobWQ1KG1lc3NhZ2UsIG9wdGlvbnMpKTtcclxuICAgIHJldHVybiBvcHRpb25zICYmIG9wdGlvbnMuYXNCeXRlcyA/IGRpZ2VzdGJ5dGVzIDpcclxuICAgICAgICBvcHRpb25zICYmIG9wdGlvbnMuYXNTdHJpbmcgPyBiaW4uYnl0ZXNUb1N0cmluZyhkaWdlc3RieXRlcykgOlxyXG4gICAgICAgIGNyeXB0LmJ5dGVzVG9IZXgoZGlnZXN0Ynl0ZXMpO1xyXG4gIH07XHJcblxyXG59KSgpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBsaWJyYXJ5IGZvciBjcmVhdGluZyBhdXRoIGRhdGFcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY2hlY2tUcnVzdCA9IGV4cG9ydHMuY2hlY2tBdXRoID0gZXhwb3J0cy5lYXN5QXV0aCA9IHZvaWQgMDtcbnZhciBtZDUgPSByZXF1aXJlKFwibWQ1XCIpO1xuLy8gY3JlYXRlIHRoZSBhbmNob3IgaGlkZGVpbmcgZGVmYXVsdCBkYXRhXG52YXIgY3JlYXRvciA9IGZ1bmN0aW9uIChhbmNob3IsIGNrLCBpc05ldykge1xufTtcbmV4cG9ydHMuZWFzeUF1dGggPSBjcmVhdG9yO1xuLy8gY2hlY2sgYW5jaG9yIHRvIGdldCBhdXRoIGxpc3QuIFxudmFyIGNoZWNrID0gZnVuY3Rpb24gKGFuY2hvciwgcHJvdG9jb2wsIGNrKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIFwibGlzdFwiOiBudWxsLFxuICAgICAgICBcImFuY2hvclwiOiBudWxsLCAvL3RhcmdldCBhbmNob3IgdG8gZ2V0IHJlc3VsdFxuICAgIH07XG4gICAgLy9UT0RPLCBhdXRvIE1ENSBhbmNob3IgZnVuY3Rpb24gaXMgbm90IHRlc3RlZCB5ZXQuXG4gICAgaWYgKHByb3RvY29sLmF1dGgpIHtcbiAgICAgICAgLy8xLmNoZWNrIHdldGhlciB0YXJnZXQgYW5jaG9yIFxuICAgICAgICBpZiAodHlwZW9mIHByb3RvY29sLmF1dGggPT09IFwic3RyaW5nXCIgfHwgQXJyYXkuaXNBcnJheShwcm90b2NvbC5hdXRoKSkge1xuICAgICAgICAgICAgZGF0YS5hbmNob3IgPSBwcm90b2NvbC5hdXRoO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YS5saXN0ID0gcHJvdG9jb2wuYXV0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8yLmNoZWNrIGRlZmF1bHQgYW5jaG9yXG4gICAgICAgIGlmIChwcm90b2NvbC5zYWx0KSB7XG4gICAgICAgICAgICBkYXRhLmFuY2hvciA9IG1kNShhbmNob3IgKyBwcm90b2NvbC5zYWx0WzBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2sgJiYgY2soZGF0YSk7XG59O1xuZXhwb3J0cy5jaGVja0F1dGggPSBjaGVjaztcbnZhciB0cnVzdF9jaGVjayA9IGZ1bmN0aW9uIChhbmNob3IsIHByb3RvY29sLCBjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICBcImxpc3RcIjogbnVsbCxcbiAgICAgICAgXCJhbmNob3JcIjogbnVsbCwgLy90YXJnZXQgYW5jaG9yIHRvIGdldCByZXN1bHRcbiAgICB9O1xuICAgIC8vVE9ETywgYXV0byBNRDUgYW5jaG9yIGZ1bmN0aW9uIGlzIG5vdCB0ZXN0ZWQgeWV0LlxuICAgIGlmIChwcm90b2NvbC50cnVzdCkge1xuICAgICAgICAvLzEuY2hlY2sgd2V0aGVyIHRhcmdldCBhbmNob3IgXG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG9jb2wudHJ1c3QgPT09IFwic3RyaW5nXCIgfHwgQXJyYXkuaXNBcnJheShwcm90b2NvbC50cnVzdCkpIHtcbiAgICAgICAgICAgIGRhdGEuYW5jaG9yID0gcHJvdG9jb2wudHJ1c3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkYXRhLmxpc3QgPSBwcm90b2NvbC50cnVzdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8yLmNoZWNrIGRlZmF1bHQgYW5jaG9yXG4gICAgICAgIGlmIChwcm90b2NvbC5zYWx0KSB7XG4gICAgICAgICAgICBkYXRhLmFuY2hvciA9IG1kNShhbmNob3IgKyBwcm90b2NvbC5zYWx0WzBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2sgJiYgY2soZGF0YSk7XG59O1xuZXhwb3J0cy5jaGVja1RydXN0ID0gdHJ1c3RfY2hlY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBsaWJyYXJ5IGZvciBkZWNvZGluZyBhbmNob3IgbGlua1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5saW5rRGVjb2RlciA9IGV4cG9ydHMubGlua0NyZWF0b3IgPSB2b2lkIDA7XG52YXIgc2V0dGluZyA9IHtcbiAgICBcImNoZWNrXCI6IGZhbHNlLFxuICAgIFwidXRmOFwiOiB0cnVlLFxuICAgIFwicHJlXCI6IFwiYW5jaG9yOi8vXCIsIC8vcHJvdG9jb2wgcHJlZml4XG59O1xudmFyIHNlbGYgPSB7XG4gICAgZ2V0UGFyYW1zOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGFyciA9IHN0ci5zcGxpdChcIiZcIik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm93ID0gYXJyW2ldO1xuICAgICAgICAgICAgdmFyIGt2ID0gcm93LnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIGlmIChrdi5sZW5ndGggIT09IDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiZXJyb3IgcGFyYW1ldGVyXCIgfTtcbiAgICAgICAgICAgIG1hcFtrdlswXV0gPSBrdlsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH0sXG4gICAgY29tYmluZVBhcmFtczogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAoIW9iailcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgbGlzdC5wdXNoKFwiXCIuY29uY2F0KGssIFwiPVwiKS5jb25jYXQob2JqW2tdKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICByZXR1cm4gbGlzdC5qb2luKFwiJlwiKTtcbiAgICB9LFxufTtcbnZhciBjcmVhdG9yID0gZnVuY3Rpb24gKGxvY2FsLCBwYXJhbXMpIHtcbiAgICB2YXIgc3RyID0gc2VsZi5jb21iaW5lUGFyYW1zKHBhcmFtcyk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkobG9jYWwpKSB7XG4gICAgICAgIGlmIChsb2NhbFsxXSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHNldHRpbmcucHJlKS5jb25jYXQobG9jYWxbMF0sIFwiL1wiKS5jb25jYXQobG9jYWxbMV0pLmNvbmNhdCghc3RyID8gc3RyIDogXCI/XCIgKyBzdHIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHNldHRpbmcucHJlKS5jb25jYXQobG9jYWxbMF0pLmNvbmNhdCghc3RyID8gc3RyIDogXCI/XCIgKyBzdHIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQoc2V0dGluZy5wcmUpLmNvbmNhdChsb2NhbCkuY29uY2F0KCFzdHIgPyBzdHIgOiBcIj9cIiArIHN0cik7XG4gICAgfVxufTtcbmV4cG9ydHMubGlua0NyZWF0b3IgPSBjcmVhdG9yO1xudmFyIGRlY29kZXIgPSBmdW5jdGlvbiAobGluaykge1xuICAgIHZhciByZXMgPSB7XG4gICAgICAgIGxvY2F0aW9uOiBbXCJcIiwgMF0sXG4gICAgfTtcbiAgICB2YXIgc3RyID0gbGluay50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICAgIHZhciBwcmUgPSBzZXR0aW5nLnByZTtcbiAgICAvLzAuIGZvcm1hdCBjaGVja1xuICAgIGlmIChzdHIubGVuZ3RoIDw9IHByZS5sZW5ndGggKyAxKVxuICAgICAgICByZXR1cm4geyBlcnJvcjogXCJpbnZhbGlkIHN0cmluZ1wiIH07XG4gICAgdmFyIGhlYWQgPSBzdHIuc3Vic3RyaW5nKDAsIHByZS5sZW5ndGgpO1xuICAgIGlmIChoZWFkICE9PSBwcmUpXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcImludmFsaWQgcHJvdG9jb2xcIiB9O1xuICAgIC8vMS4gcmVtb3ZlIHByZWZpeCBgYW5jaG9yOi8vYFxuICAgIHZhciBib2R5ID0gc3RyLnN1YnN0cmluZyhwcmUubGVuZ3RoLCBzdHIubGVuZ3RoKTtcbiAgICAvLzIuIGNoZWNrIHBhcmFtZXRlclxuICAgIHZhciBhcnIgPSBib2R5LnNwbGl0KFwiP1wiKTtcbiAgICBpZiAoYXJyLmxlbmd0aCA+IDIpXG4gICAgICAgIHJldHVybiB7IGVycm9yOiBcImVycm9yIHJlcXVlc3QsIHBsZWFzZSBjaGVjayBhbmNob3IgbmFtZVwiIH07XG4gICAgdmFyIGlzUGFyYW0gPSBhcnIubGVuZ3RoID09PSAxID8gZmFsc2UgOiB0cnVlO1xuICAgIGlmIChpc1BhcmFtKSB7XG4gICAgICAgIHZhciBwcyA9IHNlbGYuZ2V0UGFyYW1zKGFyclsxXSk7XG4gICAgICAgIGlmIChwcy5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHBzO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5wYXJhbSA9IHNlbGYuZ2V0UGFyYW1zKGFyclsxXSk7XG4gICAgfVxuICAgIGJvZHkgPSBhcnJbMF07XG4gICAgLy8zLiBkZWNvZGUgYW5jaG9yIGxvY2F0aW9uXG4gICAgdmFyIGxzID0gYm9keS5zcGxpdChcIi9cIik7XG4gICAgdmFyIGxhc3QgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChsc1tpXSAhPT0gJycpXG4gICAgICAgICAgICBsYXN0LnB1c2gobHNbaV0pO1xuICAgIH1cbiAgICAvLzQuIGV4cG9ydCByZXN1bHRcbiAgICBpZiAobGFzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmVzLmxvY2F0aW9uWzBdID0gbGFzdFswXTtcbiAgICAgICAgcmVzLmxvY2F0aW9uWzFdID0gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBlbGUgPSBsYXN0LnBvcCgpO1xuICAgICAgICB2YXIgYmxvY2sgPSBwYXJzZUludChlbGUpO1xuICAgICAgICBpZiAoaXNOYU4oYmxvY2spKVxuICAgICAgICAgICAgcmV0dXJuIHsgZXJyb3I6IFwiYmxvY2sgbnVtYmVyIGVycm9yXCIgfTtcbiAgICAgICAgcmVzLmxvY2F0aW9uWzFdID0gYmxvY2s7XG4gICAgICAgIHJlcy5sb2NhdGlvblswXSA9IGxhc3Quam9pbignLycpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufTtcbmV4cG9ydHMubGlua0RlY29kZXIgPSBkZWNvZGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNoZWNrSGlkZSA9IGV4cG9ydHMuZWFzeUhpZGUgPSB2b2lkIDA7XG52YXIgbWQ1ID0gcmVxdWlyZShcIm1kNVwiKTtcbnZhciBjcmVhdG9yID0gZnVuY3Rpb24gKGFuY2hvcikge1xufTtcbmV4cG9ydHMuZWFzeUhpZGUgPSBjcmVhdG9yO1xuLy8gY2hlY2sgYW5jaG9yIHRvIGdldCBoaWRlIGxpc3RcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChhbmNob3IsIHByb3RvY29sLCBjaykge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICBcImxpc3RcIjogbnVsbCxcbiAgICAgICAgXCJhbmNob3JcIjogbnVsbCwgLy90YXJnZXQgYW5jaG9yIHRvIGdldCByZXN1bHRcbiAgICB9O1xuICAgIC8vVE9ETywgYXV0byBNRDUgYW5jaG9yIGZ1bmN0aW9uIGlzIG5vdCB0ZXN0ZWQgeWV0LlxuICAgIGlmIChwcm90b2NvbC5oaWRlKSB7XG4gICAgICAgIC8vMS5jaGVjayB3ZXRoZXIgdGFyZ2V0IGFuY2hvciBcbiAgICAgICAgaWYgKHR5cGVvZiBwcm90b2NvbC5oaWRlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBkYXRhLmFuY2hvciA9IHByb3RvY29sLmhpZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbC5oaWRlKSkge1xuICAgICAgICAgICAgZGF0YS5saXN0ID0gcHJvdG9jb2wuaGlkZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vZGF0YS5saXN0PXByb3RvY29sLmhpZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vMi5jaGVjayBkZWZhdWx0IGFuY2hvclxuICAgICAgICBpZiAocHJvdG9jb2wuc2FsdCkge1xuICAgICAgICAgICAgZGF0YS5hbmNob3IgPSBtZDUoYW5jaG9yICsgcHJvdG9jb2wuc2FsdFsxXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNrICYmIGNrKGRhdGEpO1xufTtcbmV4cG9ydHMuY2hlY2tIaWRlID0gY2hlY2s7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBUeXBlc2NyaXB0IGltcGxlbWVudCBvZiBFc2F5IFByb3RvY29sIHZlcnNpb24gMS4wLlxuLy8haW1wb3J0YW50IEVhc3kgUHJvdG9jb2wgaXMgYSBzaW1wbGUgcHJvdG9jb2wgdG8gbGF1bmNoIGNBcHAgdmlhIEFuY2hvciBuZXR3b3JrLlxuLy8haW1wb3J0YW50IEFsbCBmdW5jdGlvbnMgaW1wbGVtZW50LCBidXQgdGhpcyBpbXBsZW1lbnQgb25seSBzdXBwb3J0IEpTIHdpdGggQ1NTIGFwcGxpY2F0aW9uIFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5yZWxhdGVkSW5kZXggPSBleHBvcnRzLmtleXNBcHAgPSBleHBvcnRzLmNvZGVUeXBlID0gZXhwb3J0cy5mb3JtYXRUeXBlID0gZXhwb3J0cy5yYXdUeXBlID0gZXhwb3J0cy5lcnJvckxldmVsID0gdm9pZCAwO1xudmFyIGVycm9yTGV2ZWw7XG4oZnVuY3Rpb24gKGVycm9yTGV2ZWwpIHtcbiAgICBlcnJvckxldmVsW1wiRVJST1JcIl0gPSBcImVycm9yXCI7XG4gICAgZXJyb3JMZXZlbFtcIldBUk5cIl0gPSBcIndhcm5pbmdcIjtcbiAgICBlcnJvckxldmVsW1wiVU5FWENFUFRcIl0gPSBcInVuZXhjZXB0XCI7XG59KShlcnJvckxldmVsID0gZXhwb3J0cy5lcnJvckxldmVsIHx8IChleHBvcnRzLmVycm9yTGV2ZWwgPSB7fSkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKioqKioqZm9ybWF0IHBhcnQqKioqKioqKioqL1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xudmFyIHJhd1R5cGU7XG4oZnVuY3Rpb24gKHJhd1R5cGUpIHtcbiAgICByYXdUeXBlW1wiREFUQVwiXSA9IFwiZGF0YVwiO1xuICAgIHJhd1R5cGVbXCJBUFBcIl0gPSBcImFwcFwiO1xuICAgIHJhd1R5cGVbXCJMSUJcIl0gPSBcImxpYlwiO1xuICAgIHJhd1R5cGVbXCJOT05FXCJdID0gXCJ1bmtub3dcIjtcbn0pKHJhd1R5cGUgPSBleHBvcnRzLnJhd1R5cGUgfHwgKGV4cG9ydHMucmF3VHlwZSA9IHt9KSk7XG52YXIgZm9ybWF0VHlwZTtcbihmdW5jdGlvbiAoZm9ybWF0VHlwZSkge1xuICAgIGZvcm1hdFR5cGVbXCJKQVZBU0NSSVBUXCJdID0gXCJqc1wiO1xuICAgIGZvcm1hdFR5cGVbXCJDU1NcIl0gPSBcImNzc1wiO1xuICAgIGZvcm1hdFR5cGVbXCJNQVJLRE9XTlwiXSA9IFwibWRcIjtcbiAgICBmb3JtYXRUeXBlW1wiSlNPTlwiXSA9IFwianNvblwiO1xuICAgIGZvcm1hdFR5cGVbXCJNSVhcIl0gPSBcIm1peFwiO1xuICAgIGZvcm1hdFR5cGVbXCJOT05FXCJdID0gXCJcIjtcbn0pKGZvcm1hdFR5cGUgPSBleHBvcnRzLmZvcm1hdFR5cGUgfHwgKGV4cG9ydHMuZm9ybWF0VHlwZSA9IHt9KSk7XG52YXIgY29kZVR5cGU7XG4oZnVuY3Rpb24gKGNvZGVUeXBlKSB7XG4gICAgY29kZVR5cGVbXCJBU0NJSVwiXSA9IFwiYXNjaWlcIjtcbiAgICBjb2RlVHlwZVtcIlVURjhcIl0gPSBcInV0ZjhcIjtcbiAgICBjb2RlVHlwZVtcIkhFWFwiXSA9IFwiaGV4XCI7XG4gICAgY29kZVR5cGVbXCJOT05FXCJdID0gXCJcIjtcbn0pKGNvZGVUeXBlID0gZXhwb3J0cy5jb2RlVHlwZSB8fCAoZXhwb3J0cy5jb2RlVHlwZSA9IHt9KSk7XG52YXIga2V5c0FwcDtcbihmdW5jdGlvbiAoa2V5c0FwcCkge1xufSkoa2V5c0FwcCA9IGV4cG9ydHMua2V5c0FwcCB8fCAoZXhwb3J0cy5rZXlzQXBwID0ge30pKTtcbnZhciByZWxhdGVkSW5kZXg7XG4oZnVuY3Rpb24gKHJlbGF0ZWRJbmRleCkge1xuICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJBVVRIXCJdID0gMF0gPSBcIkFVVEhcIjtcbiAgICByZWxhdGVkSW5kZXhbcmVsYXRlZEluZGV4W1wiSElERVwiXSA9IDFdID0gXCJISURFXCI7XG4gICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIlRSVVNUXCJdID0gMl0gPSBcIlRSVVNUXCI7XG4gICAgcmVsYXRlZEluZGV4W3JlbGF0ZWRJbmRleFtcIk5BTUVcIl0gPSAwXSA9IFwiTkFNRVwiO1xuICAgIHJlbGF0ZWRJbmRleFtyZWxhdGVkSW5kZXhbXCJCTE9DS1wiXSA9IDFdID0gXCJCTE9DS1wiO1xufSkocmVsYXRlZEluZGV4ID0gZXhwb3J0cy5yZWxhdGVkSW5kZXggfHwgKGV4cG9ydHMucmVsYXRlZEluZGV4ID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIWltcG9ydGFudCBUaGlzIGlzIHRoZSBsaWJyYXJ5IGZvciBFc2F5IFByb3RvY29sIHYxLjBcbi8vIWltcG9ydGFudCBBbGwgZGF0YSBjb21lIGZyb20gYEFuY2hvciBMaW5rYFxuLy8haW1wb3J0YW50IFRoaXMgaW1wbGVtZW50IGV4dGVuZCBgYXV0aGAgYW5kIGBoaWRlYCBieSBzYWx0IHdheSB0byBsb2FkIGRhdGFcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZWFzeVJ1biA9IHZvaWQgMDtcbnZhciBwcm90b2NvbF8xID0gcmVxdWlyZShcIi4vcHJvdG9jb2xcIik7XG52YXIgcHJvdG9jb2xfMiA9IHJlcXVpcmUoXCIuL3Byb3RvY29sXCIpO1xudmFyIGRlY29kZXJfMSA9IHJlcXVpcmUoXCIuL2RlY29kZXJcIik7XG52YXIgYXV0aF8xID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbnZhciBoaWRlXzEgPSByZXF1aXJlKFwiLi9oaWRlXCIpO1xudmFyIF9hID0gcmVxdWlyZShcIi4uL2xpYi9sb2FkZXJcIiksIExvYWRlciA9IF9hLkxvYWRlciwgTGlicyA9IF9hLkxpYnM7XG4vL2NvbnN0IHthbmNob3JKU30gPXJlcXVpcmUoXCIuLi9saWIvYW5jaG9yXCIpO1xudmFyIEFQSSA9IG51bGw7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKmRlYnVnIHBhcnQqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLy9kZWJ1ZyBkYXRhIHRvIGltcHJvdmUgdGhlIGRldmVsb3BtZW50XG52YXIgZGVidWcgPSB7XG4gICAgZGlzYWJsZTogZmFsc2UsXG4gICAgY2FjaGU6IHRydWUsXG4gICAgc2VhcmNoOiBbXSxcbiAgICBzdGFydDogMCxcbiAgICBlbmQ6IDAsXG4gICAgc3RhbXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIH0sXG59O1xuLy9hbmNob3IgY2FjaGUgdG8gYXZvaWQgZHVwbGljYXRlIHJlcXVlc3QuXG52YXIgY2FjaGUgPSB7XG4gICAgZGF0YToge30sXG4gICAgc2V0OiBmdW5jdGlvbiAoaywgYiwgdikge1xuICAgICAgICBjYWNoZS5kYXRhW1wiXCIuY29uY2F0KGssIFwiX1wiKS5jb25jYXQoYildID0gdjtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uIChrLCBiKSB7XG4gICAgICAgIHJldHVybiBjYWNoZS5kYXRhW1wiXCIuY29uY2F0KGssIFwiX1wiKS5jb25jYXQoYildO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FjaGUuZGF0YSA9IHt9O1xuICAgIH0sXG59O1xuLy9iZWZvcmU6IDUwMH43MDBtc1xuLyoqKioqKioqKioqKioqKioqKioqKioqKipkZWJ1ZyBwYXJ0KioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbnZhciBzZWxmID0ge1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKkFuY2hvciBkYXRhIGZ1bmN0aW9ucyoqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGdldEFuY2hvcjogZnVuY3Rpb24gKGxvY2F0aW9uLCBjaykge1xuICAgICAgICBpZiAoQVBJID09PSBudWxsKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8gQVBJIHRvIGdldCBkYXRhLlwiLCBsZXZlbDogcHJvdG9jb2xfMS5lcnJvckxldmVsLkVSUk9SIH0pO1xuICAgICAgICB2YXIgYW5jaG9yID0gbG9jYXRpb25bMF0sIGJsb2NrID0gbG9jYXRpb25bMV07XG4gICAgICAgIC8vZGVidWcgaG9va1xuICAgICAgICBpZiAoIWRlYnVnLmNhY2hlKSB7XG4gICAgICAgICAgICB2YXIgY0RhdGEgPSBjYWNoZS5nZXQoYW5jaG9yLCBibG9jayk7XG4gICAgICAgICAgICBpZiAoY0RhdGEgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY0RhdGEpO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coYENoZWNraW5nIDogJHtKU09OLnN0cmluZ2lmeShsb2NhdGlvbil9IHZpYSAke2FkZHJlc3N9YCk7XG4gICAgICAgIGlmIChibG9jayAhPT0gMCkge1xuICAgICAgICAgICAgQVBJLmNvbW1vbi50YXJnZXQoYW5jaG9yLCBibG9jaywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpbHRlckFuY2hvcihkYXRhLCBjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEFQSS5jb21tb24ubGF0ZXN0KGFuY2hvciwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZpbHRlckFuY2hvcihkYXRhLCBjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZmlsdGVyQW5jaG9yOiBmdW5jdGlvbiAoZGF0YSwgY2spIHtcbiAgICAgICAgaWYgKCFkYXRhKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm8gc3VjaCBhbmNob3IuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgIHZhciBlcnIgPSBkYXRhO1xuICAgICAgICBpZiAoZXJyLmVycm9yKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IGVyci5lcnJvciwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIGFuY2hvciA9IGRhdGE7XG4gICAgICAgIGlmICghZGVidWcuZGlzYWJsZSlcbiAgICAgICAgICAgIGRlYnVnLnNlYXJjaC5wdXNoKFthbmNob3IubmFtZSwgYW5jaG9yLmJsb2NrXSk7IC8vZGVidWcgaG9vayBcbiAgICAgICAgaWYgKCFkZWJ1Zy5jYWNoZSlcbiAgICAgICAgICAgIGNhY2hlLnNldChhbmNob3IubmFtZSwgYW5jaG9yLmJsb2NrLCBhbmNob3IpOyAvL2RlYnVnIGhvb2tcbiAgICAgICAgaWYgKGFuY2hvci5lbXB0eSlcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIkVtcHR5IGFuY2hvci5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgaWYgKCFhbmNob3IucHJvdG9jb2wpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJOby1wcm90b2NvbCBhbmNob3IuXCIgfSk7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IGFuY2hvci5wcm90b2NvbDtcbiAgICAgICAgaWYgKCFwcm90b2NvbC50eXBlKVxuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHsgZXJyb3I6IFwiTm90IEVhc3lQcm90b2NvbCBhbmNob3IuXCIgfSk7XG4gICAgICAgIHJldHVybiBjayAmJiBjayhhbmNob3IpO1xuICAgIH0sXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKipEZWNvZGUgUmVzdWx0IGZ1bmN0aW9ucyoqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgZGVjb2RlRGF0YTogZnVuY3Rpb24gKGNPYmplY3QsIGNrKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coYERlY29kZSBkYXRhIGFuY2hvcmApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGNPYmplY3QpO1xuICAgICAgICBjT2JqZWN0LnR5cGUgPSBwcm90b2NvbF8xLnJhd1R5cGUuREFUQTtcbiAgICAgICAgdmFyIGRhdGEgPSBjT2JqZWN0LmRhdGFbXCJcIi5jb25jYXQoY09iamVjdC5sb2NhdGlvblswXSwgXCJfXCIpLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzFdKV07XG4gICAgICAgIHZhciBwcm90b2NvbCA9IGRhdGEucHJvdG9jb2w7XG4gICAgICAgIGlmIChwcm90b2NvbCAhPT0gbnVsbCAmJiBwcm90b2NvbC5jYWxsKSB7XG4gICAgICAgICAgICBjT2JqZWN0LmNhbGwgPSBwcm90b2NvbC5jYWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICB9LFxuICAgIGRlY29kZUFwcDogZnVuY3Rpb24gKGNPYmplY3QsIGNrKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coYERlY29kZSBhcHAgYW5jaG9yYCk7XG4gICAgICAgIGNPYmplY3QudHlwZSA9IHByb3RvY29sXzEucmF3VHlwZS5BUFA7XG4gICAgICAgIHZhciBkYXRhID0gY09iamVjdC5kYXRhW1wiXCIuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY09iamVjdC5sb2NhdGlvblsxXSldO1xuICAgICAgICB2YXIgcHJvdG9jb2wgPSBkYXRhLnByb3RvY29sO1xuICAgICAgICBjT2JqZWN0LmNvZGUgPSBkYXRhLnJhdztcbiAgICAgICAgaWYgKHByb3RvY29sICE9PSBudWxsICYmIHByb3RvY29sLmxpYikge1xuICAgICAgICAgICAgLy9GSVhNRSBjb2RlIHNob3VsZCBiZSBkZWZpbmVkIGNsZWFybHlcbiAgICAgICAgICAgIHNlbGYuZ2V0TGlicyhwcm90b2NvbC5saWIsIGZ1bmN0aW9uIChjb2RlKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjb2RlKTtcbiAgICAgICAgICAgICAgICBjT2JqZWN0LmxpYnMgPSBjb2RlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBkZWNvZGVMaWI6IGZ1bmN0aW9uIChjT2JqZWN0LCBjaykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGBEZWNvZGUgbGliIGFuY2hvcmApO1xuICAgICAgICBjT2JqZWN0LnR5cGUgPSBwcm90b2NvbF8xLnJhd1R5cGUuTElCO1xuICAgICAgICB2YXIgZGF0YSA9IGNPYmplY3QuZGF0YVtcIlwiLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzBdLCBcIl9cIikuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMV0pXTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gZGF0YS5wcm90b2NvbDtcbiAgICAgICAgLy8xLmNoZWNrIGFuZCBnZXQgbGlic1xuICAgICAgICBpZiAocHJvdG9jb2wgIT09IG51bGwgJiYgcHJvdG9jb2wubGliKSB7XG4gICAgICAgICAgICBzZWxmLmdldExpYnMocHJvdG9jb2wubGliLCBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY29kZSk7XG4gICAgICAgICAgICAgICAgY09iamVjdC5saWJzID0gY29kZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjT2JqZWN0KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TGliczogZnVuY3Rpb24gKGxpc3QsIGNrKSB7XG4gICAgICAgIGlmIChBUEkgPT09IG51bGwpXG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soeyBlcnJvcjogXCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsIGxldmVsOiBwcm90b2NvbF8xLmVycm9yTGV2ZWwuRVJST1IgfSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coYFJlYWR5IHRvIGdldCBsaWJzOiAke0pTT04uc3RyaW5naWZ5KGxpc3QpfWApO1xuICAgICAgICB2YXIgUlBDID0ge1xuICAgICAgICAgICAgc2VhcmNoOiBBUEkuY29tbW9uLmxhdGVzdCxcbiAgICAgICAgICAgIHRhcmdldDogQVBJLmNvbW1vbi50YXJnZXQsXG4gICAgICAgIH07XG4gICAgICAgIExpYnMobGlzdCwgUlBDLCBjayk7XG4gICAgfSxcbiAgICBnZXRIaXN0b3J5OiBmdW5jdGlvbiAobG9jYXRpb24sIGNrKSB7XG4gICAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICAgIHZhciBlcnJzID0gW107XG4gICAgICAgIGlmIChBUEkgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0LCBlcnJzKTtcbiAgICAgICAgfVxuICAgICAgICAvL2lmKEFQST09PW51bGwpIHJldHVybiBjayAmJiBjayh7ZXJyb3I6XCJObyBBUEkgdG8gZ2V0IGRhdGEuXCIsbGV2ZWw6ZXJyb3JMZXZlbC5FUlJPUn0pO1xuICAgICAgICB2YXIgYW5jaG9yID0gbG9jYXRpb25bMF0sIGJsb2NrID0gbG9jYXRpb25bMV07XG4gICAgICAgIEFQSS5jb21tb24uaGlzdG9yeShhbmNob3IsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICBpZiAoZXJyLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgZXJycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGxpc3QsIGVycnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFsaXN0ID0gcmVzO1xuICAgICAgICAgICAgaWYgKGFsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIkVtcHR5IGhpc3RvcnlcIiB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobGlzdCwgZXJycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soYWxpc3QsIGVycnMpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKk1lcmdlIHJlbGF0ZWQgYW5jaG9ycyoqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKlxuICAgICAqIGNvbWJpbmUgdGhlIGhpZGUgYW5kIGF1dGggbGlzdCB0byByZXN1bHRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gICAgICBhbmNob3JcdCAgICAvL2BBbmNob3JgIG5hbWVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gICAgICBwcm90b2NvbCAgICAvL0Vhc3kgUHJvdG9jb2xcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gICAgICBjZmcgICAgICAgICAvL3JldmVyc2VkIGNvbmZpZyBwYXJhbWV0ZXJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSAgICBjayAgICAgICAgICAvL2NhbGxiYWNrLCB3aWxsIHJldHVybiB0aGUgbWVyZ2UgcmVzdWx0LCBpbmNsdWRpbmcgdGhlIHJlbGF0ZWQgYGFuY2hvcmBcbiAgICAgKiAqL1xuICAgIG1lcmdlOiBmdW5jdGlvbiAoYW5jaG9yLCBwcm90b2NvbCwgY2spIHtcbiAgICAgICAgaWYgKEFQSSA9PT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBcIk5vIEFQSSB0byBnZXQgZGF0YS5cIiwgbGV2ZWw6IHByb3RvY29sXzEuZXJyb3JMZXZlbC5FUlJPUiB9KTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIFwiaGlkZVwiOiBbXSxcbiAgICAgICAgICAgIFwiYXV0aFwiOiBudWxsLFxuICAgICAgICAgICAgXCJ0cnVzdFwiOiBudWxsLFxuICAgICAgICAgICAgXCJlcnJvclwiOiBbXSxcbiAgICAgICAgICAgIFwiaW5kZXhcIjogW251bGwsIG51bGwsIG51bGxdLFxuICAgICAgICAgICAgXCJtYXBcIjoge30sXG4gICAgICAgIH07XG4gICAgICAgIC8vY29uc29sZS5sb2coYE1lcmdpbmcgZnVuY3Rpb24gcmVhZHkgdG8gZ28uLi5gKTtcbiAgICAgICAgLy8xLmdldCBoaWRlIHJlbGF0ZWQgZGF0YSBhbmQgbWVyZ2UgdG8gcmVzdWx0XG4gICAgICAgIHNlbGYuc2luZ2xlUnVsZShhbmNob3IsIHByb3RvY29sLCBwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFLCBmdW5jdGlvbiAocmVzLCBtYXAsIGxvY2FsLCBlcnJzKSB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGBzaW5nbGVSdWxlIDEgcmVhZHlgKTtcbiAgICAgICAgICAgIGlmIChsb2NhbCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguSElERV0gPSBsb2NhbDtcbiAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbWFwKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5tYXBba10gPSBtYXBba107XG4gICAgICAgICAgICBpZiAoZXJycy5sZW5ndGggIT09IDApXG4gICAgICAgICAgICAgICAgKF9hID0gcmVzdWx0LmVycm9yKS5wdXNoLmFwcGx5KF9hLCBlcnJzKTtcbiAgICAgICAgICAgIHJlc3VsdC5oaWRlID0gcmVzO1xuICAgICAgICAgICAgLy8yLmdldCBhdXRoIHJlbGF0ZWQgZGF0YSBhbmQgbWVyZ2UgdG8gcmVzdWx0XG4gICAgICAgICAgICBzZWxmLnNpbmdsZVJ1bGUoYW5jaG9yLCBwcm90b2NvbCwgcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSCwgZnVuY3Rpb24gKHJlcywgbWFwLCBsb2NhbCwgZXJycykge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGBzaW5nbGVSdWxlIDIgcmVhZHlgKTtcbiAgICAgICAgICAgICAgICBpZiAobG9jYWwgIT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5BVVRIXSA9IGxvY2FsO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbWFwKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQubWFwW2tdID0gbWFwW2tdO1xuICAgICAgICAgICAgICAgIGlmIChlcnJzLmxlbmd0aCAhPT0gMClcbiAgICAgICAgICAgICAgICAgICAgKF9hID0gcmVzdWx0LmVycm9yKS5wdXNoLmFwcGx5KF9hLCBlcnJzKTtcbiAgICAgICAgICAgICAgICByZXN1bHQuYXV0aCA9IHJlcztcbiAgICAgICAgICAgICAgICAvLzMuZ2V0IHRydXN0IHJlbGF0ZWQgZGF0YSBhbmQgbWVyZ2UgdG8gcmVzdWx0XG4gICAgICAgICAgICAgICAgc2VsZi5zaW5nbGVSdWxlKGFuY2hvciwgcHJvdG9jb2wsIHByb3RvY29sXzIucmVsYXRlZEluZGV4LlRSVVNULCBmdW5jdGlvbiAocmVzLCBtYXAsIGxvY2FsLCBlcnJzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYHNpbmdsZVJ1bGUgMyByZWFkeWApO1xuICAgICAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5UUlVTVF0gPSBsb2NhbDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBtYXApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubWFwW2tdID0gbWFwW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJycy5sZW5ndGggIT09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAoX2EgPSByZXN1bHQuZXJyb3IpLnB1c2guYXBwbHkoX2EsIGVycnMpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQudHJ1c3QgPSByZXM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy9nZXQgd2hvbGUgcmVsYXRlZCBkYXRhIGJ5IHByb3RvY29sXG4gICAgc2luZ2xlUnVsZTogZnVuY3Rpb24gKGFuY2hvciwgcHJvdG9jb2wsIHRhZywgY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gbnVsbDtcbiAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgc2luZ2xlUnVsZSAke2FuY2hvcn0sIHRhZyA6ICR7dGFnfSwgcHJvdG9jb2wgOiAke0pTT04uc3RyaW5naWZ5KHByb3RvY29sKX1gKTtcbiAgICAgICAgLy8xLmRlY29kZSBwcm90b2NvbCB0byBjaGVjayB3ZXRoZXIgZ2V0IG1vcmUgZGF0YVxuICAgICAgICBzd2l0Y2ggKHRhZykge1xuICAgICAgICAgICAgY2FzZSBwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFOlxuICAgICAgICAgICAgICAgICgwLCBoaWRlXzEuY2hlY2tIaWRlKShhbmNob3IsIHByb3RvY29sLCBmdW5jdGlvbiAocmVzSGlkZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzSGlkZS5hbmNob3IgPT09IG51bGwgJiYgcmVzSGlkZS5saXN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXNIaWRlLmxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGxvY2F0aW9uLCBlcnJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNIaWRlLmFuY2hvciAhPT0gbnVsbCAmJiByZXNIaWRlLmxpc3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2luZ2xlRXh0ZW5kKHJlc0hpZGUuYW5jaG9yLCBmYWxzZSwgZnVuY3Rpb24gKHJlc1NpbmdsZSwgbWFwU2luZ2xlLCBlcnJzU2luZ2xlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzU2luZ2xlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbWFwU2luZ2xlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBba10gPSBtYXBTaW5nbGVba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoLmFwcGx5KGVycnMsIGVycnNTaW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQsIG1hcCwgbG9jYXRpb24sIGVycnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzSGlkZS5hbmNob3IgIT09IG51bGwgJiYgcmVzSGlkZS5saXN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJGb3JtYXQgZXJyb3IuXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGxvY2F0aW9uLCBlcnJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQsIG1hcCwgbG9jYXRpb24sIGVycnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHByb3RvY29sXzIucmVsYXRlZEluZGV4LkFVVEg6XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhgQXV0aCBhdGhvcml0eSBjaGVjay4uLmApO1xuICAgICAgICAgICAgICAgICgwLCBhdXRoXzEuY2hlY2tBdXRoKShhbmNob3IsIHByb3RvY29sLCBmdW5jdGlvbiAocmVzQXV0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzQXV0aC5hbmNob3IgPT09IG51bGwgJiYgcmVzQXV0aC5saXN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXNBdXRoLmxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGxvY2F0aW9uLCBlcnJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXNBdXRoLmFuY2hvciAhPT0gbnVsbCAmJiByZXNBdXRoLmxpc3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYFRoaXMgd2F5Li4uYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNpbmdsZUV4dGVuZChyZXNBdXRoLmFuY2hvciwgdHJ1ZSwgZnVuY3Rpb24gKHJlc1NpbmdsZSwgbWFwU2luZ2xlLCBlcnJzU2luZ2xlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzU2luZ2xlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gbWFwU2luZ2xlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBba10gPSBtYXBTaW5nbGVba107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoLmFwcGx5KGVycnMsIGVycnNTaW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQsIG1hcCwgbG9jYXRpb24sIGVycnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzQXV0aC5hbmNob3IgIT09IG51bGwgJiYgcmVzQXV0aC5saXN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJGb3JtYXQgZXJyb3IuXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGxvY2F0aW9uLCBlcnJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQsIG1hcCwgbG9jYXRpb24sIGVycnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHByb3RvY29sXzIucmVsYXRlZEluZGV4LlRSVVNUOlxuICAgICAgICAgICAgICAgICgwLCBhdXRoXzEuY2hlY2tUcnVzdCkoYW5jaG9yLCBwcm90b2NvbCwgZnVuY3Rpb24gKHJlc1RydXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNUcnVzdC5hbmNob3IgPT09IG51bGwgJiYgcmVzVHJ1c3QubGlzdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzVHJ1c3QubGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQsIG1hcCwgbG9jYXRpb24sIGVycnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc1RydXN0LmFuY2hvciAhPT0gbnVsbCAmJiByZXNUcnVzdC5saXN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNpbmdsZUV4dGVuZChyZXNUcnVzdC5hbmNob3IsIHRydWUsIGZ1bmN0aW9uIChyZXNTaW5nbGUsIG1hcFNpbmdsZSwgZXJyc1NpbmdsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc1NpbmdsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIG1hcFNpbmdsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwW2tdID0gbWFwU2luZ2xlW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycnMucHVzaC5hcHBseShlcnJzLCBlcnJzU2luZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGxvY2F0aW9uLCBlcnJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc1RydXN0LmFuY2hvciAhPT0gbnVsbCAmJiByZXNUcnVzdC5saXN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJGb3JtYXQgZXJyb3IuXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGxvY2F0aW9uLCBlcnJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQsIG1hcCwgbG9jYXRpb24sIGVycnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcInVua25vdyByZWxhdGVkIGluZGV4LlwiIH0pO1xuICAgICAgICAgICAgICAgIGNrICYmIGNrKHJlc3VsdCwgbWFwLCBsb2NhdGlvbiwgZXJycyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vZ2V0IGFuY2hvciBleHRlbmQgZGF0YSwgdHdvIHBhcnRzOiAxLmV4dGVuZCBhbmNob3IgaXRzZWxmOyAyLmRlY2xhcmVkIGhpZGRlbiBhbmNob3JcbiAgICBzaW5nbGVFeHRlbmQ6IGZ1bmN0aW9uIChuYW1lLCBoaXN0b3J5LCBjaykge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGAke25hbWV9OiR7aGlzdG9yeX1gKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG51bGw7XG4gICAgICAgIHZhciBtYXAgPSB7fTtcbiAgICAgICAgdmFyIGVycnMgPSBbXTtcbiAgICAgICAgdmFyIGxhc3QgPSBBcnJheS5pc0FycmF5KG5hbWUpID8gW25hbWVbMF0sIDBdIDogW25hbWUsIDBdO1xuICAgICAgICBpZiAoaGlzdG9yeSkge1xuICAgICAgICAgICAgLy8xLmdldCB0aGUgbGF0ZXN0IGRlY2xhcmVkIGhpZGRlbiBsaXN0LlxuICAgICAgICAgICAgc2VsZi5nZXRMYXRlc3REZWNsYXJlZEhpZGRlbihsYXN0LCBmdW5jdGlvbiAocmVzSGlkZGVuLCByZXNBbmNob3IpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gcmVzSGlkZGVuO1xuICAgICAgICAgICAgICAgIGlmIChlcnIgIT09IHVuZGVmaW5lZCAmJiBlcnIuZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgIGlmIChyZXNBbmNob3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBtYXBbXCJcIi5jb25jYXQocmVzQW5jaG9yLm5hbWUsIFwiX1wiKS5jb25jYXQocmVzQW5jaG9yLmJsb2NrKV0gPSByZXNBbmNob3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzSGlkZGVuKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHJlc0FuY2hvcik7XG4gICAgICAgICAgICAgICAgLy8xLjEuc2V0IGhpZGRlbiBoaXN0b3J5IG1hcFxuICAgICAgICAgICAgICAgIHZhciBsYXN0SGlkZGVuID0gcmVzSGlkZGVuO1xuICAgICAgICAgICAgICAgIHZhciBobWFwID0ge307XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobGFzdEhpZGRlbikpXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdEhpZGRlbi5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgICAgICAgICAgICAgIGhtYXBbbGFzdEhpZGRlbltpXV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHNlbGYuZ2V0SGlzdG9yeShbQXJyYXkuaXNBcnJheShuYW1lKSA/IG5hbWVbMF0gOiBuYW1lLCAwXSwgZnVuY3Rpb24gKGxpc3RIaXN0b3J5LCBlcnJzSGlzdG9yeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyc0hpc3RvcnkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycnMucHVzaC5hcHBseShlcnJzLCBlcnJzSGlzdG9yeSk7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobGlzdEhpc3RvcnkpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RIaXN0b3J5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGxpc3RIaXN0b3J5W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwW1wiXCIuY29uY2F0KGRhdGEubmFtZSwgXCJfXCIpLmNvbmNhdChkYXRhLmJsb2NrKV0gPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhtYXBbZGF0YS5ibG9ja10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRhdGEucHJvdG9jb2wgfHwgIWRhdGEucmF3IHx8IGRhdGEucHJvdG9jb2wudHlwZSAhPT0gcHJvdG9jb2xfMS5yYXdUeXBlLkRBVEEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJOb3QgdmFsaWQgYW5jaG9yLiBcIi5jb25jYXQoZGF0YS5uYW1lLCBcIjpcIikuY29uY2F0KGRhdGEuYmxvY2spIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gSlNPTi5wYXJzZShkYXRhLnJhdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tdID0gdGFyZ2V0W2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIkpTT04gZm9ybWF0IGZhaWxlZC4gXCIuY29uY2F0KGRhdGEubmFtZSwgXCI6XCIpLmNvbmNhdChkYXRhLmJsb2NrKSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGVycnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmdldEFuY2hvcihBcnJheS5pc0FycmF5KG5hbWUpID8gbmFtZSA6IFtuYW1lLCAwXSwgZnVuY3Rpb24gKHJlc1NpbmdsZSkge1xuICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXNTaW5nbGU7XG4gICAgICAgICAgICAgICAgaWYgKGVyciAhPT0gdW5kZWZpbmVkICYmIGVyci5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc3VsdCwgbWFwLCBlcnJzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNTaW5nbGU7XG4gICAgICAgICAgICAgICAgbWFwW1wiXCIuY29uY2F0KGRhdGEubmFtZSwgXCJfXCIpLmNvbmNhdChkYXRhLmJsb2NrKV0gPSBkYXRhO1xuICAgICAgICAgICAgICAgIGlmICghZGF0YS5wcm90b2NvbCB8fCAhZGF0YS5yYXcgfHwgZGF0YS5wcm90b2NvbC50eXBlICE9PSBwcm90b2NvbF8xLnJhd1R5cGUuREFUQSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJzLnB1c2goeyBlcnJvcjogXCJOb3QgdmFsaWQgYW5jaG9yLlwiIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socmVzdWx0LCBtYXAsIGVycnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBKU09OLnBhcnNlKGRhdGEucmF3KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc3VsdCwgbWFwLCBlcnJzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBKU09OLnN0cmluZ2lmeShlcnJvcikgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhyZXN1bHQsIG1hcCwgZXJycyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRlY29kZUhpZGVBbmNob3I6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgICAgdmFyIHByb3RvY29sID0gb2JqLnByb3RvY29sO1xuICAgICAgICBpZiAoKHByb3RvY29sID09PSBudWxsIHx8IHByb3RvY29sID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcm90b2NvbC5mbXQpID09PSAnanNvbicpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHJhdyA9IEpTT04ucGFyc2Uob2JqLnJhdyk7XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmF3KSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhdy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG4gPSBwYXJzZUludChyYXdbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc05hTihuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2gobik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBlcnJvcjogJ2ZhaWxlZCB0byBwYXJzZSBKU09OJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0O1xuICAgIH0sXG4gICAgLy9jaGVjayB0aGUgYXV0aG9yaXR5IHRvIGFjY291bnQgYWRkcmVzc1xuICAgIGNoZWNrQXV0aG9yaXR5OiBmdW5jdGlvbiAoY2FsbGVyLCBhcHAsIGNrKSB7XG4gICAgICAgIC8vMS5jaGVjayB0aGUgY2FsbGVkIGFuY2hvciB0eXBlLlxuICAgICAgICBpZiAoYXBwLnR5cGUgIT09IHByb3RvY29sXzEucmF3VHlwZS5BUFApIHtcbiAgICAgICAgICAgIGNhbGxlci5lcnJvci5wdXNoKHsgZXJyb3I6IFwiQW5zd2VyIGlzIG5vdCBjQXBwLlwiIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8yLmNoZWNrIHRoZSBhdXRob3JpdHlcbiAgICAgICAgdmFyIGZyb20gPSBjYWxsZXIuZGF0YVtcIlwiLmNvbmNhdChjYWxsZXIubG9jYXRpb25bMF0sIFwiX1wiKS5jb25jYXQoY2FsbGVyLmxvY2F0aW9uWzFdKV07XG4gICAgICAgIHZhciBzaWduZXIgPSBmcm9tLnNpZ25lcjtcbiAgICAgICAgdmFyIGF1dGhzID0gYXBwLmF1dGg7XG4gICAgICAgIC8vMi4xLiBubyBhdXRob3JpdHkgZGF0YSwgY2FuIFxuICAgICAgICBpZiAoYXV0aHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNlbGYuZW1wdHkoYXV0aHMpKSB7XG4gICAgICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChhdXRoc1tzaWduZXJdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmVycm9yLnB1c2goeyBlcnJvcjogXCJObyBhdXRob3JpdHkgb2YgY2FsbGVyLlwiIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY2FsbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdXRoc1tzaWduZXJdID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsZXIuYXBwID0gYXBwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBBUEkgPT09IG51bGwgfHwgQVBJID09PSB2b2lkIDAgPyB2b2lkIDAgOiBBUEkuY29tbW9uLmJsb2NrKGZ1bmN0aW9uIChibG9jaywgaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYmxvY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChibG9jayA+IGF1dGhzW3NpZ25lcl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmVycm9yLnB1c2goeyBlcnJvcjogXCJBdXRob3JpdHkgb3V0IG9mIHRpbWUuXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhjYWxsZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVyLmFwcCA9IGFwcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNhbGxlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vZ2V0IHRoZSBsYXRlc3QgZGVjYXJlZCBoaWRlIGFuY2hvciBsaXN0LlxuICAgIGdldExhdGVzdERlY2xhcmVkSGlkZGVuOiBmdW5jdGlvbiAobG9jYXRpb24sIGNrKSB7XG4gICAgICAgIHNlbGYuZ2V0QW5jaG9yKFtsb2NhdGlvblswXSwgMF0sIGZ1bmN0aW9uIChyZXNMYXRlc3QpIHtcbiAgICAgICAgICAgIC8vMS4gZmFpbGRlIHRvIGdldCB0aGUgaGlkZSBhbmNob3IuXG4gICAgICAgICAgICB2YXIgZXJyID0gcmVzTGF0ZXN0O1xuICAgICAgICAgICAgLy9pZihlcnIuZXJyb3IpIHJldHVybiBjayAmJiBjayhlcnIpO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soW10pO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNMYXRlc3Q7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBkYXRhLnByb3RvY29sO1xuICAgICAgICAgICAgaWYgKHByb3RvY29sID09PSBudWxsIHx8ICFwcm90b2NvbC5oaWRlKVxuICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhbXSk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbC5oaWRlKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2socHJvdG9jb2wuaGlkZSk7XG4gICAgICAgICAgICBzZWxmLmdldEFuY2hvcihbcHJvdG9jb2wuaGlkZSwgMF0sIGZ1bmN0aW9uIChyZXNIaWRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IHJlc0xhdGVzdDtcbiAgICAgICAgICAgICAgICAvL2lmKGVyci5lcnJvcikgcmV0dXJuIGNrICYmIGNrKGVycik7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKFtdKTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlc0hpZGU7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwgfHwgIWRhdGEucmF3KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soW10sIGRhdGEpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsaXN0ID0gSlNPTi5wYXJzZShkYXRhLnJhdyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhsaXN0LCBkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayh7IGVycm9yOiBlcnJvciB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKipEZWNsYXJlZCBhbmNob3IgY2hlY2sqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvL2NoZWNrIHdldGhlciBjdXJyZW50IGFuY2hvciBpcyBpbiB0aGUgaGlkZSBsaXN0XG4gICAgaXNWYWxpZEFuY2hvcjogZnVuY3Rpb24gKGhpZGUsIGRhdGEsIGNrLCBwYXJhbXMpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhwYXJhbXMpO1xuICAgICAgICB2YXIgZXJycyA9IFtdO1xuICAgICAgICB2YXIgY3VyID0gZGF0YS5ibG9jaztcbiAgICAgICAgdmFyIG92ZXJsb2FkID0gZmFsc2U7IC8vd2V0aGVyIHRvIHRoZSBlbmQgb2YgYEFuY2hvcmAgaGlzdG9yeVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShoaWRlKSkge1xuICAgICAgICAgICAgLy8xLmlmIHRoZSBoaWRlIGlzIGFycmF5LCBjaGVjayBkaXJlY3RseVxuICAgICAgICAgICAgdmFyIGhsaXN0ID0gaGlkZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VyID09PSBobGlzdFtpXSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5wcmUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIk91dCBvZiBcIi5jb25jYXQoZGF0YS5uYW1lLCBcIiBsaW1pdGVkXCIpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxvYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG51bGwsIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3X2xpbmsgPSAoMCwgZGVjb2Rlcl8xLmxpbmtDcmVhdG9yKShbZGF0YS5uYW1lLCBkYXRhLnByZV0sIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhuZXdfbGluaywgZXJycywgb3ZlcmxvYWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjayAmJiBjayhudWxsLCBlcnJzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vMi5nZXQgdGhlIGxhdGVzdCBoaWRlIGFuY2hvciBkYXRhXG4gICAgICAgICAgICB2YXIgaF9sb2NhdGlvbiA9IFtoaWRlLCAwXTtcbiAgICAgICAgICAgIHNlbGYuZ2V0QW5jaG9yKGhfbG9jYXRpb24sIGZ1bmN0aW9uIChoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciByZXMgPSBzZWxmLmRlY29kZUhpZGVBbmNob3IoaGRhdGEpO1xuICAgICAgICAgICAgICAgIHZhciBlcnIgPSByZXM7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5lcnJvcilcbiAgICAgICAgICAgICAgICAgICAgZXJycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgdmFyIGhsaXN0ID0gcmVzO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1ciA9PT0gaGxpc3RbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLnByZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycnMucHVzaCh7IGVycm9yOiBcIk91dCBvZiBcIi5jb25jYXQoZGF0YS5uYW1lLCBcIiBsaW1pdGVkXCIpIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2sgJiYgY2sobnVsbCwgZXJycywgb3ZlcmxvYWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld19saW5rID0gKDAsIGRlY29kZXJfMS5saW5rQ3JlYXRvcikoW2RhdGEubmFtZSwgZGF0YS5wcmVdLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG5ld19saW5rLCBlcnJzLCBvdmVybG9hZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKG51bGwsIGVycnMsIG92ZXJsb2FkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKipCYXNpYyBmdW5jdGlvbnMqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICAvKipcbiAgICAgKiBnZXQgcGFyYW1zIGZyb20gc3RyaW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9ICAgICAgYXJnc1x0ICAgIC8vU3RyaW5nIHN1Y2ggYXMgYGtleV9hPXZhbCZrZXlfYj12YWwma2V5X2M9dmFsYFxuICAgICAqICovXG4gICAgZ2V0UGFyYW1zOiBmdW5jdGlvbiAoYXJncykge1xuICAgICAgICB2YXIgbWFwID0ge307XG4gICAgICAgIHZhciBhcnIgPSBhcmdzLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb3cgPSBhcnJbaV07XG4gICAgICAgICAgICB2YXIga3YgPSByb3cuc3BsaXQoXCI9XCIpO1xuICAgICAgICAgICAgaWYgKGt2Lmxlbmd0aCAhPT0gMilcbiAgICAgICAgICAgICAgICByZXR1cm4geyBlcnJvcjogXCJlcnJvciBwYXJhbWV0ZXJcIiB9O1xuICAgICAgICAgICAgbWFwW2t2WzBdXSA9IGt2WzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBjaGVjayB3ZXRoZXIgb2JqZWN0IGVtcHR5XG4gICAgICogQHBhcmFtIHtvYmplY3R9ICAgICAgb2JqXHQgICAgLy9ub3JtYWwgb2JqZWN0XG4gICAgICogKi9cbiAgICBlbXB0eTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iailcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbn07XG52YXIgZGVjb2RlciA9IHt9O1xuZGVjb2Rlcltwcm90b2NvbF8xLnJhd1R5cGUuQVBQXSA9IHNlbGYuZGVjb2RlQXBwO1xuZGVjb2Rlcltwcm90b2NvbF8xLnJhd1R5cGUuREFUQV0gPSBzZWxmLmRlY29kZURhdGE7XG5kZWNvZGVyW3Byb3RvY29sXzEucmF3VHlwZS5MSUJdID0gc2VsZi5kZWNvZGVMaWI7XG4vLyFpbXBvcnRhbnQsIGFzIHN1cHBvcnQgYGRlY2xhcmVkIGhpZGRlbmAsIHRoaXMgZnVuY3Rpb24gbWF5IHJlZGlyZWN0IG1hbnkgdGltZXMsIGJlIGNhcmVmdWwuXG4vKipcbiAqIEV4cG9zZWQgbWV0aG9kIG9mIEVhc3kgUHJvdG9jb2wgaW1wbGVtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICBsaW5rZXJcdCAgICAvL0FuY2hvciBsaW5rZXIsIHN1Y2ggYXMgYGFuY2hvcjovL2hlbGxvL2BcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgIGlucHV0QVBJICAgIC8vdGhlIEFQSSBuZWVkZWQgdG8gYWNjZXNzIEFuY2hvciBuZXR3b3JrLCBgYW5jaG9ySlNgIG1haW5seVxuICogQHBhcmFtIHtmdW5jdGlvbn0gICAgY2sgICAgICAgICAgLy9jYWxsYmFjaywgd2lsbCByZXR1cm4gdGhlIGRlY29kZWQgcmVzdWx0XG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICBbZmVuY2VdICAgICAvL2lmIHRydWUsIHRyZWF0IHRoZSBydW4gcmVzdWx0IGFzIGNBcHAuIFRoZW4gZW5kIG9mIHRoZSBsb29wLlxuICogKi9cbnZhciBydW4gPSBmdW5jdGlvbiAobGlua2VyLCBpbnB1dEFQSSwgY2ssIGhsaXN0LCBmZW5jZSkge1xuICAgIGlmIChBUEkgPT09IG51bGwgJiYgaW5wdXRBUEkgIT09IG51bGwpXG4gICAgICAgIEFQSSA9IGlucHV0QVBJO1xuICAgIHZhciB0YXJnZXQgPSAoMCwgZGVjb2Rlcl8xLmxpbmtEZWNvZGVyKShsaW5rZXIpO1xuICAgIGlmICh0YXJnZXQuZXJyb3IpXG4gICAgICAgIHJldHVybiBjayAmJiBjayh0YXJnZXQpO1xuICAgIC8vY29uc29sZS5sb2coYEhpZGRlbiBsaXN0IGNoZWNraW5nLi4uYCk7XG4gICAgLy9jb25zb2xlLmxvZyhobGlzdCk7XG4gICAgLy8wLmdldCB0aGUgbGF0ZXN0IGRlY2xhcmVkIGhpZGRlbiBsaXN0XG4gICAgaWYgKGhsaXN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgQ2hlY2tpbmcgdGhlIGhpZGUgbGlzdGApO1xuICAgICAgICByZXR1cm4gc2VsZi5nZXRMYXRlc3REZWNsYXJlZEhpZGRlbih0YXJnZXQubG9jYXRpb24sIGZ1bmN0aW9uIChsYXN0SGlkZSwgbGFzdEFuY2hvcikge1xuICAgICAgICAgICAgdmFyIGNPYmplY3QgPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogcHJvdG9jb2xfMS5yYXdUeXBlLk5PTkUsXG4gICAgICAgICAgICAgICAgbG9jYXRpb246IFt0YXJnZXQubG9jYXRpb25bMF0sIHRhcmdldC5sb2NhdGlvblsxXSAhPT0gMCA/IHRhcmdldC5sb2NhdGlvblsxXSA6IDBdLFxuICAgICAgICAgICAgICAgIGVycm9yOiBbXSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgICAgICAgICBpbmRleDogW251bGwsIG51bGwsIG51bGxdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cobGFzdEhpZGUpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhsYXN0QW5jaG9yKTtcbiAgICAgICAgICAgIHZhciByZXMgPSBsYXN0SGlkZTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgIGlmIChyZXMgIT09IHVuZGVmaW5lZCAmJiByZXMuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjT2JqZWN0LmVycm9yLnB1c2gocmVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVuKGxpbmtlciwgQVBJLCBjaywgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhSZXN1bHQgPSBsYXN0SGlkZTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coYEhpZGRlbiBsaXN0Li4uYCk7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGhSZXN1bHQpO1xuICAgICAgICAgICAgcmV0dXJuIHJ1bihsaW5rZXIsIEFQSSwgY2ssIGhSZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8xLmRlY29kZSB0aGUgYEFuY2hvciBMaW5rYCwgcHJlcGFyZSB0aGUgcmVzdWx0IG9iamVjdC5cbiAgICB2YXIgY09iamVjdCA9IHtcbiAgICAgICAgdHlwZTogcHJvdG9jb2xfMS5yYXdUeXBlLk5PTkUsXG4gICAgICAgIGxvY2F0aW9uOiBbdGFyZ2V0LmxvY2F0aW9uWzBdLCB0YXJnZXQubG9jYXRpb25bMV0gIT09IDAgPyB0YXJnZXQubG9jYXRpb25bMV0gOiAwXSxcbiAgICAgICAgZXJyb3I6IFtdLFxuICAgICAgICBkYXRhOiB7fSxcbiAgICAgICAgaW5kZXg6IFtudWxsLCBudWxsLCBudWxsXSxcbiAgICAgICAgaGlkZTogaGxpc3QsXG4gICAgICAgIC8vdHJ1c3Q6e30sXG4gICAgfTtcbiAgICBpZiAodGFyZ2V0LnBhcmFtKVxuICAgICAgICBjT2JqZWN0LnBhcmFtZXRlciA9IHRhcmdldC5wYXJhbTtcbiAgICAvL2NvbnNvbGUubG9nKGBDb250aW51ZS4uLmApO1xuICAgIC8vY29uc29sZS5sb2codGFyZ2V0KTtcbiAgICAvLzIuVHJ5IHRvIGdldCB0aGUgdGFyZ2V0IGBBbmNob3JgIGRhdGEuXG4gICAgc2VsZi5nZXRBbmNob3IodGFyZ2V0LmxvY2F0aW9uLCBmdW5jdGlvbiAocmVzQW5jaG9yKSB7XG4gICAgICAgIC8vMi4xLmVycm9yIGhhbmRsZS5cbiAgICAgICAgdmFyIGVyciA9IHJlc0FuY2hvcjtcbiAgICAgICAgaWYgKGVyci5lcnJvcikge1xuICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKGVycik7XG4gICAgICAgICAgICByZXR1cm4gY2sgJiYgY2soY09iamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGEgPSByZXNBbmNob3I7XG4gICAgICAgIGlmIChjT2JqZWN0LmxvY2F0aW9uWzFdID09PSAwKVxuICAgICAgICAgICAgY09iamVjdC5sb2NhdGlvblsxXSA9IGRhdGEuYmxvY2s7XG4gICAgICAgIGNPYmplY3QuZGF0YVtcIlwiLmNvbmNhdChjT2JqZWN0LmxvY2F0aW9uWzBdLCBcIl9cIikuY29uY2F0KGNPYmplY3QubG9jYXRpb25bMV0pXSA9IGRhdGE7XG4gICAgICAgIC8vMi4yLldldGhlciBKU09OIHByb3RvY29sXG4gICAgICAgIGlmIChkYXRhLnByb3RvY29sID09PSBudWxsKSB7XG4gICAgICAgICAgICBjT2JqZWN0LmVycm9yLnB1c2goeyBlcnJvcjogXCJObyB2YWxpZCBwcm90b2NvbFwiIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIC8vMi4zLldldGhlciBFYXN5IFByb3RvY29sXG4gICAgICAgIHZhciB0eXBlID0gIWRhdGEucHJvdG9jb2wudHlwZSA/IFwiXCIgOiBkYXRhLnByb3RvY29sLnR5cGU7XG4gICAgICAgIGlmICghZGVjb2Rlclt0eXBlXSkge1xuICAgICAgICAgICAgY09iamVjdC5lcnJvci5wdXNoKHsgZXJyb3I6IFwiTm90IGVhc3kgcHJvdG9jb2wgdHlwZVwiIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIC8vMy4gY2hlY2sgd2V0aGVyIHRoZSBsYXRlc3QgYW5jaG9yLiBJZiBub3QsIG5lZWQgdG8gZ2V0IGxhdGVzdCBoaWRlIGRhdGEuXG4gICAgICAgIGlmIChkYXRhLnByb3RvY29sKSB7XG4gICAgICAgICAgICBzZWxmLmlzVmFsaWRBbmNob3IoaGxpc3QsIGRhdGEsIGZ1bmN0aW9uICh2YWxpZExpbmssIGVycnMsIG92ZXJsb2FkKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgICAgIChfYSA9IGNPYmplY3QuZXJyb3IpLnB1c2guYXBwbHkoX2EsIGVycnMpO1xuICAgICAgICAgICAgICAgIGlmIChvdmVybG9hZClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKGNPYmplY3QpO1xuICAgICAgICAgICAgICAgIGlmICh2YWxpZExpbmsgIT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBydW4odmFsaWRMaW5rLCBBUEksIGNrLCBobGlzdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldFJlc3VsdCh0eXBlKTtcbiAgICAgICAgICAgIH0sIGNPYmplY3QucGFyYW1ldGVyID09PSB1bmRlZmluZWQgPyB7fSA6IGNPYmplY3QucGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSZXN1bHQodHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9pbmxpbmUgZnVuY3Rpb24gdG8gYXZvaWQgdGhlIHJlcGV0aXRpdmUgY29kZS5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UmVzdWx0KHR5cGUpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coYEdldHRpbmcgcmVzdWx0Li4uYCk7XG4gICAgICAgICAgICBzZWxmLm1lcmdlKGRhdGEubmFtZSwgZGF0YS5wcm90b2NvbCwgZnVuY3Rpb24gKG1lcmdlUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYE1lcmdpbmcuLi5gKTtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuYXV0aCAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgY09iamVjdC5hdXRoID0gbWVyZ2VSZXN1bHQuYXV0aDtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQudHJ1c3QgIT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QudHJ1c3QgPSBtZXJnZVJlc3VsdC50cnVzdDtcbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaGlkZSAhPSBudWxsICYmIG1lcmdlUmVzdWx0LmhpZGUubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuaGlkZSA9IG1lcmdlUmVzdWx0LmhpZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5lcnJvci5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgKF9hID0gY09iamVjdC5lcnJvcikucHVzaC5hcHBseShfYSwgbWVyZ2VSZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSF0gIT09IG51bGwgJiYgY09iamVjdC5pbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LkFVVEhdID0gbWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguQVVUSF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChtZXJnZVJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFXSAhPT0gbnVsbCAmJiBjT2JqZWN0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguSElERV0gPSBtZXJnZVJlc3VsdC5pbmRleFtwcm90b2NvbF8yLnJlbGF0ZWRJbmRleC5ISURFXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1lcmdlUmVzdWx0LmluZGV4W3Byb3RvY29sXzIucmVsYXRlZEluZGV4LlRSVVNUXSAhPT0gbnVsbCAmJiBjT2JqZWN0LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNPYmplY3QuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguVFJVU1RdID0gbWVyZ2VSZXN1bHQuaW5kZXhbcHJvdG9jb2xfMi5yZWxhdGVkSW5kZXguVFJVU1RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIG1lcmdlUmVzdWx0Lm1hcCkge1xuICAgICAgICAgICAgICAgICAgICBjT2JqZWN0LmRhdGFba10gPSBtZXJnZVJlc3VsdC5tYXBba107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVyW3R5cGVdKGNPYmplY3QsIGZ1bmN0aW9uIChyZXNGaXJzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzRmlyc3QuY2FsbCAmJiAhZmVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcHBfbGluayA9ICgwLCBkZWNvZGVyXzEubGlua0NyZWF0b3IpKHJlc0ZpcnN0LmNhbGwsIHJlc0ZpcnN0LnBhcmFtZXRlciA9PT0gdW5kZWZpbmVkID8ge30gOiByZXNGaXJzdC5wYXJhbWV0ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJ1bihhcHBfbGluaywgQVBJLCBmdW5jdGlvbiAocmVzQXBwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuY2hlY2tBdXRob3JpdHkocmVzRmlyc3QsIHJlc0FwcCwgY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgaGxpc3QsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc0ZpcnN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4vL0RlYnVnIHBhcnQgdG8gZ2V0IG1vcmUgZGV0YWlscyBvZiBwcm9jZXNzLlxudmFyIGRlYnVnX3J1biA9IGZ1bmN0aW9uIChsaW5rZXIsIGlucHV0QVBJLCBjaykge1xuICAgIGRlYnVnLnNlYXJjaCA9IFtdO1xuICAgIGRlYnVnLnN0YXJ0ID0gZGVidWcuc3RhbXAoKTtcbiAgICBydW4obGlua2VyLCBpbnB1dEFQSSwgZnVuY3Rpb24gKHJlc1J1bikge1xuICAgICAgICBpZiAoIWRlYnVnLmRpc2FibGUpXG4gICAgICAgICAgICByZXNSdW4uZGVidWcgPSBkZWJ1ZzsgLy9hZGQgZGVidWcgaW5mb3JtYXRpb25cbiAgICAgICAgZGVidWcuZW5kID0gZGVidWcuc3RhbXAoKTtcbiAgICAgICAgY2FjaGUuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuIGNrICYmIGNrKHJlc1J1bik7XG4gICAgfSk7XG59O1xudmFyIGZpbmFsX3J1biA9IChkZWJ1Zy5kaXNhYmxlID8gcnVuIDogZGVidWdfcnVuKTtcbmV4cG9ydHMuZWFzeVJ1biA9IGZpbmFsX3J1bjtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==