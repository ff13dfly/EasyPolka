//!important This is the definition of Esay Protocol.
//!important Easy Protocol is a simple protocol to launch cApp via Anchor network.
//!important Easy Protocol version 1.0 supported.

/********************************/
/***********Anchor part**********/
/********************************/

//anchor location object
export type localtionObject=[
    name  : string,
    block : number,
] | string;

//anchor data object, input from anchor.js
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
    ERROR = "error",
    WARN = "warning",
}

/********************************/
/***********format part**********/
/********************************/

export enum anchorType{
    DATA="data",
    APP ="app",
}

export enum formatType{
    JAVASCRIPT="js",
    CSS="css",
    MARKDOWN="md",
    JSON="json",
    NONE="",
}

export enum codeType{
    ASCII="ascii",
    UTF8="utf8",
    HEX="hex",
    NONE="",
}

//data type object
export type dataProtocol={
    "type":anchorType.DATA;
    "fmt":formatType;
    "code"?:codeType;             //data code
    "call"?:localtionObject;    //call target anchor
    "auth"?:localtionObject;    //anchor which the auth list storaged.
    "push"?:string[];           //push to target cApp
    "hide"?:localtionObject;    //anchor which storage the hide list defined by hideMap
}

//cApp type object
export type appProtocol={
    "type":anchorType.APP;
    "fmt":formatType;
    "ver":string;
    "lib"?:localtionObject[]|string[];
    "auth"?:localtionObject;
    "hide"?:localtionObject;   //anchor which storage the hide list defined by hideMap
}

//auth anchor data format
//Sample : {"5CaYdQ6i2mWgHmBpQXgmVdPqvYxSwoLo4KFchFnpzn8Kbdtg":32345}
interface addressMap { [address: string]: number; }

//hide map of target anchor
//all can be 
interface hideMap { [anchor: string]: number; }

/********************************/
/************cApp part***********/
/********************************/

//input API object type, define the 
export type APIObject={
    "common":{              //normal anchor function
        "target":(anchor:string,block:number,ck:Function) => anchorObject|errorObject;
        "latest":(anchor:string,ck:Function) => anchorObject|errorObject;
        "history"?:(anchor:string,ck:Function) => anchorObject[]|errorObject;
    };
    "auto"?:Function;       //Gateway auto access
}|null;

/********************************/
/************ result ************/
/********************************/

// the decode result, easy protocol target
export type cAppResult={
    API:APIObject;          //APIs can be sent to cApp
    error:errorObject[];    //errors when loading cApp
    app:Function|null;      //the app init from anchor raw data
    parameter:string[];     //running parameters, from anchor link parameter
    nodeJS:boolean;         //wether the nodeJS
    from?:anchorObject;     //if the cApp is called from a data anchor
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
        parameter:[],
        nodeJS:false,
        from:"",
        back:[],
    },
}

export {defaultValue};