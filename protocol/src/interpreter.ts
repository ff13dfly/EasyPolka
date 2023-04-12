//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`

import { anchorObject,errorObject,APIObject,errorLevel,rawType,cAppResult} from "./protocol";
import { linkDecoder } from "./decoder";
import { checkAuth } from "./auth";
import { checkHide } from "./hide";

import { Loader,Libs } from "../lib/loader"
import { anchorJS } from "../lib/anchor";

let API:APIObject=null;

const self={
    getAnchor:(location:[string,number],ck:(res: anchorObject | errorObject) => void)=>{
        
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const [anchor,block]=location;

        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if(block!==0){
            API.common.target(anchor,block,(data:any)=>{
                self.filterAnchor(data,ck); 
            });
        }else{
            API.common.latest(anchor,(data:any)=>{
                self.filterAnchor(data,ck);
            });
        }
    },

    filterAnchor:(data:anchorObject,ck:Function)=>{
        if(!data) return ck && ck({error:"No such anchor.",level:errorLevel.ERROR});
        if(data.error) return ck && ck({error:data.error,level:errorLevel.ERROR});
        if(data.empty) return ck && ck({error:"Empty anchor.",level:errorLevel.ERROR});
        if(!data.protocol) return ck && ck({error:"No-protocol anchor."});

        const protocol:any=data.protocol;
        if(!protocol.type) return ck && ck({error:"Not EasyProtocol anchor."});

        return ck && ck(data);
    },

    

    decodeData:(cObject:cAppResult,ck:Function)=>{
        console.log(`Decode data anchor`);
        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;

        if(protocol.call){
            const app_answer=Array.isArray(protocol.call)?protocol.call:[protocol.call,0];
            self.getAnchor(app_answer,(answer:any)=>{
                if(answer.error){
                    cObject.error.push({error:"Failed to load answer anchor"});
                    return ck && ck(cObject);
                }
                cObject.from=cObject.location;
                cObject.location=[app_answer[0],answer.block];

                if(protocol.args){
            
                }
            });
        }
    },

    decodeApp:(cObject:cAppResult,ck:Function)=>{
        console.log(`Decode app anchor`);
        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;

        //1.try to decode and get application
        try {
            cObject.app = new Function("container","API","args","from","error",data.raw);
        } catch (error) {
            cObject.error.push({error:"Failed to get function"});
        }

        //2.check and get libs
        if(protocol.lib){

        }
        
        return ck && ck(cObject);
    },
    decodeLib:(cObject:cAppResult,ck:Function)=>{
        console.log(`Decode lib anchor`);

        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;

        //1.check and get libs
        if(protocol.lib){

        }
    },

    getLibs:(list:[string],ck:Function)=>{
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        console.log(`Ready to get libs: ${JSON.stringify(list)}`);
        const RPC={
            search:API.common.latest,
            target:API.common.target,
        }

        Libs(list,API,ck);
    },

    more:()=>{

    },

    // check running enviment (window or node.js)
    env:()=>{

    },
    getParams:(args:string)=>{
        let map:any={};
        const arr=args.split("&");
        for(let i=0;i<arr.length;i++){
            const row=arr[i];
            const kv=row.split("=");
            if(kv.length!==2) return {error:"error parameter"}
            map[kv[0]]=kv[1];
        }
        return map;
    },
}

type decoderMap = {
    [index: string]: Function;
};
const decoder:decoderMap={}
decoder[rawType.APP]=self.decodeApp;
decoder[rawType.DATA]=self.decodeData;
decoder[rawType.LIB]=self.decodeLib;

const run=(linker:string,inputAPI:APIObject,ck:Function)=>{
    if(API===null && inputAPI!==null) API=inputAPI;
    const target=linkDecoder(linker);
    if(target.error) return ck && ck(target);

    let cObject:cAppResult={
        location:[target.location[0],target.location[1]!==0?target.location[1]:0],
        error:[],
        data:{},
    }
    if(target.param) cObject.parameter=target.param;

    self.getAnchor(target.location,(data:any)=>{

        //1.return error if anchor is not support Easy Protocol
        if(data.error) return ck && ck(data);

        if(cObject.location[1]===0)cObject.location[1]=data.block;
        cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=data;

        const type:string=data.protocol.type;
        if(!decoder[type]) return ck && ck(data);

        checkAuth(data.name,data.protocol,{},(authObject:object|null)=>{

            //if(authObject!==null) cObject.hide=authObject;
            checkHide(data.name,data.protocol,{},(hideObject:object|null)=>{

                return decoder[type](cObject,ck);
            });
        });
    });
};
export {run as easyRun};