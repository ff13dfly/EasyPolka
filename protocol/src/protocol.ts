//!important This is the definition of Esay Protocol.
//!important Easy Protocol is a simple protocol to launch cApp via Anchor network.
//!important Easy Protocol version 1.0 supported.

/********************************/
/***********Anchor part**********/
/********************************/

//anchor location object
//1. anchor_name
//2. [anchor_name,block_number]
export type anchorLocation=[
    name  : string,
    block : number,
] | string;

//anchor data object, input from anchorJS
export type anchorObject={
    "name":string;
	"protocol":string|null|object;
	"raw":string|null|object;
	"block":number;
	"stamp":number;
	"pre":number;
	"signer":string;
	"empty":boolean;
	"owner":string;
	"sell":boolean;
	"cost":number;
	"target":string;
};

//error Object
export type errorObject={
    "error":string;
    "level"?:errorLevel;
}

enum errorLevel{
    ERROR       = "error",
    WARN        = "warning",
    UNEXCEPT    = "unexcept",
}

/********************************/
/***********format part**********/
/********************************/

export enum rawType{
    DATA    = "data",
    APP     = "app",
}

export enum formatType{
    JAVASCRIPT  = "js",
    CSS         = "css",
    MARKDOWN    = "md",
    JSON        = "json",
    NONE        = "",
}

export enum codeType{
    ASCII   = "ascii",
    UTF8    = "utf8",
    HEX     = "hex",
    NONE    = "",
}

//data type object
//TODO: auth is not fully logical now. Need to confirm the calling address
//TODO: there are two ways.
//1. auth between anchors, that can be checked.
//2. auth between address and anchor, it is hard to check. people can mock the auth address
export type dataProtocol={
    "type":rawType.DATA;                // `data` type
    "fmt":formatType;                   // raw data format
    "code"?:codeType;                   // data code
    "call"?:anchorLocation;             // call target anchor
    "push"?:string[];                   // list of push to target cApp name
    "hide"?:hideMap|anchorLocation;     // anchor which storage the hide list defined by hideMap
    "auth"?:authMap|anchorLocation;     // the list of auth anchor;when anchorLocation, map storage there.
}

//cApp type object
export type appProtocol={
    "type":rawType.APP;                 // `app` type
    "fmt":formatType;                   // app format, JS only now
    "ver":string;                       // the cApp version, need incremnet when update
    "lib"?:anchorLocation[];            // the list of required anchor list
    "hide"?:hideMap|anchorLocation;     // anchor which storage the hide list defined by hideMap
    "auth"?:authMap|anchorLocation;     // the list of auth anchor;when anchorLocation, map storage there.
}

//auth anchor data format
//only the auth between anchors.
//Sample:{"hello":32345} 
// the number is expired block number of the auth, if 0, it is unlimited.
interface authMap { [anchor: string]: number; }

//hide map of target anchor
//the history of the hide anchor is meanful.
interface hideMap { [anchor: string]: number; }

/********************************/
/************API part************/
/********************************/

//!important this is not part of easy protocol, develop can limit the function freely
//input API object type, define the basic functions
export type APIObject={
    //normal anchor function
    "common":{              
        "target":(anchor:string,block:number,ck:Function) => anchorObject|errorObject;
        "latest":(anchor:string,ck:Function) => anchorObject|errorObject;
        "history":(anchor:string,ck:Function) => anchorObject[]|errorObject;
        "owner":(anchor:string,ck:Function) => any;
        "lib":(list:anchorLocation[],ck:Function) => any|errorObject;
        "subcribe":(ck:Function,cfg:any) => anchorObject[];
    };
    //polkadot functions needed
    "polka"?:{
        "balance":(address:string,ck:Function) => any|errorObject;
    },
    //if gateway support, add here.
    "gateway"?:{  
        "auto":(svc:string,fun:string,param:object,ck:Function) => any|errorObject;
        "health":(ck:Function)=>any|errorObject;
    }
}|null;

/********************************/
/************ result ************/
/********************************/

// the decode result, easy protocol target
export type cAppResult={
    app:Function|null;      //cApp function, if from the data type anchor, will load target cApp
    raw:String|null;        //if cApp is not JS, leave the raw data here.
    parameter:string[];     //running parameters, from anchor link parameter
    error:errorObject[];    //errors when loading cApp
    from?:anchorObject;     //if the cApp is called from a data anchor

    //parameters from launcher
    API:APIObject;          //APIs can be sent to cApp
    nodeJS:boolean;         //wether the nodeJS
    back?:string[];         //parameter when callback
}


/********************************/
/******** default value *********/
/********************************/

//default value object
const defaultValue ={

    //cApp resutl object, if the anchor is empty
    cAppResult:{
        API:null,
        error:[],
        app:null,
        raw:null,
        parameter:[],
        nodeJS:false,
        from:"",
        back:[],
    },
}

export {defaultValue};