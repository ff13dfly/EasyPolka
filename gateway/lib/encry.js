const CryptoJS = require('crypto-js');
//const key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF");  //16bytes salt
//const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');   //16bytes offset

let key=null;
let iv=null;

const self={
    auto:(key)=>{
        const arr=key.split(".");
        self.setKey(arr[0]);
        self.setKey(arr[1]);
        return true;
    },
    setKey:(salt)=>{
        key=CryptoJS.enc.Utf8.parse(salt);
    },
    setIV:(salt)=>{
        iv=CryptoJS.enc.Utf8.parse(salt);
    },
    decrypt:(word)=>{
        let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
    },
    encrypt:(word)=>{
        let srcs = CryptoJS.enc.Utf8.parse(word);
        let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.ciphertext.toString().toUpperCase();
    },
    md5:(str)=>{
        return CryptoJS.MD5(str).toString();
    },
}

module.exports= self;