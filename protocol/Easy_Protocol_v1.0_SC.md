# Easy Protocol ( v1.0 )

- 参考HTTP协议：[https://www.w3.org/Protocols/HTTP/1.0/spec](https://www.w3.org/Protocols/HTTP/1.0/spec)

## 概述

- `Easy Protocol`是用来实现链上应用程序的协议，基于简单易读的JSON，现在的版本是`v1.0`。`Easy Protocol`着力解决链上数据的关系，建立一个可以自启动的区块链网络，通过单一的入口就可以进入整个Web3.0的世界。

![a image show the relationship of Anchors]()

- `Easy Protocol`大小写不敏感，最大协议长度是256字节。`Easy Protocol`不对运行的代码进行限定。为方便描述说明问题，以下将采用Javascript和JSON的方式进行描述说明。

- `Easy Protocol`基于`Anchor Network`的特性来实现。

## 词汇表

1. Anchor，链锚，一种存储在链上的KV数据系统，使用Anchor名称来唯一标定链上的资源。
2. Anchor Linker，类似于URI的链上资源链接
3. Declared Hidden，数据所有者通过显性的申明，隐藏指定的链上数据
4. Launcher，加载其他cApp的入口程序，可以对账号等进行管理
5. Booter，从链上启动的加载程序，对API进行管理

## 数据结构

### 链锚（ Anchor ）

- Anchor data sample as follow. On-chain data is trustable, linked list way can save the storage and make every step of development meanful.

    ```Javascript
        {
            "name":"",        //unique name, called `Anchor Name`
            "raw":"",         //code or customized data
            "protocol":{      //Easy Protocol content
                ...
            }
            "pre":0,          //block number of previouse anchor data
        }
    ```

    | Keywords | Type | Min | Max |
    | ------ | ----------- |----------- |----------- |
    | name | `string` | 0 | 40 |
    | raw | `vec<u8>` | 0 | 4MB|
    | protocol | `vec<u8>` | 0 | 256 |
    | pre | `u128` |0 | * |

- Ownership. Anchor must be owned to single one account. Only the owner can modify the Anchor, and every modification must be storaged.Ownership can be transfered, but the history data must be linked to the owner when data was updating.

- Unique Anchor name. Like Domain Name, Anchor Name is unique on blockchain network.

- On-chain Linked List.

### 锚链接（ Anchor Link ）

- `?`作为锚链接的参数分割符，对于用于`Easy Protocol`的链锚名称里不应该包含。

- 锚链接是类似于URI的链上数据定位字符串，可以唯一的定位链上的资源。暂不支持白皮书里的`@`网络定位符。

    ```TEXT
        anchor://{name}[/][{block}][/][?][{key}={val}&{key}={val}]
    ```

- Charactor `?` is reversed, the name which including `?` is not supported by `Easy Protocol`.

- 参数覆盖问题，anchor数据上可以设置参数，而外部也可以穿入参数，如果出现冲突，传入的参数优先。

### 授权

#### 账户授权

- Follow the latest anchor data to confirm the authority.

- `账号 -> 区块号`的方式来设置，当区块号为0，为无限时授权

#### 链锚授权

- `Anchor -> 区块号`的方式来设置，当区块号为0，为无限时授权

#### 授权时限

- 采用授权到区块号的方式，0为无限时授权。

#### 重复授权处理

- 重复授权是指，对于Anchor，如果未被授权，但是写入Anchor的address确是被授权的。采取账号授权优先的原则。换言之，账号授权的权限是大雨anchor授权的。

### 申明删除（ Declared Hidden ）

- Follow the latest anchor data to confirm the hidden list.

#### 直接申明

#### 链锚申明

### 运行代码

- Anchor Raw Data is used to storage code.

- The max Anchor Raw data length is 4MB max.

## 关键字

### 基本情况

- 使用JSON对协议进行表达

    ```JSON
        {
            "type":"data",
            "fmt":"json",
            "call":"app_anchor",
            "hide":""
            ...
        }
    ```

- 数据字符串化后的最大长度为256字节，便于方便的保存在链上。

### 关键字分类

- 根据type的不同，协议采用不同的关键字，v1版本目前支持3种type类型。
- 对于`Easy Protocol`不支持的关键字，将全部搜集到`un`关键字下。

#### 数据类型 ( data )

- `type`, must be `data`.
- `fmt`,数据格式，默认为`JSON`
- `hide`,直接的hide数据，或者指向到存储的anchor
- `auth`,直接的auth数据，或者指向到存储的anchor
- `trust`,直接的trust数据，或者指向到存储的anchor
- `salt`
- `call`,呼叫的cApp,会进行授权检测。当指定到限定的版本时，注意授权的问题 **bug，需要再考虑清楚**
- `args`,默认传给cApp的参数，用于默认配置。和外部参数冲突时，外部参数权限高
- `code`,
- `push`,

#### 程序类型 ( app )

- `type`, must be `app`.
- `fmt`
- `ver`
- `hide`
- `auth`
- `trust`
- `salt`
- `lib`

#### 资源类型 ( lib )

- `type`, must be `lib`. 资源库的授权需要考虑清楚 **bug，考虑是不是要支持授权，会带来很大的数据检索量，但是对开发者有利**，采用非强制显示方式。调用的时候，不检测权限。
- `fmt`
- `hide`
- `auth`
- `trust`
- `salt`
- `lib`, the cycle calling problem.
- `ext`
- `code`

## 错误处理

### 错误级别

### 错误列表

#### 数据类错误

#### 隐藏类错误

#### 权限类错误

#### 其他错误


- **------------------------以下部分为原来的，需要调整---------------------------------**

## 实现细节

### How To Launch

- The reversed keyword `type` is treated as the start of `Easy Protocol`, when the `protocol` data is a JSON string and the keyword is one of the JSON key. Then it is a `Easy Protocol` anchor.

![Easy Protocol Decode Map](../images/on_chain_linked_list.png)

- Anchor data will be checked as follow.

    1. Check Anchor `protocol`, if it is `JSON` format and do have the keyword `type`.
    2. By `type`, Anchor will be treated as three types, `DATA`, `APP` and `LIB`.
    3. Public support functions. `hide`,`auth` and `salt`.
    4. `APP` support functions. `call` and `push`.

- Anchor link checking need to read Anchor network data.

### Reversed Keywords

- Depending on different type, the reversed keywords group as following table.

    | Type | All | Public | Extend |
    | ------ | ----------- |----------- |----------- |
    | App | type,fmt,ver| [hide],[auth],[salt] | [lib] |
    | Data | type,fmt|[hide],[auth],[salt]|[code],[call],[push],[args]|
    | Lib | type,fmt | [hide],[auth],[salt]| [code],[lib],[ext] |

## Types of Anchor

### Data

- `type`, must be `data`.
- `fmt`
- `hide`
- `auth`
- `salt`
- `call`
- `args`
- `code`
- `push`

### App

- `type`, must be `app`.
- `fmt`
- `ver`
- `hide`
- `auth`
- `salt`
- `lib`

### Lib

- `type`, must be `lib`.
- `fmt`
- `hide`
- `auth`
- `salt`
- `lib`, the cycle calling problem.
- `ext`
- `code`

## Extend Functions

### Hide Target Anchor History

- If there is `hide` keyword in protocol, will check the target anchor `hide`.

- If theer is `salt` keyword in protocol, will check the target `hash( anchor + salt[1] )` to check hide block list. It is to avoid the same hash result.

- Important, the `hide` Anchor can be not owned to the owner of original Anchor. It means that the owner of Anchor can modify the target `hide` Anchor, in these cases, the same Anchor can act differently.

- Will use the latest anchor `hide`, historical ones can be used to track.

#### Authrity of Anchor

- If there is `auth` keyword in protocol, will check the target anchor `auth`.

- If theer is `salt` keyword in protocol, will check the target `hash( anchor + salt[0] )` to check authority list.

- Important, the `hide` Anchor can be not owned to the owner of original Anchor.

- Will use the latest anchor `auth`, historical ones can be used to track.

#### Library Management

- Easy Protocol support full on-chain application.

## Glossary

- Anchor
- Anchor Name
- Anchor Link
