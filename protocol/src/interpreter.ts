//!important This is the library for Esay Protocol

import { localtionObject,anchorObject,errorObject,APIObject,cAppResult } from "./protocol";


let API:APIObject|null=null;

const self={
    run:(location:localtionObject|string,inputAPI:APIObject|null,ck?:any)=>{
        if(API===null && inputAPI!==null) API=inputAPI;

        self.check(location,(res:anchorObject|errorObject)=>{

        });
    },
    check:(location:localtionObject|string,ck:(res: anchorObject | errorObject) => void)=>{
        if(API===null) return ck && ck({error:"No API to get data."});

        console.log(`Checking : ${JSON.stringify(location)}`);

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
}

const run=self.run;

export {run as easyProtocol};