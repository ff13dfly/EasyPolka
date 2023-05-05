const pa='API',pb='input',pc='errs';
const code=`console.log(API);
console.log(input);
console.log(errs);
`;
const str=`;(function(${pa},${pb},${pc}){${code}})(${pa},${pb},${pc})`;

const cApp = new Function(pa, pb, pc,str);

const API={
    anchorJS:'Not support',
    easy:()=>{},
}

const input={
    tpl:"dark",
    page:12,
}

const errs=[];

cApp(API,input,errs);