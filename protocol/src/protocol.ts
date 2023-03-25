

/********************************/
/***********Anchor part**********/
/********************************/

//anchor location object
export type localtionObject=[
    name  : string,
    block : number,
];

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
    "type":string;
    "format":string;
    "code":string;
}

//cApp type object
export type cAppObject={
    "type":string;
    "format":string;
    "lib":localtionObject[]|string[];
}

//input API object type, define the 
export type APIObject={
    "common":{
        "target":(anchor:string,block:number,ck:Function) => anchorObject|errorObject;
        "latest":(anchor:string,ck:Function) => anchorObject|errorObject;
        "history"?:(anchor:string,ck:Function) => anchorObject[]|errorObject;
    };
    "auto"?:Function;
}

/********************************/
/************ return ************/
/********************************/

// the decode result 
export type cAppResult={
    API:APIObject;
    error:errorObject[];
    parameter:string[];
    from:anchorObject|null;
    back?:string[];
}

//default value object
const defaultValue ={
    dataObject:{},
    cAppObject:{},
}

export {defaultValue};