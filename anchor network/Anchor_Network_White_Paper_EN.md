# Anchor Network White Paper, A Bootstrap Web3.0 Network

Author: Billy Fu, Victor
Date: August 2023

## Overview

- The Blockchain brought by **Bitcoin** has been thriving for a period of p time, and **Ethereum Smart Contract** have also enriched the blockchain. But until today, normal user only hear of Bitcoin, as Web3.0 applications, it is mainly **Trade Market**. For normal user **uselessness** and **hard-to-use** are the main obstacle.Various of `Web3.0` Dapps are only concentrating in finance such as Defi and NFT, and non-financial Dapps is not popular totally. Although from tech view, the intrinsic attribute of blockchain can indeed benefit non-financial Dapps, such as immutable features, stable decentralized networks, and robust account systems.

- Either from the spillover of blockchain or the increasingly prosperous financial Dapps, the breakpoint of non-financial Web3.0 is not far away. Where and how to break is becoming a question. `Anchor Network` is the result of such thinking, making the access to `Web3.0` much more simple, the development part especially. This way, more developers will join Web3.0 trying to break through. 

- `Anchor Network` is based on **Polkadot/Substrate** which is an ecosystem do have ability to connect to other blockchain networks. By another hand, Anchor Network can be used for Web3.0 Dapp deployment, these Dapps do connect to various blockchain networks transparently. It is a Dapp level cross-blockchain way which is new way to develop cross-blockchain Dapps.

- `Anchor Network` make use of `Anchor` as the primitive data structure, which is a piece of on-chain data, orginaized by block number and can be accessed by `Anchor Name` taking place of blockchain hash. `Anchor Link` is a simple way to locate the on-chain data the same as **URL**. By this way, the data on chain can be grouped organically to support complex Dapp. `Anchor Network` provides a convenient SDK to avoid the complex concepts of `Web3.0` and full toolchain (including protocols, loaders, microservice frameworks, etc.). It make one-day leaning to join Web3.0 possible.

- `Anchor Network` supports the `Easy Protocol` as default, this protocol solves the problem of relationship between on-chain data and on-chain application, it can conveniently locate resources on chain. This protocol also supply a way to solve the privacy of blockchain called `Declared Hidden`. This scalable `Easy Protocol` support on-chain application、library and resource to implement complex Dapp.

- Security is an important aspect of Web3.0, and Anchor Network pay close attention to it. `Anchor` on `Anchor Network` has ownership attributes, which makes account security extremely important. Unlike Web2.0/Web1.0, accounts are the foundation of everything for Web3.0 and cannot be restored through decentralized methods. `Anchor Network` take the strategy of reducing and controlling the risk points to solve security issues compared to current acceptable solution.

## Vocabulary

- `Anchor Network`,a bootstrap Web3.0 network base on Polkadot/Substrate.
- `Anchor`，the primitive data structure on Anchor Network.
- `Anchor Name`, the name to access Anchor linked-chain data on Anchor Network, utf-8 supported.
- `Anchor Link`，URL way to locate the on-chain data.
- `Web3.0`, decentralized network with ownership attributes.
- `Trust`, relationship between Anchors.
- `Authority`，relationship between Anchor and account.
- `Declared Hidden`, the way of hiding Anchor, Dapps following this will not display the data.
- `Loader`, tool to load on-chain Dapps from Anchor Network.
- `Downloader`，tool to download on-chain Dapps as single file from Anchor Network.
- `Convertor`, tool to convert web application and deploy on Anchor Network.
- `EasyPolka`, the name of development kits supplied by Anchor Network.
- `Plinth`, Anchor data browser.
- `Easy Protocol`, declaring relationship between on-chain data and on-chain application protocol default supported by Anchor Network.

## Solution

- **Single entry**. Currently `Web3.0` development has become much simpler, but compared to the development of `Web2.0/Web1.0`, it is still much higher. Web3.0 has many gaps, such as dispersed tool chain and alternative development partern, that will be more difficult in non-financial Dapps devepolment. `Anchor Network` treat the blockchain as a simple key-value storage systems, Dapp can read/write on sinlge `Anchor Name`. The `Anchor Data` is orginazed as **linked list** on chain. Either `Web3.0` or `Web2.0/Web1.0` benifit from this single entry way, no more concern about the blockchain complexity.

- **Simple economics**. As everything tokenized, the various of tokens has become increasingly complex, then it is pretty hard to understand and join, especially for beginners. `Anchor Network` do have simple and understandable economic logic, that is **storage cost** and **free to sell**.  This simple logic is already common knowledge in the real world and can be easily caught. The complex token is left to the professional third party on `Anchor Network`, just call the APIs of them. `Anchor Network` is trying this simple economics to establish a self consistent network in the Web3.0 world.

- **Your Web3.0**. Anchor Network fully embodies an important feature of Web3.0. The chain name and anchor have clear ownership, even if you have no knowledge of Web3.0, you can still have a chain name to truly experience Web3.0 ownership, rather than being a bystander and participating through reading news. Meanwhile, for the development of Dapp, owning it brings great convenience, allowing different programs to run on the same network, establishing rules for data interaction without damaging data. Anchor Network is such a blockchain network.

- **Full on chain**. Popular Smart Contract has brought about the flourishing of Dapp, as more and more Dapp on live, the centralized deployment trending is on the table. Dapps are deployed by developers on their respective servers, althought the support Smart Contract is running on decentralized blockchain network, we can not call this is a decentralized way. This centralized control brings the risk of user account exposure and the inability of Dapp review. For example, a centralized exchange market has a clear understanding of user behavior. `Anchor Network` solve this by putting the whole Dapps on chain even the UI publicly, developer can store the data to the `Anchor Name`, then the Dapp is decentralized totally.

- **Single Javascript**. Javascript has proven itself through its strong vitality and has been applied to many parts of blockchain development, even the Solidity for Smart Contract is similar to Javascript. For non-financial development, Javascript also has inherent advantages, such as plenty of framework and tools can be used. `Anchor Network` will help these frameworks on chain to make Web3.0 development easy.

- **Out of the box**.

### Current Situation

- ****,

- ****,

- ****,

### Issues

- **Execution efficiency problem**.

- **Code safety to care about**.

## Architecture

    ```
        Loader -->  Data    -->  APIs  -->  Web3.0/Web2.0
                    |             |                        
                    | on-chain    | on-chain      
                    |             |                      
                    V             V          
        -------------------Protocol---------------------      
                    |             |                          
                    V             V           
        -------------------Anchor-----------------------
        -------------------Polkadot---------------------
    ```

### Data Lay

#### Storage

#### Data Trade

### Protocol Lay

#### Location

#### Relationship

#### Authority And Trust

#### Declared Hidden

## Security

### Summary

### Supervision On Chain

## Components

### Anchor Pallet

### Default Protocol

#### Bootstrap

#### Chain Application

### Toolbox

#### Local Simulator

#### Anchor SDK

#### Convertor

#### Loader

#### Downloader

#### Plinth

#### Gateway

## Resource
