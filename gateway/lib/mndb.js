//!important, This is a memory DB

//../node_modules/.bin/esbuild mndb.js --bundle --minify --outfile=mndb.min.js --global-name=MNDB --platform=node

const cache={};       //key cache 
const hash={};      //hash cache
const queue={};     //list cache

const max={
    "key":256,      //max 256 Bytes
    "val":4096,     //max 4096 Bytes
};

const self={
    /******************key part******************/
    key_get:(key,ttl)=>{
        const type=typeof(key);
        if(type!=='string' && type!=='number') return false;
        if(type==='number') key=''+key;
        if(key.length>max.key) return false;
        if(!cache[key]) return null;
        return cache[key];
    },
    key_set:(key,val,ttl)=>{
        if(typeof(key)!=='string') return false;
        if(key.length>max.key) return false;
        if(JSON.stringify(val).length>max.val) return false;
        cache[key]=val;
        return true;
    },
    key_ttl:(key,ttl)=>{

    },
    /******************hash part******************/
    hash_get:(main,key)=>{

    },
    hash_set:(main,key,val)=>{

    },
    hash_ttl:(main,ttl)=>{

    },
    hash_count:(main)=>{

    },

    /******************list part******************/
    list_init:(key,list)=>{

    },
    list_get:(key)=>{

    },
    list_push:(key,val)=>{

    },
    list_pop:(key)=>{

    },
    list_lpush:(key,val)=>{

    },
    list_shift:(key)=>{

    },
    list_ttl:(key,ttl)=>{

    },
};

module.exports=self;