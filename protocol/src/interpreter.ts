//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`

import { anchorLocation,anchorObject,errorObject,APIObject} from "./protocol";
import { linkDecoder } from "./decoder";

let API:APIObject=null;

const self={
    check:(linker:string,ck:(res: anchorObject | errorObject) => void)=>{
        
        if(API===null) return ck && ck({error:"No API to get data."});
        const target=linkDecoder(linker);
        const location=target.location;

        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if(Array.isArray(location)){
            const [anchor,block]=location;
            API.common.target(anchor,block,(data:anchorObject|errorObject)=>{
                //if(data.error) return ck && ck({error:data.error});
                //if(data.empty) return ck && ck({error:"Empty anchor."});
                //console.log(data);
            });
        }else{
            API.common.latest(location,(data:anchorObject|errorObject)=>{
                //console.log(data);
            });
        }
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

    self.check(linker,(res:anchorObject|errorObject)=>{
        return ck && ck(res);
    });
};
export {run as easyRun};