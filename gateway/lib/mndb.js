//!important, This is a memory DB

//../node_modules/.bin/esbuild mndb.js --bundle --minify --outfile=mndb.min.js --global-name=MNDB --platform=node

const cache={};         //key cache 
const hash={};          //hash cache
const queue={};         //list cache

let timer=null;
const remove={
    cache:{},
    hash:{},
    queue:{},
}

const max={
    "key":256,      //max 256 Bytes
    "val":4096,     //max 4096 Bytes
};

const self={
    remover:()=>{
        if(timer!==null) return false;
        timer=setInterval(()=>{
            const ms=new Date().getTime();
            console.log(`Remove timer : ${ms}`);
            const stamp=parseInt(ms*0.001);
            for(var type in remove){
                if(remove[type][stamp]){
                    const list=remove[type][stamp];
                    switch (type) {
                        case 'cache':
                            for(let i=0;i<list.length;i++){
                                const dkey=list[i];
                                delete cache[dkey];
                            }
                            break;
                        case 'hash':
                            for(let i=0;i<list.length;i++){
                                const dkey=list[i];
                                delete hash[dkey];
                            }
                            break;
                        case 'queue':
                            for(let i=0;i<list.length;i++){
                                const dkey=list[i];
                                delete queue[dkey];
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        },900);
    },
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