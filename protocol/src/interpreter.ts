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
    decoder:(args:string)=>{
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
        location:[target.location[0],target.location[1]!==0?target.location[1]:0],
        error:[],
        data:{},
    }
    if(target.param) cObject.parameter=target.param;

    self.check(target.location,(res:any)=>{
        if(res.error || res.empty) return ck && ck(res);
        if(!res.protocol || !res.protocol.type) return ck && ck({error:"Not EasyProtocol anchor."});

        if(cObject.location[1]===0)cObject.location[1]=res.block;
        cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=res;

        // 1.check anchor data
        switch (res.protocol.type) {
            case "app":
                console.log(`App type anchor`);
                try {
                    cObject.app = new Function("container","API","args","from","error",res.raw);
                } catch (error) {
                    cObject.error.push({error:"Failed to get function"});
                }
                ck && ck(cObject);
                break;

            case "data":
                console.log(`Data type anchor`);
                //console.log(res);
                if(res.protocol && res.protocol.call){
                    const app_answer=Array.isArray(res.protocol.call)?res.protocol.call:[res.protocol.call,0];
                    return self.check(app_answer,(answer:any)=>{
                        if(res.error || res.empty) return ck && ck(res);
                        if(!res.protocol || !res.protocol.type) return ck && ck({error:"Called Not-EasyProtocol anchor."});
                        
                        cObject.from=cObject.location;
                        cObject.location=[app_answer[0],answer.block];

                        cObject.data[`${cObject.location[0]}_${cObject.location[1]}`]=answer;
                        try {
                            cObject.app = new Function("container","API","args","from","error",answer.raw);
                        } catch (error) {
                            cObject.error.push({error:"Failed to get function"});
                        }

                        

                        if(res.protocol && res.protocol.args){
                            const args=self.decoder(res.protocol.args);

                            if(!args.error) cObject.parameter=args;
                            else cObject.error.push(args);

                        }

                        ck && ck(cObject);
                    });
                }
                ck && ck(cObject);
                
                break;

            case "lib":
                console.log(`Lib type anchor`);
                break;

            default:
                console.log(`Unexcept type anchor`);
                ck && ck(cObject);
                break;
        }
    });
};
export {run as easyRun};