//https://github.com/moleculerjs/moleculer

//install the necessary libs
//npm i avsc --save
//npm i thrift --save
//npm i protobufjs/minimal --save

//yarn add avsc

const { ServiceBroker } = require("moleculer");

//console.log(process.env);
console.log(process.env.LOGLEVEL)
//console.log(process);

// Define a service
// const broker = new ServiceBroker({
//     nodeID: "node-1",
//     transporter: "nats://localhost:4222",
//     logLevel: "debug",
//     requestTimeout: 5 * 1000
// });

// // Start the broker
// broker.start()
//     // Call the service
//     .then(() => broker.call("math.add", { a: 5, b: 3 }))
//     // Print the response
//     .then(res => console.log("5 + 3 =", res))
//     .catch(err => console.error(`Error occured! ${err.message}`));


//1.setup a gateway to expose service

//2.setup a service to cache Anchors

//3.setup a service to collect accounts

//4.run them all 