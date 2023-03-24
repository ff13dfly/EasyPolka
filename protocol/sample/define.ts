
export type anchorObject={
    age:number|null;
    start:number;
    intro:string;
    check:(n: number) => any;
}

export type marketObject={
    price:number;
    owner:string;
    free:boolean;
}

const defaultValue ={
    anchorObject:{
        age:0,
        start:0,
        intro:'',
        check:(n:number)=>{
            console.log(n>10?"big than 10":"small number")
        },
    },
    marketObject:{
        price:0,
        owner:"",
        free:true,
    },
}

export {defaultValue};