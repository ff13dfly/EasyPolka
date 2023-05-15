# Gateway

Gateway is the EasyPolka micro service system.

## Overview

## Gateway Defalt Exposed Methods

### basic

### check

### alive

### notice

## Service Defalt Exposed Methods

### reg

- Response to `Gateway` regsiter call.

- Will accept the `salt` from `Gateway`. Will sent the service details to `Gateway`.

### ping

- Request to `Gateway` to identify the `Service` is alive.

### notice

- Sent the notice to `Gateway`.

## Libs needed

- JWT (JSON Web Tokens) is used to register the service to gateway.
- jsonwebtoken, sign and verify token.
- JSONRPC

- Gateway base on koa.js

- Service base on koa.js

## Transport Data Structure

- Base on `http` or `https` to comunicate between `Gateway` and `Service`.

- Header structure, append the JWT token to verify the `Service`.

- Body structure, `JSON RPC 2.0` standard.

    ```JSON
        {
            "jsonrpc":"2.0",
            "method":"spam",
            "id":"SS58 address",
            "params":{}
        }
    ```

## Handshake & Fresh

- Gateway sent the details to Service ( setup whitelist to accept )

    ```JSON
        {
            "salt":"private_string,",
            "expired":"",
        }
    ```

- Service storage the details and sent the data and salt back. This time, only encry by the sending `salt`.

    ```JSON
        {
            "salt":"service_string",
            //...more details of service
        }
    ```

## How to build

## Deploy

## Resources

- [https://blog.logrocket.com/building-microservices-node-js/](https://blog.logrocket.com/building-microservices-node-js/)

- moleculer, a microservice framework [https://moleculer.services/docs/0.14/](https://moleculer.services/docs/0.14/)

- Koa.js, a http server framework. Popular and easy to understand.
