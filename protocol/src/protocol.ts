

/********************************/
/***********Anchor part**********/
/********************************/

//anchor location object
export type localtionObject=[
    name  : string,
    block? : number,
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
}

/********************************/
/************cApp part***********/
/********************************/

//data type object
export type dataObject={
    "type":string;              //enum, ["data","app"]
    "fmt":string;
    "code":string;              //data code
    "call"?:anchorObject;       //call target anchor
    "auth"?:anchorObject;       //anchor which the auth list storaged.
}

//cApp type object
export type cAppObject={
    "type":string;
    "fmt":string;
    "lib"?:localtionObject[]|string[];
    "ver"?:string;
    "auth"?:anchorObject;
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
}

/********************************/
/************ return ************/
/********************************/

// the decode result 
export type cAppResult={
    API:APIObject;
    error:errorObject[];
    app:Function|null;
    parameter:string[];
    from?:anchorObject;     //if the cApp is called
    back?:string[];         //parameter when callback the from cApp
}

//default value object
const defaultValue ={
    dataObject:{},
    cAppObject:{},
}

export {defaultValue};