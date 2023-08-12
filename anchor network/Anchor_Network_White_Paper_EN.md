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

- **Your Web3.0**. Ownership is an an important feature of Web3.0, Anchor Network fully support this, either `Anchor Name` or `Anchor Data` is well defined. As owning an `Anchor Name` is pretty simple, even if you have no knowledge of Web3.0, you can still have an `Anchor Name` to explorer Web3.0 yourself, rather than being a bystander or news reader.  Meanwhile, for the development of Dapp, owning it brings great convenience, allowing different programs to run on the same network, establishing rules for data interaction without damaging data. `Anchor Network` is such a blockchain network that everyone can join easily.

- **Full on chain**. Popular Smart Contract has brought about the flourishing of Dapp, as more and more Dapp on live, the centralized deployment trending is on the table. Dapps are deployed by developers on their respective servers, althought the support Smart Contract is running on decentralized blockchain network, we can not call this is a decentralized way. This centralized control brings the risk of user account exposure and the inability of Dapp review. For example, a centralized exchange market has a clear understanding of user behavior. `Anchor Network` solve this by putting the whole Dapps on chain even the UI publicly, developer can store the data to the `Anchor Name`, then the Dapp is decentralized totally.

- **Single Javascript**. Javascript has proven itself through its strong vitality and has been applied to many parts of blockchain development, even the Solidity for Smart Contract is similar to Javascript. For non-financial development, Javascript also has inherent advantages, such as plenty of framework and tools can be used. `Anchor Network` will help these frameworks on chain to make Web3.0 development easy.

- **Out of the box**. `Anchor Network` also has an advantage of having many out of the box micro services. Traditional open source has promoted the development, but it also faces the issue of usage barriers. When you want to use an open source project, the running environment and system debugging can be huge challenges.This situation will be greatly improved on `Anchor Network`. Based on the same protocol and `Loader`, applications deployed on the chain can be easily run, and in most cases, only one command line is needed. Also because of the same protocol, there are many common requirements, and the solutions to these requirements are deployed on the `Anchor Network`, and you only need to call and run them.

### Current Situation

- **Centralized Way**. The mainstream implementation method is `Web3.0 Smart Contract` plus `Web1.0/Web2.0 UI`. Without `Web1.0/Web2.0 UI`, ordinary users are almost unable to use `Web3.0 Smart Contract`. That is to say, the existing **Dapp** relies on centralized deployed UI heavily, but the maintenance and security of the UI end completely depend on its developers.Take Bitcoin as example, even if you want to run a Bitcoin terminal, you still need to go to the official Bitcoin website and download the Bitcoin application to run it, which is also a completely traditional way. The concept of decentralization deployment has encountered difficulties today.

- **Part of eecentralized way**. It is a decentralized storage method with the goal of distributed data storage, which solves the problem of distributed storage of large amounts of data, such as large files such as images and videos. There is also a problem of difficulty in use, as the hash used for labeling cannot be accessed solely by memory. With the widespread application of 'Web3.0' in the future, a chain name system that can calibrate 'Web3.0' resources, that is, the domain name system of the 'Web3.0' world, is also emerging. However, * * IPFS * * cannot support this approach.

---------TODO, modified here-----------

- **High operation and maintenance costs**. Deploying full chain applications based on existing methods, whether it is * * Dapp * * development or deployment operation and maintenance, requires a huge investment of manpower and high chain up costs. The blockchain system, which mainly handles financial transactions, has very limited storage space. If the data is stored throughout the entire chain, it will bring huge upchain costs` Anchor Network, as a blockchain system specifically designed for deploying * * Dapp * *, has been optimized to address this situation, providing complete toolchain support for 'full chain applications' and allowing for low-cost deployment of * * Dapp * * on the chain. At the same time, the 'full chain application' eliminates the hassle of operation and maintenance, once again reducing the development cost of * * Dapp * *.

### Issues

- **Execution efficiency problem**. Due to the fact that all data exists on the chain, there will be complex access issues, which directly lead to a decrease in execution efficiency and an additional process of retrieving and downloading data. It can be solved through a trusted caching server. The so-called trusted cache server refers to a server program where all code is published on the chain and can be run directly, thus avoiding security issues with intermediate servers. When the server program started by oneself is trusted, the front-end program using this service is also trusted, which can safely use cached data and improve execution efficiency. This method can also quickly deploy distributed systems to meet system response requirements.

- **Code safety to care about**. Code security` The execution of applications on Anchor Network relies on the client and is also a more complex operation. Compared to services or smart contracts running on server nodes, security is significantly reduced, facing at least three challenges.
    1. Security of obtaining data
    2. Safety during execution
    3. Security of external requests

