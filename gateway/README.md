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

- Security problems [https://tool.4xseo.com/a/57952.html](https://tool.4xseo.com/a/57952.html)
    1. Token, gateway manage.
    2. Timestamp, add to request.
    3. URL signature,  web JSON token
    4. Recall, client encry all parameters and sent to server
    5. Https

- JSON RPC 2.0 [https://www.npmjs.com/package/json-rpc-2.0?activeTab=readme](https://www.npmjs.com/package/json-rpc-2.0?activeTab=readme)


## 原理说明

- hub启动需要指定一个默认的账号，address_a。这个账号只有在manage的时候需要，那这个账号就可以作为默认的salt来进行第一次握手，获取到临时加密密码之后，就后继用临时的来处理。

- hub是JWT的服务器，无论对UI的管理，还是vService的认证，都使用这个JWT认证服务。

- vService注册的时候，也需要服务器知道启动vService的账号是啥，进行初次握手