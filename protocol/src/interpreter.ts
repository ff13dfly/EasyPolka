//!important This is the library for Esay Protocol v1.0
//!important All data come from `Anchor Link`
//!important This implement extend `auth` and `hide` by salt way to load data

import { anchorLocation,anchorObject,errorObject,APIObject,easyResult } from "./protocol";
import { rawType,errorLevel} from "./protocol";
import { keywords,authAddress,authTrust,anchorMap,relatedIndex} from "./protocol";
import { linkDecoder,linkCreator } from "./decoder";
import { checkAuth,checkTrust } from "./auth";
import { checkHide } from "./hide";

const {Group,Loader} = require("../../anchorJS/publish/loader");

let API:APIObject=null;

type authResult={
    'list':authAddress|null;
    'anchor':anchorLocation|null;
};

type trustResult={
    'list':authTrust|null;
    'anchor':anchorLocation|null;
};

type hideResult={
    'list':number[]|null;
    'anchor':anchorLocation|null;
};
type mergeResult={
    "hide":number[]|null,       //if hide data, merge to here.
    "auth":authAddress|null,    //if auth data, merge to here.
    "trust":authTrust|null,
    "error":errorObject[],      //collect errors here
    "index":[anchorLocation|null,anchorLocation|null,anchorLocation|null],    //collect anchor locations here
    "map":anchorMap,            //map anchor data here
};

//FIXME define code result here
type codeResult={

};

/*************************debug part****************************/
//debug data to improve the development
const debug:any={
    disable:false,      //disable debug information
    cache:true,         //enable cache
    search:[],
    start:0,
    end:0,
    stamp:()=>{
		return new Date().getTime();
	},
}

const agent:any={
    process:null,
}

//anchor cache to avoid duplicate request.
const cache:any={
    data:{},
    set:(k:string,b:number,v:any)=>{
        cache.data[`${k}_${b}`]=v;
        return true;
    },
    get:(k:string,b:number)=>{
        return cache.data[`${k}_${b}`];
    },
    clear:()=>{
        cache.data={};
    },
}
/*************************debug part****************************/


