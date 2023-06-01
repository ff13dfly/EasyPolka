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


## console color

```TEXT
    Reset = "\x1b[0m"
    Bright = "\x1b[1m"
    Dim = "\x1b[2m"
    Underscore = "\x1b[4m"
    Blink = "\x1b[5m"
    Reverse = "\x1b[7m"
    Hidden = "\x1b[8m"

    FgBlack = "\x1b[30m"
    FgRed = "\x1b[31m"
    FgGreen = "\x1b[32m"
    FgYellow = "\x1b[33m"
    FgBlue = "\x1b[34m"
    FgMagenta = "\x1b[35m"
    FgCyan = "\x1b[36m"
    FgWhite = "\x1b[37m"
    FgGray = "\x1b[90m"

    BgBlack = "\x1b[40m"
    BgRed = "\x1b[41m"
    BgGreen = "\x1b[42m"
    BgYellow = "\x1b[43m"
    BgBlue = "\x1b[44m"
    BgMagenta = "\x1b[45m"
    BgCyan = "\x1b[46m"
    BgWhite = "\x1b[47m"
    BgGray = "\x1b[100m"
```
