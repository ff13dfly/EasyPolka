

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

/********************************/
/************cApp part***********/
/********************************/

export enum anchorType{
    DATA="data",
    APP="app",
}

export enum formatType{
    JAVASCRIPT="js",
    CSS="css",
    MARKDOWN="md",
    JSON="json",
    NONE="",
}
//data type object
export type dataProtocol={
    "type":anchorType.DATA;
    "fmt":formatType;
    "code"?:string;             //data code
    "call"?:localtionObject;       //call target anchor
    "auth"?:localtionObject;       //anchor which the auth list storaged.
}

//cApp type object
export type appProtocol={
    "type":anchorType.APP;
    "fmt":formatType;
    "ver":string;
    "lib"?:localtionObject[]|string[];
    "auth"?:localtionObject;
}

//auth format
// {
//     "SS58 address":"{expired_block_number}"   //start_block is the storage one.
// }

//input API object type, define the 
export type APIObject={
    "common":{              //normal anchor function
        "target":(anchor:string,block:number,ck:Function) => anchorObject|errorObject;
        "latest":(anchor:string,ck:Function) => anchorObject|errorObject;
        "history"?:(anchor:string,ck:Function) => anchorObject[]|errorObject;
    };
    "auto"?:Function;       //Gateway auto access
}|null

/********************************/
/************ result ************/
/********************************/

enum errorLevel{
    ERROR="error",
    WARN="warning",
}

// the decode result 
export type cAppResult={
    API:APIObject;
    error:errorObject[];    //errors when loading cApp
    app:Function|null;      //the app init from anchor raw data
    parameter:string[];     //running parameters
    from?:anchorObject;     //if the cApp is called
    back?:string[];         //parameter when callback the from cApp
}

//default value object
const defaultValue ={
    dataObject:{},
    cAppObject:{},
}

export {defaultValue};