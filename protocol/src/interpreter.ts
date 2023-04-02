//!important This is the library for Esay Protocol

import { anchorLocation,anchorObject,errorObject,APIObject} from "./protocol";

let API:APIObject=null;

const self={
    check:(location:anchorLocation,ck:(res: anchorObject | errorObject) => void)=>{
        if(API===null) return ck && ck({error:"No API to get data."});
        //console.log(`Checking : ${JSON.stringify(location)} via ${address}`);
        if(Array.isArray(location)){
            const [anchor,block]=location;
            API.common.target(anchor,block,(data:anchorObject|errorObject)=>{
                console.log(data);
            });
        }else{
            API.common.latest(location,(data:anchorObject|errorObject)=>{
                console.log(data);
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

const run=(location:anchorLocation,inputAPI:APIObject,ck:Function)=>{
    if(API===null && inputAPI!==null) API=inputAPI;

    self.check(location,(res:anchorObject|errorObject)=>{
        return ck && ck(res);
    });
};
export {run as easyRun};