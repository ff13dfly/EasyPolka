//!important This is the library for Esay Protocol v1.0
//!important All data come from `Anchor Link`
//!important This implement extend `auth` and `hide` by salt way to load data

import { anchorLocation,anchorObject,errorObject,APIObject,easyResult } from "./protocol";
import { rawType,formatType,errorLevel} from "./protocol";
import { keywords,authMap,anchorMap,relatedIndex} from "./protocol";
import { linkDecoder,linkCreator } from "./decoder";
import { checkAuth } from "./auth";
import { checkHide } from "./hide";

const {Loader,Libs} = require("../lib/loader");
//const {anchorJS} =require("../lib/anchor");

let API:APIObject=null;

type authResult={
    'list':authMap|null;
    'anchor':anchorLocation|null;
};

type hideResult={
    'list':number[]|null;
    'anchor':anchorLocation|null;
};
type mergeResult={
    "hide":number[]|null,       //if hide data, merge to here.
    "auth":authMap|null,        //if auth data, merge to here.
    "error":errorObject[],      //collect errors here
    "index":[anchorLocation|null,anchorLocation|null],    //collect anchor locations here
    "map":anchorMap,            //map anchor data here
};

//FIXME define code result here
type codeResult={

};

const self={
    getAnchor:(location:[string,number],ck:(res: anchorObject | errorObject) => void)=>{
        
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const [anchor,block]=location;

        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if(block!==0){
            API.common.target(anchor,block,(data:anchorObject|errorObject)=>{
                self.filterAnchor(data,ck); 
            });
        }else{
            API.common.latest(anchor,(data:anchorObject|errorObject)=>{
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

    decodeData:(cObject:easyResult,ck:Function)=>{
        //console.log(`Decode data anchor`);
        //console.log(cObject);
        cObject.type=rawType.DATA;

        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;
        if(protocol!==null && protocol.call){
            cObject.call=protocol.call;
        }
        
        return ck && ck(cObject);
    },

    decodeApp:(cObject:easyResult,ck:Function)=>{
        //console.log(`Decode app anchor`);

        cObject.type=rawType.APP;
        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;
        cObject.code=data.raw;

        if(protocol!==null && protocol.lib){
            //FIXME code should be defined clearly
            self.getLibs(protocol.lib,(code:any)=>{
                //console.log(code);
                cObject.libs=code;
                return ck && ck(cObject);
            });
        }else{
            return ck && ck(cObject);
        }
    },
    decodeLib:(cObject:easyResult,ck:Function)=>{
        //console.log(`Decode lib anchor`);
        cObject.type=rawType.LIB;

        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;

        //1.check and get libs
        if(protocol!==null && protocol.lib){
            self.getLibs(protocol.lib,(code:any)=>{
                //console.log(code);
                cObject.libs=code;
                return ck && ck(cObject);
            });
        }else{
            return ck && ck(cObject);
        }
    },

    getLibs:(list:anchorLocation[],ck:Function)=>{
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        //console.log(`Ready to get libs: ${JSON.stringify(list)}`);
        const RPC={
            search:API.common.latest,
            target:API.common.target,
        }
        Libs(list,RPC,ck);
    },
    getHistory:(location:[string,number],ck:(list: anchorObject[],errs:errorObject[]) => void)=>{
        const list:anchorObject[]=[];
        const errs:errorObject[]=[];
        if(API===null){
            errs.push({error:"No API to get data.",level:errorLevel.ERROR});
            return ck && ck(list,errs);
        }
        //if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const [anchor,block]=location;
        API.common.history(anchor,(res:anchorObject[]|errorObject)=>{
            const err=<errorObject>res;
            if(err.error){
                errs.push(err);
                return ck && ck(list,errs);
            } 

            const alist=<anchorObject[]>res;
            if(alist.length===0){
                errs.push({error:"Empty history"});
                return ck && ck(list,errs);
            }
            return ck && ck(alist,errs);
        });
    },

    //combine the hide and auth list to result
    merge:(anchor:string,protocol:keywords,cfg:object,ck:Function)=>{
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const result:mergeResult={
            "hide":[], 
            "auth":null,
            "error":[],
            "index":[null,null],
            "map":{},
        };

        const mlist:anchorLocation[]=[];
        checkAuth(anchor,protocol,(resAuth:authResult)=>{
            checkHide(anchor,protocol,(resHide:hideResult)=>{
                if(resAuth.anchor===null && resHide.anchor===null){
                    if(resAuth.list) result.auth=resAuth.list;
                    if(resHide.list) result.hide=resHide.list;
                    return ck && ck(result);
                }else if(resAuth.anchor===null && resHide.anchor!==null){
                    const hide_anchor:[string,number]=typeof resHide.anchor==="string"?[resHide.anchor,0]:[resHide.anchor[0],resHide.anchor[1]];
                    self.getAnchor(hide_anchor,(res:anchorObject|errorObject)=>{
                        const errs:errorObject[]=[];
                        const err=<errorObject>res;
                        if(err.error) errs.push({error:err.error});
                        const data:anchorObject=<anchorObject>res;

                        return self.combineHide(result,data,errs,ck);
                    });
                }else if(resAuth.anchor!==null && resHide.anchor===null){
                    const auth_anchor:[string,number]=typeof resAuth.anchor==="string"?[resAuth.anchor,0]:[resAuth.anchor[0],resAuth.anchor[1]];
                    self.getHistory(auth_anchor,(alist:anchorObject[],errsA:errorObject[])=>{
                        return self.combineAuth(result,alist,errsA,ck);
                    });
                }else if(resAuth.anchor!==null && resHide.anchor!==null){
                    const hide_anchor:[string,number]=typeof resHide.anchor==="string"?[resHide.anchor,0]:[resHide.anchor[0],resHide.anchor[1]];
                    const auth_anchor:[string,number]=typeof resAuth.anchor==="string"?[resAuth.anchor,0]:[resAuth.anchor[0],resAuth.anchor[1]];    
                    self.getAnchor(hide_anchor,(res:anchorObject|errorObject)=>{
                        const errs:errorObject[]=[];
                        const err=<errorObject>res;
                        if(err.error) errs.push({error:err.error});
                        const data:anchorObject=<anchorObject>res;

                        return self.combineHide(result,data,errs,(chResult:mergeResult)=>{
                            self.getHistory(auth_anchor,(alist:anchorObject[],errsA:errorObject[])=>{
                                self.combineAuth(chResult,alist,errsA,ck);
                            });
                        });
                    });
                }
            });
        });
    },

    combineHide:(result:mergeResult,anchor:anchorObject,errs:errorObject[],ck:Function)=>{
        if(errs.length!==0){
            for(let i=0;i<errs.length;i++) result.error.push(errs[i]);
        }
        
        result.map[`${anchor.name}_${anchor.block}`]=anchor;
        result.index[relatedIndex.HIDE]=[anchor.name,anchor.block];

        const dhide=self.decodeHideAnchor(anchor);
        if(!Array.isArray(dhide)){
            result.error.push(dhide);
        }else{
            result.hide=dhide;
        }
        return ck && ck(result);
    },

    combineAuth:(result:mergeResult,list:anchorObject[],errs:errorObject[],ck:Function)=>{
        if(errs.length!==0){
            for(let i=0;i<errs.length;i++) result.error.push(errs[i]);
        }

        for(let i=0;i<list.length;i++){
            const row:anchorObject=list[i];
            result.map[`${row.name}_${row.block}`]=row;
        }
            
        const last:anchorObject=list[0];
        const hlist:number[]=[];            //get latest auth anchor hide list.
        
        self.decodeAuthAnchor(<anchorObject[]>list,hlist,(map:authMap,amap:anchorMap,errs:errorObject[])=>{
            for(let k in amap) result.map[k]=amap[k];  //if hide anchor data, merge to result
            for(let i=0;i<errs.length;i++) result.error.push(errs[i]);

            result.index[relatedIndex.AUTH]=[last.name,0];
            result.auth=<authMap>map;
            return ck && ck(result);
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
    decodeAuthAnchor:(list:anchorObject[],hlist:number[],ck:(res: authMap,amap:anchorMap,errs:errorObject[])=>void)=>{
        const map:authMap={};
        const amap:anchorMap={};
        const errs:errorObject[]=[];

        //FIXME, if the latest auth anchor is hidden,need to check next one.
        const last:anchorObject=list[0];

        if(last.protocol===null){
            errs.push({error:"Not valid anchor"});
            return ck && ck(map,amap,errs);
        }

        const protocol=<keywords>last.protocol;
        self.authHideList(protocol,(hlist:number[],resMap:anchorMap,herrs:errorObject[])=>{
            errs.push(...herrs);
            for(let k in resMap){
                amap[k]=resMap[k]
            }
            
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
                    errs.push(<errorObject>{error:error});
                }
            }
            return ck && ck(map,amap,errs);
        });
    },

    //check auth anchor's hide list
    authHideList:(protocol:keywords,ck:(res: number[],map:anchorMap,error:errorObject[])=>void)=>{
        const map:anchorMap={};
        const errs:errorObject[]=[];
        const list:number[]=[];
        if(!protocol.hide) return ck && ck(list,map,errs);

        if(Array.isArray(protocol.hide)) return ck && ck(<number[]>protocol.hide,map,errs);
        
        self.getAnchor([<string>protocol.hide,0],(anchorH:anchorObject|errorObject)=>{
            const err=<errorObject>anchorH;
            if(err.error){
                errs.push(err);
                return ck && ck(list,map,errs);
            }
            const hlist=self.decodeHideAnchor(<anchorObject>anchorH);
            const errH=<errorObject>hlist;
            if(errH.error)errs.push(errH);

            const anchor=<anchorObject>anchorH;
            //console.log(anchor);
            map[`${anchor.name}_${anchor.block}`]=<anchorObject>anchor;
            return ck && ck(<number[]>hlist,map,errs);
        });
    },

    //check wether current anchor is in the hide list
    isValidAnchor:(hide:anchorLocation|number[],data:anchorObject,ck:Function,params:Object)=>{
        //console.log(params);
        const errs:errorObject[]=[];
        const cur=data.block;
        let overload:boolean=false;
        if(Array.isArray(hide)){
            const hlist=hide;
            for(let i=0;i<hlist.length;i++){
                if(cur===hlist[i]){
                    if(data.pre===0){
                        errs.push({error:`Out of ${data.name} limited`});
                        overload=true;
                        return ck && ck(null,errs,overload);
                    }

                    const new_link=linkCreator([data.name,data.pre],params);
                    return ck && ck(new_link,errs,overload);
                }
            }
            return ck && ck(null,errs);
        }else{
            const h_location:[string,number]=[<string>hide,0];
            self.getAnchor(h_location,(hdata:anchorObject|errorObject)=>{
                const res:number[]|errorObject=self.decodeHideAnchor(<anchorObject>hdata); 
                const err=<errorObject>res;
                if(err.error) errs.push(err);

                const hlist=<number[]>res;
                
                for(let i=0;i<hlist.length;i++){
                    if(cur===hlist[i]){
                        if(data.pre===0){
                            errs.push({error:`Out of ${data.name} limited`});
                            overload=true;
                            return ck && ck(null,errs,overload);
                        }

                        const new_link=linkCreator([data.name,data.pre],params);
                        return ck && ck(new_link,errs,overload);
                    }
                }
                return ck && ck(null,errs,overload);
            });
        }
    },

    //check the authority between anchors
    checkAuthority:(caller:easyResult,app:easyResult,ck:Function)=>{
        //x.1.check the called anchor type.
        if(app.type!==rawType.APP){
            caller.error.push({error:`Answer is not cApp.`});
            return ck && ck(caller);
        }
            
        //x.2.check the authority
        const from=caller.data[`${caller.location[0]}_${caller.location[1]}`];
        const signer=from.signer;
        const auths=app.auth;
        if(auths===undefined){
            caller.app=app;
            return ck && ck(caller);
        }else{
            if(self.empty(auths)){
                caller.app=app;
                return ck && ck(caller);
            }else{
                if(auths[signer]===undefined){
                    caller.error.push({error:`No authority of caller.`});
                    return ck && ck(caller);
                }else{
                    if(auths[signer]===0){
                        caller.app=app;
                        return ck && ck(caller);
                    }else{
                         API?.common.block((block:number,hash:string)=>{
                            console.log(block);
                            if(block>auths[signer]){
                                caller.error.push({error:`Authority out of time.`});
                                return ck && ck(caller);
                            }else{
                                caller.app=app;
                                return ck && ck(caller);
                            }
                        });
                    }
                }
            }
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
    empty:(obj:any):boolean=>{
        for(let k in obj){
            return false;
        }
        return true;
    },
}

//Deocode map definition.
type decoderMap = {
    [index: string]: Function;
};
const decoder:decoderMap={};
//console.log(rawType);
decoder[rawType.APP]=self.decodeApp;
decoder[rawType.DATA]=self.decodeData;
decoder[rawType.LIB]=self.decodeLib;

//Exposed method `run` as `easyRun`
// @param   fence     boolean   //if true, treat the run result as cApp.
const run=(linker:string,inputAPI:APIObject,ck:(res:easyResult) => void,fence?:boolean)=>{
    if(API===null && inputAPI!==null) API=inputAPI;

    const target=linkDecoder(linker);
    if(target.error) return ck && ck(target);
    let cObject:easyResult={
        type:rawType.NONE,
        location:[target.location[0],target.location[1]!==0?target.location[1]:0],
        error:[],
        data:{},
        index:[<anchorLocation|null>null,<anchorLocation|null>null],
    }
    if(target.param) cObject.parameter=target.param;
    //console.log(target);

    self.getAnchor(target.location,(resAnchor:anchorObject|errorObject)=>{
        const err=<errorObject>resAnchor;
        //1.return error if anchor is not support Easy Protocol
        if(err.error){
            cObject.error.push(err);
            return ck && ck(cObject);
        }

        const data=<anchorObject>resAnchor;
        if(cObject.location[1]===0)cObject.location[1]=data.block;
        cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=data;

        //2.check protocol
        if(data.protocol===null){
            cObject.error.push({error:"No valid protocol"});
            return ck && ck(cObject);
        }

        const type:string=!data.protocol.type?"":data.protocol.type;
        if(!decoder[type]){
            cObject.error.push({error:"Not easy protocol type"});
            return ck && ck(cObject);
        }

        //1. data combined, check hide status.
        if(data.protocol && data.protocol.hide!==undefined){
            self.isValidAnchor(data.protocol.hide,data,(validLink:string|null,errs:errorObject[],overload?:boolean)=>{
                cObject.error.push(...errs);
                if(overload) return ck && ck(cObject);
                if(validLink!==null) return run(validLink,API,ck);
                return getResult(type);
            },cObject.parameter===undefined?{}:cObject.parameter);
        }else{
            return getResult(type);
        }
        
        //closure function to avoid the same code.
        function getResult(type:string){
            self.merge(data.name,<keywords>data.protocol,{},(mergeResult:mergeResult)=>{
                if(mergeResult.auth!==null) cObject.auth=mergeResult.auth;
                if(mergeResult.hide!=null && mergeResult.hide.length!==0){
                    cObject.hide=mergeResult.hide;
                } 
                if(mergeResult.error.length!==0){
                    cObject.error.push(...mergeResult.error);
                }
                
                if(mergeResult.index[relatedIndex.AUTH]!==null && cObject.index){
                    cObject.index[relatedIndex.AUTH]=mergeResult.index[relatedIndex.AUTH];
                }
    
                if(mergeResult.index[relatedIndex.HIDE]!==null && cObject.index){
                    cObject.index[relatedIndex.HIDE]=mergeResult.index[relatedIndex.HIDE];
                }
    
                for(let k in mergeResult.map){
                    cObject.data[k]= mergeResult.map[k];
                }
    
                return decoder[type](cObject,(resFirst:easyResult)=>{
                    if(resFirst.call && !fence){
                        const app_link=linkCreator(resFirst.call,resFirst.parameter===undefined?{}:resFirst.parameter);
                        run(app_link,API,(resApp:easyResult)=>{
                            return self.checkAuthority(resFirst,resApp,ck);
                        },true);
                    }else{
                        return ck && ck(resFirst);
                    }
                });
            });
        }
    });
};
export {run as easyRun};