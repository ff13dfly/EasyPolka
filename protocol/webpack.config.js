const path = require('path');

// libraryTarget:"commonjs2",
//https://stackoverflow.com/questions/50658387/cant-import-es6-modules-from-webpack-bundle
module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry:{
    main:"./src/interpreter.js",
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    libraryTarget:"commonjs2",  // important,can be import properly
    filename: "easy.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".js"],
  },
};

// module.exports = {
//   mode: "development",
//   devtool: "inline-source-map",
//   entry:[
//     "./src/protocol.ts",
//     "./src/auth.ts",
//     "./src/hide.ts",
//     "./src/format.ts",
//     "./src/decoder.ts",
//     "./src/interpreter.ts",
//   ],
//   output: {
//     path: path.resolve(__dirname, './dist'),
//     filename: "easy.js" // <--- Will be compiled to this single file
//   },
//   resolve: {
//     extensions: [".ts", ".tsx", ".js"],
//   },
//   module: {
//     rules: [
//       { 
//         test: /\.tsx?$/,
//         loader: "ts-loader",
//       }
//     ]
//   }
// };