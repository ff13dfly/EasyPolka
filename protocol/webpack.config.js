const path = require('path');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/interpreter.ts",
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: "easy.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader",
        // exclude: [
        //     'test',
        //     'sample'
        // ]
      }
    ]
  }
};