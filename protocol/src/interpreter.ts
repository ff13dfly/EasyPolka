//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`

import { anchorLocation,anchorObject,errorObject,APIObject,errorLevel,rawType,cAppResult, formatType} from "./protocol";
import { keywords,dataProtocol,authMap,anchorMap,relatedIndex} from "./protocol";
import { linkDecoder } from "./decoder";
import { checkAuth } from "./auth";
import { checkHide } from "./hide";


const {Loader,Libs} = require("../lib/loader");

let API:APIObject=null;

type resAuthult={
    'list':authMap|null;
    'anchor':anchorLocation|null;
};

type hideResult={
    'list':number[]|null;
    'anchor':anchorLocation|null;
};

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

    filterAnchor:(data:anchorObject|errorObject,ck:Function)=>{
        if(!data) return ck && ck({error:"No such anchor.",level:errorLevel.ERROR});
        const err=<errorObject>data;
        if(err.error) return ck && ck({error:err.error,level:errorLevel.ERROR});

        const anchor=<anchorObject>data;
        if(anchor.empty) return ck && ck({error:"Empty anchor.",level:errorLevel.ERROR});
        if(!anchor.protocol) return ck && ck({error:"No-protocol anchor."});

        const protocol:keywords=anchor.protocol;
        if(!protocol.type) return ck && ck({error:"Not EasyProtocol anchor."});

        return ck && ck(anchor);
    },

    

    decodeData:(cObject:cAppResult,ck:Function)=>{
        console.log(`Decode data anchor`);
        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;

        if(protocol!==null && protocol.call){
            const app_answer:[string,number]=[
                Array.isArray(protocol.call)?protocol.call[0]:protocol.call,
                Array.isArray(protocol.call)?protocol.call[1]:0
            ];
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
        }else{
            return ck && ck(cObject);
        }
    },

    decodeApp:(cObject:cAppResult,ck:Function)=>{
        console.log(`Decode app anchor`);
        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;

        //1.try to decode and get application
        try {
            cObject.app = new Function("container","API","args","from","error",data.raw===null?"":data.raw);
        } catch (error) {
            cObject.error.push({error:"Failed to get function"});
        }

        //2.check and get libs
        if(protocol!==null && protocol.lib){

        }
        
        return ck && ck(cObject);
    },
    decodeLib:(cObject:cAppResult,ck:Function)=>{
        console.log(`Decode lib anchor`);

        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;

        //1.check and get libs
        if(protocol!==null && protocol.lib){

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
    getHistory:(location:[string,number],ck:(res: anchorObject[] | errorObject) => void)=>{
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const [anchor,block]=location;
        API.common.history(anchor,(res:anchorObject[]|errorObject)=>{
            const err=<errorObject>res;
            if(err.error) return ck && ck({error:err.error});

            const list=<anchorObject[]>res;
            if(list.length===0) return ck && ck({error:"Empty history"});

            return ck && ck(list);
        });
    },

    //combine the hide and auth list to result
    merge:(anchor:string,protocol:keywords,cfg:object,ck:Function)=>{
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const result={
            "hide":<number[]|null>[],       //if hide data, merge to here.
            "auth":<authMap|null>null,       //if auth data, merge to here.
            "error":<errorObject[]>[],      //collect errors here
            "index":[<anchorLocation|null>null,<anchorLocation|null>null],    //collect anchor locations here
            "map":<anchorMap>{},            //map anchor data here
        };

        const mlist:anchorLocation[]=[];
        checkAuth(anchor,protocol,(resAuth:resAuthult)=>{
            checkHide(anchor,protocol,(resHide:hideResult)=>{
                console.log(`Merge result:`);
                console.log(resHide);
                console.log(resAuth);
                if(resAuth.anchor===null && resHide.anchor===null){
                    if(resAuth.list) result.auth=resAuth.list;
                    if(resHide.list) result.hide=resHide.list;
                    return ck && ck(result);
                }else if(resAuth.anchor===null && resHide.anchor!==null){
                    const hide_anchor:[string,number]=typeof resHide.anchor==="string"?[resHide.anchor,0]:[resHide.anchor[0],resHide.anchor[1]];
                    self.getAnchor(hide_anchor,(res:anchorObject|errorObject)=>{
                        const err=<errorObject>res;
                        if(err.error){
                            result.error.push({error:err.error});
                            return ck && ck(result);
                        }else{
                            const data=<anchorObject>res;
                            result.map[`${hide_anchor[relatedIndex.NAME]}_${data.block}`]=data;
                            result.index[relatedIndex.HIDE]=[hide_anchor[relatedIndex.NAME],data.block];

                            const dhide=self.decodeHideAnchor(data);
                            if(!Array.isArray(dhide)){
                                result.error.push(dhide);
                            }else{
                                result.hide=dhide;
                            }
                            return ck && ck(result);
                        }
                    });
                }else if(resAuth.anchor!==null && resHide.anchor===null){
                    const auth_anchor:[string,number]=typeof resAuth.anchor==="string"?[resAuth.anchor,0]:[resAuth.anchor[0],resAuth.anchor[1]];
                    self.getHistory(auth_anchor,(res:anchorObject[]|errorObject)=>{
                        const err=<errorObject>res;
                        if(err.error){
                            result.error.push(err);
                            return ck && ck(result);
                        }else{
                            const alist=<anchorObject[]>res;
                            const last:anchorObject=alist[0];
                            self.decodeAuthAnchor(<anchorObject[]>alist,(map:authMap|errorObject)=>{
                                const errA=<errorObject>map;
                                if(err.error){
                                    result.error.push(errA);
                                    return ck && ck(result);
                                }else{
                                    result.index[relatedIndex.AUTH]=[last.name,last.block];
                                    result.auth=<authMap>map;
                                    return ck && ck(result);
                                }
                            });
                        }
                        //return ck && ck(result);
                    });
                }else if(resAuth.anchor!==null && resHide.anchor!==null){
                    const hide_anchor:[string,number]=typeof resHide.anchor==="string"?[resHide.anchor,0]:[resHide.anchor[0],resHide.anchor[1]];
                    const auth_anchor:[string,number]=typeof resAuth.anchor==="string"?[resAuth.anchor,0]:[resAuth.anchor[0],resAuth.anchor[1]];    
                    self.getAnchor(hide_anchor,(res:anchorObject|errorObject)=>{
                        const err=<errorObject>res;
                        if(err.error){
                            result.error.push({error:err.error});
                        }else{
                            const data=<anchorObject>res;
                            result.map[`${hide_anchor[relatedIndex.NAME]}_${data.block}`]=data;
                            result.index[relatedIndex.HIDE]=[hide_anchor[relatedIndex.NAME],data.block];

                            const dhide=self.decodeHideAnchor(data);
                            if(!Array.isArray(dhide)){
                                result.error.push(dhide);
                            }else{
                                result.hide=dhide;
                            }
                        }
                        
                        self.getHistory(auth_anchor,(res:anchorObject[]|errorObject)=>{
                            const err=<errorObject>res;
                            if(err.error){
                                result.error.push(err);
                                return ck && ck(result);
                            }else{
                                const alist=<anchorObject[]>res;
                                const last:anchorObject=alist[0];
                                self.decodeAuthAnchor(<anchorObject[]>alist,(map:authMap|errorObject)=>{
                                    const errA=<errorObject>map;
                                    if(err.error){
                                        result.error.push(errA);
                                        return ck && ck(result);
                                    }else{
                                        result.index[relatedIndex.AUTH]=[last.name,last.block];
                                        result.auth=<authMap>map;
                                        return ck && ck(result);
                                    }
                                });
                            }
                        });
                    });
                }
            });
        });
    },

    decodeHideAnchor:(obj:anchorObject):number[]|errorObject=>{
        const list:number[]=[];
        const protocol=obj.protocol;

        if(protocol?.fmt==='json'){
            try {
                const raw=JSON.parse(<string>obj.raw);
                if(Array.isArray(raw)){
                    for(let i=0;i<raw.length;i++){
                        const n=parseInt(raw[i]);
                        if(!isNaN(n)) list.push(n);
                    }
                }
            } catch (error) {
                return {error:'failed to parse JSON'};
            }
        }
        return list;
    },

    //!important, by using the history of anchor, `hide` keyword is still support
    //!important, checking the latest anchor data, using the `hide` feild to get data.
    decodeAuthAnchor:(list:anchorObject[],ck:(res: authMap|errorObject)=>void)=>{
        const map:authMap={};
        const last:anchorObject=list[0];
        if(last.protocol===null) return ck && ck({error:"Not valid anchor"});

        const protocol=<keywords>last.protocol;
        self.authHideList(protocol,(hlist:number[])=>{
            console.log({hlist});
            let hmap:any={};
            for(let i=0;i<hlist.length;i++){
                hmap[hlist[i].toString()]=true;
            }

            for(let i=0;i<list.length;i++){
                const row:anchorObject=list[i];
                if(hmap[row.block.toString()]) continue;
                if(!row.protocol || row.protocol.fmt!==formatType.JSON || row.raw===null) continue;

                try {
                    const tmap=JSON.parse(row.raw);
                    for(let k in tmap) map[k]=tmap[k];
                } catch (error) {
                    console.log(error);
                }
            }
            return ck && ck(map);
        });
    },

    authHideList:(protocol:keywords,ck:(res: number[])=>void)=>{
        if(protocol?.hide){
            if(Array.isArray(protocol.hide)){
                return ck && ck(<number[]>protocol.hide);
            }else{
                self.getAnchor([<string>protocol.hide,0],(anchorH:anchorObject|errorObject)=>{
                    const hlist=self.decodeHideAnchor(<anchorObject>anchorH);
                    const errH=<errorObject>hlist;
                    if(errH.error){
                        return ck && ck([]);
                    }else{
                        return ck && ck(<number[]>hlist);
                    }
                });
            }
        }else{
            return ck && ck([]);
        }
    },

    //get params from string such as `key_a=val&key_b=val&key_c=val`
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

// type dataMap={
//     [index: string]: anchorObject;
// }

const run=(linker:string,inputAPI:APIObject,ck:Function)=>{
    if(API===null && inputAPI!==null) API=inputAPI;
    const target=linkDecoder(linker);
    if(target.error) return ck && ck(target);
    let cObject:cAppResult={
        location:[target.location[0],target.location[1]!==0?target.location[1]:0],
        error:[],
        data:{},
        index:[<anchorLocation|null>null,<anchorLocation|null>null],
    }
    if(target.param) cObject.parameter=target.param;

    self.getAnchor(target.location,(data:any)=>{

        //1.return error if anchor is not support Easy Protocol
        if(data.error) return ck && ck(data);

        if(cObject.location[1]===0)cObject.location[1]=data.block;
        cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=data;

        const type:string=data.protocol.type;
        if(!decoder[type]) return ck && ck(data);

        self.merge(data.name,data.protocol,{},(mergeResult:any)=>{
            console.log(mergeResult);

            if(mergeResult.auth!==null) cObject.auth=mergeResult.auth;
            if(mergeResult.hide.length!==0) cObject.hide=mergeResult.hide;
            if(mergeResult.error.length!==0){

            }
            for(let k in mergeResult.map){
                cObject.data[k]= mergeResult.map[k];
            }
            if(mergeResult.index[relatedIndex.AUTH]!==null && cObject.index){
                cObject.index[relatedIndex.AUTH]=mergeResult.index[relatedIndex.AUTH];
            }

            if(mergeResult.index[relatedIndex.HIDE]!==null && cObject.index){
                cObject.index[relatedIndex.HIDE]=mergeResult.index[relatedIndex.HIDE];
            }

            return decoder[type](cObject,ck);
        });
    });
};
export {run as easyRun};