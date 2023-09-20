
const details={
    gridY:160,
    cell:[103,134],
    range:[4,8],
    screen:[414,896],
}

const DEVICE={
    details:()=>{
        return details;
    },

    grids:()=>{
        return [4,8];
    },
    getStart:(id)=>{
        const sel=document.getElementById(id);
        console.log(sel);
    },
}

export default DEVICE;