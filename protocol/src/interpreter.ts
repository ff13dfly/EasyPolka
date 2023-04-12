//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`

import { anchorObject,errorObject,APIObject,errorLevel,rawType} from "./protocol";
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

    decodeData:(obj:any,ck:Function)=>{
        console.log(`Decode data anchor`);
    },
    decodeApp:(obj:any,ck:Function)=>{
        console.log(`Decode app anchor`);
    },
    decodeLib:(obj:any,ck:Function)=>{
        console.log(`Decode lib anchor`);
    },

    getLibs:(list:[string],ck:Function)=>{
        console.log(`Ready to get libs: ${JSON.stringify(list)}`);
        const API={
            search:anchorJS.search,
            target:anchorJS.target,
        }
        //Loader(list,API,ck);
        Libs(list,API,ck);
    },

    more:()=>{

    },

    // check the authority of anchor if launch from data
    authorize:()=>{

    },

    hide:()=>{

    },

    // check running enviment (window or node.js)
    env:()=>{

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

    let cObject:any={
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

    // self.getAnchor(target.location,(res:any)=>{
    //     if(res.error) return ck && ck(res);

    //     if(cObject.location[1]===0)cObject.location[1]=res.block;
    //     cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=res;

    //     checkAuth(res.name,res.protocol,{},(alist:object|null)=>{
    //         console.log(alist);

            
    //     });

    //     // checkAuth(target.location[0],'ab',{},()=>{

    //     // });
    //     // checkHide(target.location[0],'cc',{},()=>{

    //     // });

    //     // self.getLibs(["js_a"],(map:any,order:[])=>{
    //     //     console.log(map);
    //     //     console.log(order);
    //     // });
        

    //     // 1.check anchor data
    //     switch (res.protocol.type) {
    //         case "app":
    //             console.log(`App type anchor`);
    //             try {
    //                 cObject.app = new Function("container","API","args","from","error",res.raw);
    //             } catch (error) {
    //                 cObject.error.push({error:"Failed to get function"});
    //             }

    //             if(res.protocol.lib){
    //                 self.getLibs(res.protocol.lib,(map:any,order:[])=>{
    //                     //console.log(map);
    //                     //console.log(order);
    //                     ck && ck(cObject);
    //                 })
    //             }else{
    //                 ck && ck(cObject);
    //             }
    //             break;

    //         case "data":
    //             console.log(`Data type anchor`);
    //             if(res.protocol.call){
    //                 const app_answer=Array.isArray(res.protocol.call)?res.protocol.call:[res.protocol.call,0];
    //                 return self.getAnchor(app_answer,(answer:any)=>{
    //                     if(answer.error || answer.empty){
    //                         cObject.error.push({error:"Failed to load answer anchor"});
    //                         return ck && ck(cObject);
    //                     }

    //                     if(!answer.protocol || !answer.protocol.type){
    //                         cObject.error.push({error:"Called Not-EasyProtocol anchor."});
    //                         return ck && ck(cObject);
    //                     }
                        
    //                     cObject.from=cObject.location;
    //                     cObject.location=[app_answer[0],answer.block];

    //                     cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=answer;
    //                     try {
    //                         cObject.app = new Function("container","API","args","from","error",answer.raw);
    //                     } catch (error) {
    //                         cObject.error.push({error:"Failed to get function"});
    //                     }

    //                     if(res.protocol.args){
    //                         const args=self.getParams(res.protocol.args);
    //                         if(!args.error) cObject.parameter=args;
    //                         else cObject.error.push(args);

    //                     }

    //                     ck && ck(cObject);
    //                 });
    //             }
    //             ck && ck(cObject);
                
    //             break;

    //         case "lib":
    //             console.log(`Lib type anchor`);
    //             break;

    //         default:
    //             console.log(`Unexcept type anchor`);
    //             ck && ck(cObject);
    //             break;
    //     }
    // });
};
export {run as easyRun};