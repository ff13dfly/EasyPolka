//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`

import { anchorObject,errorObject,APIObject,rawType} from "./protocol";
import { linkDecoder } from "./decoder";

let API:APIObject=null;

const self={
    check:(location:[string,number],ck:(res: anchorObject | errorObject) => void)=>{
        
        if(API===null) return ck && ck({error:"No API to get data."});
        const [anchor,block]=location;

        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if(block!==0){
            API.common.target(anchor,block,(data:any)=>{   
                if(!data) return ck && ck({error:"No such anchor."});
                if(data.error) return ck && ck({error:data.error});
                if(data.empty) return ck && ck({error:"Empty anchor."});
                return ck && ck(data);
            });
        }else{
            API.common.latest(anchor,(data:any)=>{
                if(!data) return ck && ck({error:"No such anchor."});
                if(data.error) return ck && ck({error:data.error});
                if(data.empty) return ck && ck({error:"Empty anchor."});
                return ck && ck(data);
            });
        }
    },

    getApp:()=>{

    },
    getData:()=>{

    },
    getLibs:()=>{

    },

    // check the authority of anchor if launch from data
    authorize:()=>{

    },

    // check running enviment (window or node.js)
    env:()=>{

    },
}

const run=(linker:string,inputAPI:APIObject,ck:Function)=>{
    if(API===null && inputAPI!==null) API=inputAPI;
    const target=linkDecoder(linker);
    if(target.error) return ck && ck(target);

    let cObject:any={
        raw:null,
        error:[],
    }
    if(target.param) cObject.parameter=target.param;

    self.check(target.location,(res:any)=>{
        if(res.error || res.empty) return ck && ck(res);
        if(!res.protocol || !res.protocol.type) return ck && ck({error:"Not EasyProtocol anchor."});

        // 1.check anchor data
        cObject.raw=res.raw;
        switch (res.protocol.type) {
            case "app":
                console.log(`App type anchor`);
                try {
                    cObject.app = new Function("container","API","args","from","error",res.raw);
                } catch (error) {
                    cObject.error.push({error:"Failed to get function"});
                }
                break;

            case "data":
                console.log(`Data type anchor`);
                cObject.from=target.location[0];

                break;

            case "lib":
                console.log(`Lib type anchor`);
                break;

            default:
                console.log(`Unexcept type anchor`);
                break;
        }

        
        return ck && ck(cObject);
    });
};
export {run as easyRun};
export {run as easyProtocol};