const self={
    /**************************************************************************/
    /*************************Anchor data functions****************************/
    /**************************************************************************/
    getAnchor:(location:[string,number],ck:(res: anchorObject | errorObject) => void)=>{
        
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const [anchor,block]=location;

        //debug hook
        if(!debug.cache){
            const cData=cache.get(anchor,block);
            if(cData!==undefined) return ck && ck(cData);
        }
        
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
        if(!debug.disable) debug.search.push([anchor.name,anchor.block]);   //debug hook 
        if(!debug.cache) cache.set(anchor.name,anchor.block,anchor);        //debug hook
        if(anchor.empty) return ck && ck({error:"Empty anchor.",level:errorLevel.ERROR});
        if(!anchor.protocol) return ck && ck({error:"No-protocol anchor."});

        const protocol:keywords=anchor.protocol;
        if(!protocol.type) return ck && ck({error:"Not EasyProtocol anchor."});

        return ck && ck(anchor);
    },

    /**************************************************************************/
    /************************Decode Result functions***************************/
    /**************************************************************************/

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
        cObject.type=rawType.APP;
        const data=cObject.data[`${cObject.location[0]}_${cObject.location[1]}`];
        const protocol=data.protocol;
        cObject.code=data.raw;

        //TODO, here to load resource anchors
        if(protocol!==null && protocol.res){
            cObject.resource=protocol.res;
        }

        if(protocol!==null && protocol.lib){
            self.getLibs(protocol.lib,(dt:any,order:any)=>{
                const combine=Group(dt,order);

                const router:any={}
                for(var k in dt){
                    const row=dt[k];
                    if(row.name!==undefined){
                        cObject.data[`${row.name}_${row.block}`]=row;
                        router[row.name]=[row.name,row.block];
                    }
                }

                if(combine.order.length!==0){
                    let nods=[];
                    for(let i=0;i<combine.order.length;i++){
                        const key=combine.order[i];
                        if(router[key]!==undefined) nods.push(router[key]);
                    }
                    combine.order=nods;
                }
                cObject.libs=combine;
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
            self.getLibs(protocol.lib,(dt:any,order:any)=>{
                const combine=Group(dt,order);

                const router:any={}
                for(var k in dt){
                    const row=dt[k];
                    if(row.name!==undefined){
                        cObject.data[`${row.name}_${row.block}`]=row;
                        router[row.name]=[row.name,row.block];
                    }
                }

                if(combine.order.length!==0){
                    let nods=[];
                    for(let i=0;i<combine.order.length;i++){
                        const key=combine.order[i];
                        if(router[key]!==undefined) nods.push(router[key]);
                    }
                    combine.order=nods;
                }
                cObject.libs=combine;
                return ck && ck(cObject);
            });
        }else{
            return ck && ck(cObject);
        }
    },

    formatLibs:()=>{},

    getLibs:(list:anchorLocation[],ck:Function)=>{
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        //console.log(`Ready to get libs: ${JSON.stringify(list)}`);
        const RPC={
            search:API.common.latest,
            target:API.common.target,
        }
        Loader(list,RPC,ck);
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
    merge:(anchor:string,protocol:keywords,ck:Function)=>{
        if(API===null) return ck && ck({error:"No API to get data.",level:errorLevel.ERROR});
        const result:mergeResult={
            "hide":[], 
            "auth":null,
            "trust":null,
            "error":[],
            "index":[null,null,null],
            "map":{},
        };

        //console.log(`Merging function ready to go...`);

        //1.get hide related data and merge to result
        self.singleRule(anchor,protocol,relatedIndex.HIDE,(res: any,map:anchorMap,local:anchorLocation|null,errs:errorObject[])=>{
            //console.log(`singleRule 1 ready`);
            if(local!==null) result.index[relatedIndex.HIDE]=local;
            for(let k in map) result.map[k]=map[k];
            if(errs.length!==0) result.error.push(...errs);
            result.hide=res;

            //2.get auth related data and merge to result
            self.singleRule(anchor,protocol,relatedIndex.AUTH,(res: any,map:anchorMap,local:anchorLocation|null,errs:errorObject[])=>{
                //console.log(`singleRule 2 ready`);
                if(local!==null) result.index[relatedIndex.AUTH]=local;
                for(let k in map) result.map[k]=map[k];
                if(errs.length!==0) result.error.push(...errs);
                result.auth=res;

                //3.get trust related data and merge to result
                self.singleRule(anchor,protocol,relatedIndex.TRUST,(res: any,map:anchorMap,local:anchorLocation|null,errs:errorObject[])=>{
                    //console.log(`singleRule 3 ready`);
                    if(local!==null) result.index[relatedIndex.TRUST]=local;
                    for(let k in map) result.map[k]=map[k];
                    if(errs.length!==0) result.error.push(...errs);
                    result.trust=res;

                    return ck && ck(result);

                });
            });
        });
    },

    //get whole related data by protocol
    singleRule:(anchor:string,protocol:keywords,tag:relatedIndex,
        ck:(res: any,map:anchorMap,location:anchorLocation|null,errs:errorObject[])=>void)=>{
        let result:any=null;
        const map:anchorMap={};
        const location:anchorLocation|null=null
        const errs:errorObject[]=[];

        //console.log(`singleRule ${anchor}, tag : ${tag}, protocol : ${JSON.stringify(protocol)}`);

        //1.decode protocol to check wether get more data
        switch (tag) {
            case relatedIndex.HIDE:
                checkHide(anchor,protocol,(resHide:hideResult)=>{
                    if(resHide.anchor===null && resHide.list!==null){
                        result=resHide.list;
                        return ck && ck(result,map,location,errs);
                    }else if(resHide.anchor!==null && resHide.list===null){
                        self.singleExtend(resHide.anchor,false,(resSingle,mapSingle,errsSingle)=>{
                            result=resSingle;
                            for(var k in mapSingle)map[k]=mapSingle[k];
                            errs.push(...errsSingle);
                            return ck && ck(result,map,location,errs);
                        });
                    }else if(resHide.anchor!==null && resHide.list!==null){
                        errs.push({error:"Format error."});
                        return ck && ck(result,map,location,errs);
                    }else{
                        return ck && ck(result,map,location,errs);
                    }
                });
                break;
        
            case relatedIndex.AUTH:
                //console.log(`Auth athority check...`);
                checkAuth(anchor,protocol,(resAuth:authResult)=>{
                    if(resAuth.anchor===null && resAuth.list!==null){
                        result=resAuth.list;
                        return ck && ck(result,map,location,errs);

                    }else if(resAuth.anchor!==null && resAuth.list===null){
                        //console.log(`This way...`);
                        self.singleExtend(resAuth.anchor,true,(resSingle,mapSingle,errsSingle)=>{
                            result=resSingle;
                            for(var k in mapSingle)map[k]=mapSingle[k];
                            errs.push(...errsSingle);

                            return ck && ck(result,map,location,errs);
                        });
                    }else if(resAuth.anchor!==null && resAuth.list!==null){
                        errs.push({error:"Format error."});
                        return ck && ck(result,map,location,errs);
                    }else{
                        return ck && ck(result,map,location,errs);
                    }
                });
                break;
            case relatedIndex.TRUST:
                checkTrust(anchor,protocol,(resTrust:trustResult)=>{
                    if(resTrust.anchor===null && resTrust.list!==null){
                        result=resTrust.list;
                        return ck && ck(result,map,location,errs);
                    }else if(resTrust.anchor!==null && resTrust.list===null){
                        self.singleExtend(resTrust.anchor,true,(resSingle,mapSingle,errsSingle)=>{
                            result=resSingle;
                            for(var k in mapSingle)map[k]=mapSingle[k];
                            errs.push(...errsSingle);
                            return ck && ck(result,map,location,errs);
                        });
                    }else if(resTrust.anchor!==null && resTrust.list!==null){
                        errs.push({error:"Format error."});
                        return ck && ck(result,map,location,errs);
                    }else{
                        return ck && ck(result,map,location,errs);
                    }
                });
                
                break;
            default:
                errs.push({error:"unknow related index."});
                ck && ck(result,map,location,errs);
                break;
        }
    },

    //get anchor extend data, two parts: 1.extend anchor itself; 2.declared hidden anchor
    singleExtend:(name:anchorLocation,history:boolean,
        ck:(res: any,map:anchorMap,errs:errorObject[])=>void)=>{
            
        //console.log(`${name}:${history}`);
        let result:any=null;
        const map:anchorMap={};
        const errs:errorObject[]=[];
        const last:[string,number]=Array.isArray(name)?[name[0],0]:[name,0];

        if(history){
            //1.get the latest declared hidden list.
            self.getLatestDeclaredHidden(last,(resHidden:number[]|errorObject,resAnchor:anchorObject)=>{
                const err=<errorObject>resHidden;
                if(err!==undefined && err.error) errs.push(err);
                if(resAnchor!==undefined){
                    map[`${resAnchor.name}_${resAnchor.block}`]=resAnchor;
                }

                //console.log(resHidden);
                //console.log(resAnchor);
                
                //1.1.set hidden history map
                const lastHidden=<number[]>resHidden;
                const hmap:any={};
                if(Array.isArray(lastHidden))for(let i=0;i<lastHidden.length;i++) hmap[lastHidden[i]]=true;

                self.getHistory([Array.isArray(name)?name[0]:name,0],(listHistory:anchorObject[],errsHistory:errorObject[])=>{
                    if(errsHistory!==undefined) errs.push(...errsHistory);
                    //console.log(listHistory);

                    for(let i=0;i<listHistory.length;i++){
                        const data=listHistory[i];
                        map[`${data.name}_${data.block}`]=data;
                        if(hmap[data.block]) continue;
                        if(!data.protocol || !data.raw || data.protocol.type!==rawType.DATA){
                            errs.push({error:`Not valid anchor. ${data.name}:${data.block}`});
                            continue;
                        }
                        
                        try {
                            const target=JSON.parse(data.raw);
                            if(result===null) result={};
                            for(var k in target){
                                result[k]=target[k];
                            }
                        } catch (error) {
                            errs.push({error:`JSON format failed. ${data.name}:${data.block}`});
                            continue;
                        }
                    }
                    return ck && ck(result,map,errs);
                });
            });
        }else{
            self.getAnchor(Array.isArray(name)?name:[name,0],(resSingle:anchorObject|errorObject)=>{
                const err=<errorObject>resSingle;
                if(err!==undefined && err.error){
                    errs.push(err);
                    return ck && ck(result,map,errs);
                }

                const data=<anchorObject>resSingle;
                map[`${data.name}_${data.block}`]=data;
                if(!data.protocol || !data.raw || data.protocol.type!==rawType.DATA){
                    errs.push({error:"Not valid anchor."});
                    return ck && ck(result,map,errs);
                }
                
                try {
                    result=JSON.parse(data.raw);
                    return ck && ck(result,map,errs);
                } catch (error) {
                    errs.push({error:JSON.stringify(error)});
                    return ck && ck(result,map,errs);
                }
            });
        }
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

    //check the authority to account address
    checkAuthority:(caller:easyResult,app:easyResult,ck:Function)=>{
        //1.check the called anchor type.
        if(app.type!==rawType.APP){
            caller.error.push({error:`Answer is not cApp.`});
            return ck && ck(caller);
        }
            
        //2.check the authority
        const from=caller.data[`${caller.location[0]}_${caller.location[1]}`];
        const signer=from.signer;
        const auths=app.auth;
        //2.1. no authority data, can 
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
                            //console.log(block);
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

    //get the latest decared hide anchor list.
    getLatestDeclaredHidden:(location:anchorLocation,ck:Function)=>{
        self.getAnchor([location[0],0],(resLatest:anchorObject|errorObject)=>{
            //1. failde to get the hide anchor.
            const err=<errorObject>resLatest;
            //if(err.error) return ck && ck(err);
            if(err.error) return ck && ck([]);

            const data=<anchorObject>resLatest;
            const protocol=data.protocol;

            if(protocol===null || !protocol.hide) return ck && ck([]);
            if(Array.isArray(protocol.hide)) return ck && ck(protocol.hide);

            self.getAnchor([protocol.hide,0],(resHide:anchorObject|errorObject)=>{
                const err=<errorObject>resLatest;
                //if(err.error) return ck && ck(err);
                if(err.error) return ck && ck([]);

                const data=<anchorObject>resHide;
                if(data===null || !data.raw)  return ck && ck([],data);
                try {
                    const list=JSON.parse(data.raw);
                    return ck && ck(list,data);
                } catch (error) {
                    return ck && ck({error:error});
                }
            });
        });
    },

    /**************************************************************************/
    /*************************Declared anchor check****************************/
    /**************************************************************************/ 

    //check wether current anchor is in the hide list
    isValidAnchor:(hide:anchorLocation|number[],data:anchorObject,ck:Function,params:Object)=>{
        //console.log(params);
        const errs:errorObject[]=[];
        const cur=data.block;
        let overload:boolean=false;     //wether to the end of `Anchor` history
        if(Array.isArray(hide)){
            //1.if the hide is array, check directly
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
            //2.get the latest hide anchor data
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
    export:(txt:string)=>{
        if(agent.process!==null) return agent.process(txt);
        return true;
    },
    /**************************************************************************/
    /****************************Basic functions*******************************/
    /**************************************************************************/ 

    /** 
     * get params from string
     * @param {string}      args	    //String such as `key_a=val&key_b=val&key_c=val`
     * */
    getParams:(args:string):Object|errorObject=>{
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
    /** 
     * check wether object empty
     * @param {object}      obj	    //normal object
     * */
    empty:(obj:any):boolean=>{
        for(let k in obj) return false;
        return true;
    },
}

/**
 * Deocode map definition.
 * APP,DATA and LIB supported
 */

type decoderMap = {
    [index: string]: Function;
};
const decoder:decoderMap={};
decoder[rawType.APP]=self.decodeApp;
decoder[rawType.DATA]=self.decodeData;
decoder[rawType.LIB]=self.decodeLib;

//!important, as support `declared hidden`, this function may redirect many times, be careful.
/** 
 * Exposed method of Easy Protocol implement
 * @param {string}      linker	    //Anchor linker, such as `anchor://hello/`
 * @param {object}      inputAPI    //the API needed to access Anchor network, `anchorJS` mainly
 * @param {function}    ck          //callback, will return the decoded result
 * @param {boolean}     [fence]     //if true, treat the run result as cApp. Then end of the loop.
 * */
const run=(linker:string,inputAPI:APIObject,ck:(res:easyResult) => void,hlist?:number[],fence?:boolean)=>{
    if(API===null && inputAPI!==null) API=inputAPI;
    if(inputAPI!==null && inputAPI.agent!==undefined){
        if(inputAPI.agent.process!==undefined) agent.process=inputAPI.agent.process;
    }

    const target=linkDecoder(linker);
    if(target.error) return ck && ck(target);
    if(hlist===undefined) self.export(`Ready to decode Anchor linker: ${linker}`);

    //0.get the latest declared hidden list
    if(hlist===undefined){
        self.export(`Try to check declared hidden.`);
        return self.getLatestDeclaredHidden(target.location,(lastHide:number[]|errorObject,lastAnchor:anchorObject)=>{
            let cObject:easyResult={
                type:rawType.NONE,
                location:[target.location[0],target.location[1]!==0?target.location[1]:0],
                error:[],
                data:{},
                index:[<anchorLocation|null>null,<anchorLocation|null>null,<anchorLocation|null>null],
            }

            const res=<errorObject>lastHide;
            if(res!==undefined && res.error){
                self.export(`Failed to get declared hidden Anchor data.`);
                cObject.error.push(res);
                return run(linker,API,ck,[]);
            } 
        
            const hResult=<number[]>lastHide;
            self.export(`Get the declared hidden.`);
            return run(linker,API,ck,hResult);
        });
    }

    //1.decode the `Anchor Link`, prepare the result object
    let cObject:easyResult={
        type:rawType.NONE,
        location:[target.location[0],target.location[1]!==0?target.location[1]:0],
        error:[],
        data:{},
        index:[<anchorLocation|null>null,<anchorLocation|null>null,<anchorLocation|null>null],
        hide:hlist,
    }
    if(target.param) cObject.parameter=target.param;

    //2.Try to get the target `Anchor` data.
    self.export(`Try to get target Anchor data.`);
    self.getAnchor(target.location,(resAnchor:anchorObject|errorObject)=>{
        //2.1.error handle.
        const err=<errorObject>resAnchor;
        if(err.error){
            cObject.error.push(err);
            self.export(`Failed to get target Anchor.`);
            return ck && ck(cObject);
        }

        const data=<anchorObject>resAnchor;
        if(cObject.location[1]===0)cObject.location[1]=data.block;
        cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=data;

        //2.2.Wether JSON protocol
        if(data.protocol===null){
            cObject.error.push({error:"No valid protocol"});
            return ck && ck(cObject);
        }

        //2.3.Wether Easy Protocol
        const type:string=!data.protocol.type?"":data.protocol.type;
        if(!decoder[type]){
            cObject.error.push({error:"Not easy protocol type"});
            return ck && ck(cObject);
        }

        //3. check wether the latest anchor. If not, need to get latest hide data.
        self.export(`Checking validity of Anchor data.`);
        if(data.protocol){
            self.isValidAnchor(hlist,data,(validLink:string|null,errs:errorObject[],overload?:boolean)=>{
                cObject.error.push(...errs);
                if(overload) return ck && ck(cObject);
                if(validLink!==null) return run(validLink,API,ck,hlist);
                self.export(`Valid Anchor data.`);
                return getResult(type);
            },cObject.parameter===undefined?{}:cObject.parameter);
        }else{
            return getResult(type);
        }

        function checkFence(resFirst:easyResult,ck:any,fence?:boolean){
            self.export(`Checking calling of Anchor.`);
            if(resFirst.call && !fence){
                const app_link=linkCreator(resFirst.call,resFirst.parameter===undefined?{}:resFirst.parameter);
                self.export(`Call Anchor: ${resFirst.call}`);
                return run(app_link,API,(resApp:easyResult)=>{
                    return self.checkAuthority(resFirst,resApp,ck);
                },hlist,true);
            }else{
                return ck && ck(resFirst);
            }
        }
        
        //inline function to avoid the repetitive code.
        function getResult(type:string){
            self.export(`Anchor type: ${type} , ready to decode.`);
            self.merge(data.name,<keywords>data.protocol,(mergeResult:mergeResult)=>{
                self.export(`Anchor data merged.`);
                if(mergeResult.auth!==null) cObject.auth=mergeResult.auth;
                if(mergeResult.trust!==null) cObject.trust=mergeResult.trust;
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
                if(mergeResult.index[relatedIndex.TRUST]!==null && cObject.index){
                    cObject.index[relatedIndex.TRUST]=mergeResult.index[relatedIndex.TRUST];
                }
    
                for(let k in mergeResult.map){
                    cObject.data[k]= mergeResult.map[k];
                }
                self.export(`Anchor data grouped.`);
                return decoder[type](cObject,(resFirst:easyResult)=>{
                    self.export(`Anchor data decoded.`);
                    if(!resFirst.resource){
                        //1.if no more resource to load, export the result

                        return checkFence(resFirst,ck,fence);
                    }else{
                        //2.load the target anchor resource and combine together;
                        self.export(`Need to load resource listed by Anchor ${resFirst.resource}`);
                        self.getAnchor([resFirst.resource,0],(resResource:anchorObject|errorObject)=>{
                            const err=<errorObject>resResource;
                            if(err.error){
                                cObject.error.push(err);
                                self.export(`Failed to load resource Anchor ${resFirst.resource}`);
                                return checkFence(resFirst,ck,fence);
                            }

                            const data=<anchorObject>resResource;
                            resFirst.data[`${data.name}_${data.block}`]=data;

                            if(data.raw!==null){
                                self.export(`Loading resource Anchor list ${data.raw}`);
                                const res_list=JSON.parse(data.raw);
                                if(API!==null && API.common.multi!==undefined){
                                    API.common.multi(res_list,(resData:anchorObject[]|errorObject)=>{
                                        const err=<errorObject>resData;
                                        if(err.error){
                                            cObject.error.push(err);
                                            return ck && ck(resFirst);
                                        }
                                        const data_list=<anchorObject[]>resData;
                                        resFirst.raw=data_list;
                                        self.export(`Resource loaded.`);
                                        return checkFence(resFirst,ck,fence);
                                    });
                                }
                            }
                        });
                    }
                });
            });
        }
    });
};

//Debug part to get more details of process.
const debug_run=(linker:string,inputAPI:APIObject,ck:(res:easyResult) => void)=>{
    debug.search=[];
    debug.start=debug.stamp();
    run(linker,inputAPI,(resRun)=>{
        if(!debug.disable) resRun.debug=debug;  //add debug information
        debug.end=debug.stamp();
        cache.clear();
        return ck && ck(resRun);
    });
};
const final_run=(debug.disable?run:debug_run);
export { final_run as easyRun};
