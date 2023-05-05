//node node_parameter.js one two=three four
//node node_parameter.js anchor://full_app/

var args = process.argv.slice(2);
console.log(args);

// process.argv.forEach(function (val, index) {
//     console.log(index + ': ' + val);
// });