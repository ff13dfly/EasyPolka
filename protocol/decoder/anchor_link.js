//!important, Anchor Link decoder follow the rule that decode from right 
//!important, reversed keywords: [ ` ` ]

//Full Anchor Link
//anchor://anchor_name.anchor/3345?tpl=dark&title=today@wss://dev.metanchor.net
//anchor://anchor_name.anchor/3345~3499|key_name?tpl=dark&title=today@ws://dev.metanchor.net
//anchor://anchor_name.anchor/3345~3499|key_name?tpl=dark&title=today@dev.metanchor.net
//anchor://abc/abc.anchor/3345~3499|key_name?tpl=dark&title=today@wss://dev.metanchor.net
//anchor://abc.abc.anchor/3345~3499|key_name?tpl=dark&title=today@wss://dev.metanchor.net
//anchor://abc/123/3345~3499|key_name?tpl=dark&title=today@wss://dev.metanchor.net

/**
\0 ：null（\u0000）
\b ：后退键（\u0008）
\f ：换页符（\u000C）
\n ：换行符（\u000A）
\r ：回车键（\u000D）
\t ：制表符（\u0009）
\v ：垂直制表符（\u000B）
\' ：单引号（\u0027）
\" ：双引号（\u0022）
\\ ：反斜杠（\u005C）
**/

const sepetor={
    "protocol":"anchor://",
    "common":"/",
    "server":"@",
    "param":"?",  
    "key":"|",      
    "range":"~",
    "network":".",      // . or @, need to test and check
    "and":"&",          // for input params
}
const special=[`\0`,`\b`,`\f`,`\n`,`\r`,`\t`,`\v`,`\'`,`\"`,`\\`,` `,`\-`];

const result={
    valid:false,            //wether valid anchor link
    anchor:"",              //anchor name
    block:0,                //anchor block, 0 for the latest
    network:"anchor",       //which network, default Anchor Network
    server:"",              //node server to link
    range:[0,0],            //get the range data
    key:"",                 //get the anchor key data
    params:{},              //input parameters
    message:"",             //error message
}

//const test=encodeURIComponent(`anchor://你好/333`);
//const test=encodeURIComponent(special.join("-"));
//console.log(test);

const self={
    format:()=>{
        return result;
    },
    encode:(result)=>{

    },
    decoder:(str)=>{
        const deResult=Object.assign({}, result);

        //1.check prefix
        let body=self.checkPrefix(str);
        if(body===false){
            deResult.message="Wrong prefix.";
            return deResult
        }
        deResult.valid=true;

        //2.check network
        const chk_network=self.checkNetwork(body);
        deResult.server=chk_network.node;
        body=chk_network.left;

        //3.check parameters
        const chk_param=self.checkParameter(body);
        if(chk_param.param!==null) deResult.params=chk_param.param;
        body=chk_param.left;

        //4.check JSON key
        const chk_key=self.checkKey(body);
        if(chk_key.key!=="") deResult.key=chk_key.key;
        body=chk_key.left;

        console.log('\x1b[36m%s\x1b[0m',body);
    
        //console.log(chk_network);
        return deResult
    },

    checkPrefix:(str)=>{
        if(str.length<=sepetor.protocol.length) return false;
        const pre=str.substring(0,sepetor.protocol.length);
        if(pre===sepetor.protocol) return str.substring(sepetor.protocol.length,str.length);
        return false;
    },

    checkNetwork:(body)=>{
        const res={node:"",left:""};

        //1. get the server string
        const arr=body.split(sepetor.server);
        if(arr.length<2){
            res.left=body;
        }else{
            if(!arr[arr.length-1]){
                res.left=arr.join(sepetor.server);
            }else{
                res.node=arr.pop();
                res.left=arr.join(sepetor.server);
            }
        }

        //2. check the node server validity
        if(res.node){

        }
        return res;
    },

    checkParameter:(body)=>{
        const res={param:null,left:""};
        const arr=body.split(sepetor.param);
        if(arr.length===1){
            res.left=body;
            return res;
        }
        const params=self.getParameters(arr[arr.length-1]);
        if(params===false){
            res.left=body;
            return res;
        }
        
        res.param=params;
        arr.pop();
        res.left=arr.join(sepetor.param);

        return res;
    },

    getParameters:(str)=>{
        const arr=str.split(sepetor.and);
        for(let i=0;i<arr.length;i++){
            if(!arr[i]) return false;
        }

        const map={};
        for(let i=0;i<arr.length;i++){
            const tmp=arr[i].split("=");
            if(tmp.length!==2) return false;
            map[tmp[0]]=tmp[1];
        }

        return map;
    },

    checkKey:(body)=>{
        const res={key:"",left:""};
        const arr=body.split(sepetor.key);
        if(arr.length===1 || !arr[arr.length-1]){
            res.left=body;
            return res;
        }

        res.key=arr.pop();
        res.left=arr.join(sepetor.key);
        return res;
    },

    checkRange:(body)=>{

    },

    checkBlock:(body)=>{

    },
  }
  
  exports.decoder=self.decoder;
  exports.format=self.format;
  exports.encoder=self.encoder;