Therefore, we can find that there are two best practices in the 'Anchor Network'.
    1. Just consider 'Anchor Network' as a deployment site, similar to Javascript package management.
    2. Use 'chain anchors' for program development, storing data directly in the' Anchor Network '.

## Architecture

- `Anchor Network is divided into two parts: data layer and protocol layer. Data layer, running on blockchain nodes, i.e. [Anchor Pallet]（ https://github.com/ff13dfly/Anchor ）Complete the reading and writing of the 'chain anchor' and the transaction of the 'chain name'. The protocol layer is the * * protocol * * field of the 'chain anchor', used to define the operation mode and data association of the data on the chain. This can support the full chain * * Dapp * * release, and through the 'loader', a self starting blockchain network, the 'Anchor Network', can be achieved.
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

- `Anchor Network organizes data using * * on chain linked lists * *, retrieves data using KV's approach, and provides customizable atomic data structures, known as' chain anchors'. Adopting this approach mainly solves two problems: firstly, all on chain data can be regarded as a KV storage, with extremely low understanding threshold; The second is to reduce the overhead of on chain states through linked lists, laying the foundation for long-term operation` The data storage of chain anchor is divided into two parts, * * data * * and * * protocol * *, which balance storage and data parsing. Currently, it has been implemented through Pallet, [Anchor Pallet]（ https://github.com/ff13dfly/Anchor ）

- `Anchor Networ uses' chain name 'to solve the problem of memory of resources on the chain. Blockchain has brought hashing to the public and made them aware of this secret learning product. However, for humans, hashing is almost impossible to remember, as we have seen on exchanges. You can remember the abbreviations corresponding to smart contracts, such as Poka's DOT, but it is almost impossible to remember the contract address. So 'Anchor Network' uses a name service similar to a domain name to solve this problem. For example, if we name the on chain resource browser 'Plinth', you can access and run it on the 'Anchor Network' using this simple and memorable name.

- The inherent characteristic of on chain storage is ownership, which ensures that complex applications can be established on the 'Anchor Network' that are non-interference and easy to read. Even in the development practice of * * Web2.0/Web1.0 * *, such as database systems, permission management has played an important role in ensuring data security. When this advantage is applied to all on chain data, its convenience will bring unexpected advantages to * * Dapp * * development. For example, for the same data source, many interesting 'full chain applications' can be born.


#### Data Trade

- `The data of Anchor Network has ownership, and when this ownership can be transferred, data transactions are achieved, which is a very intuitive and does not require intermediary participation. Whether it is the commercial value inherent in the concise 'chain name' itself, or the data recorded under the 'chain name', it can become the transaction subject of this method. The method of free pricing also helps to form a natural market and further activate 'chain name' transactions. This is different from domain name transactions in the era of * * Web2.0/Web1.0 * *. When a 'chain name' is traded, its associated historical content will also be transferred without the need for secondary delivery of domain names and applications. This helps to form a business paradigm for 'Web3.0' development, a model of first detecting results before delivering.

- `Chain name trading can be divided into two ways: one is a transaction where everyone can participate, first come, first served; One type is targeted transactions with designated recipients, which other users cannot purchase. This provides a secure trading foundation without any unexpected loss of digital assets. Compared to the continuous recharge method of domain names, 'chain name' adopts a method of * * having it all at once and no more fees * *. After initialization, there are no more maintenance fees.

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
