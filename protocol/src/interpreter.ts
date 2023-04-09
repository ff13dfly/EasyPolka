//!important This is the library for Esay Protocol
//!important Can run cApp from `Anchor linker`

import { anchorObject,errorObject,APIObject} from "./protocol";
import { linkDecoder } from "./decoder";

let API:APIObject=null;

const self={
    check:(linker:string,ck:(res: anchorObject | errorObject) => void)=>{
        
        if(API===null) return ck && ck({error:"No API to get data."});
        const target=linkDecoder(linker);
        if(target.error) return ck && ck(target);

        const [anchor,block]=target.location;

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
        if(res.error) return ck && ck(res);
        
        //console.log(res);
        //return ck && ck(res);
    });
};
export {run as easyRun};