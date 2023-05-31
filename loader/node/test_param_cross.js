const args = process.argv.slice(2);
console.log(args);
process.argv.shift();
const code=";(function(process){const args = process.argv.slice(2);console.log(args)})(process)";

eval(code);
