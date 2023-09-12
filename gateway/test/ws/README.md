# 测试Node.js的响应能力

- [http://localhost/easypolka/gateway/test/ws/]( http://localhost/easypolka/gateway/test/ws/)

## koa的async方式

- 需要等vService响应了之后，才能正确返回。直接响应的话，就是没有数据处理结果的

- 这种方式，适合用在低访问量的情况下

## websocket的方式

