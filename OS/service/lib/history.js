const map={};

module.exports = {
    message:(from, to, ctx) => {
        if(!map[to]) map[to]=[];
        map[to].push({
            from:from,
            to:to,
            content:ctx,
            stamp:new Date().getTime(),
        })
    },
    mine:(address)=>{
        if(!map[address]) return [];
        return map[address];
    },
    clean:(count)=>{

    },
}