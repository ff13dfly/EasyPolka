# Easy Protocol ( v1.0 )

## Overview

* `Easy Protocol` is a protocol to load Chain Application ( `cApp` in short ). It is a JSON based protocol, now `version 1.0`, follow the [JSON format standard](http://json.org).

* `Easy Protocol` solve the relationship between on-chain data. Follow this, on-chain data can call `cApp` to decode it. Then the blockchain network which support `Easy Protocol` is a bootstrap system, can be accessed fully by a single entry.

![a image show the relationship of Anchors]()

* `Easy Protocol` is not case sensitive. The max length of an `Easy Protocol` is 256 Bytes.

* `Easy Protocol` do not check the code valid.

## Data Structure

### Anchor

* Anchor data sample as follow. On-chain data is trustable, linked list way can save the storage and make every step of development meanful.

    ```Javascript
        {
            name:"",        //unique name, called `Anchor Name`
            raw:"",         //code or customized data
            protocol:{      //Easy Protocol content
                ...
            }
            pre:0,          //block number of previouse anchor data
        }
    ```

* Ownership. Anchor must be owned to single one account. Only the owner can modify the Anchor, and every modification must be storaged.Ownership can be transfered, but the history data must be linked to the owner when data was updating.

* Unique Anchor name. Like Domain Name, Anchor Name is unique on blockchain network.

* On-chain Linked List.

### Anchor Link

* Anchor Link is a text to locate the blockchain network data. It can be easy read and load `cApp` properly. Samples as follow:

    ```TEXT
        anchor://hello/
        
    ```

* Charactor `?` is reversed, the name which including `?` is not supported by `Easy Protocol`.

### Anchor Raw Data

* Anchor Raw Data is used to storage code.

* The max Anchor Raw data length is 4MB max.

## Processing Details

### How To Launch

* The reversed keyword `type` is treated as the start of `Easy Protocol`, when the `protocol` data is a JSON string and the keyword is one of the JSON key. Then it is a `Easy Protocol` anchor.

![Easy Protocol Decode Map](../images/on_chain_linked_list.png)

* Anchor data will be checked as follow.

    1. Check Anchor `protocol`, if it is `JSON` format and do have the keyword `type`.
    2. By `type`, Anchor will be treated as three types, `DATA`, `APP` and `LIB`.
    3. Public support functions. `hide`,`auth` and `salt`.
    4. `APP` support functions. `call` and `push`.

* Anchor link checking need to read Anchor network data.

### Reversed Keywords

* Depending on different type, the reversed keywords group as following table.

    | Type | All | Public | Extend |
    | ------ | ----------- |----------- |----------- |
    | App | type,fmt,ver| [hide],[auth],[salt] | [lib] |
    | Data | type,fmt|[hide],[auth],[salt]|[code],[call],[push],[args]|
    | Lib | type,fmt | [hide],[auth],[salt]| [code],[lib],[ext] |

## Types of Anchor

### Data

* `type`, must be `data`.
* `fmt`
* `hide`
* `auth`
* `salt`
* `call`
* `args`
* `code`
* `push`

### App

* `type`, must be `app`.
* `fmt`
* `ver`
* `hide`
* `auth`
* `salt`
* `lib`

### Lib

* `type`, must be `lib`.
* `fmt`
* `hide`
* `auth`
* `salt`
* `lib`, the cycle calling problem.
* `ext`
* `code`

## Extend Functions

### Hide Target Anchor History

* If there is `hide` keyword in protocol, will check the target anchor `hide`.

* If theer is `salt` keyword in protocol, will check the target `hash( anchor + salt[1] )` to check hide block list. It is to avoid the same hash result.

* Important, the `hide` Anchor can be not owned to the owner of original Anchor. It means that the owner of Anchor can modify the target `hide` Anchor, in these cases, the same Anchor can act differently.

#### Authrity of Anchor

* If there is `auth` keyword in protocol, will check the target anchor `auth`.

* If theer is `salt` keyword in protocol, will check the target `hash( anchor + salt[0] )` to check authority list.

* Important, the `hide` Anchor can be not owned to the owner of original Anchor.

#### Library Management

* Easy Protocol support full on-chain application.

## Glossary

* Anchor
* Anchor Name
* Anchor Link
