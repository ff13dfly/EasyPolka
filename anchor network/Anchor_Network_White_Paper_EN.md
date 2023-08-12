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

- `Anchor Network introduces' anchor links' to locate 'chain anchor' data, using identifiers such as' anchor://'for identification, similar to hyperlinks. For example, when we need to access the data of * * hello * * on block * * n * *, it is expressed as** anchor://hello/n **This method is simple and clear, and even without the help of complex parsing systems, it can locate data on the chain, making it more intuitive compared to memoryless hashes. Taking * * hello * * as an example, the simplest expression for 'anchor link' is** anchor://hello **This means obtaining the latest data of * * hello * *.

- `Anchor Link 'provides support for multiple networks, with the addition of' @ network 'at the end to transfer information between different chains. The default is' Anchor Network'. This reserves the possibility for future heterogeneous networks, where even completely different blockchain networks can be accessed in a unified manner. This is a very interesting feature that can provide a unified access experience in completely heterogeneous networks, which will be a huge advantage for the development of * * Dapp * *.

- `Anchor links provide more features to support application development, especially for JSON data structures, using** anchor://anchor_name |Key_ The name * * method is used to read JSON data objects under a single 'chain anchor', improving the expressive power of the chain anchor and facilitating the development of * * Dapp * *.

#### Relationship

- Call association** Chain anchor A * * can specify a call to * * Chain anchor B * * in the protocol. In this way, data on the chain can be freely organized and form a network. This allows block data to not be isolated, but also makes historical block data meaningful, significantly improving the data utilization rate of the blockchain system. Support for this complex data network is the foundation for building large-scale applications. Even based on the characteristic of 'anchor link' spanning heterogeneous networks, a new form of cross chain has been implemented, where data can still be accessed with peace of mind while still on different networks.

- Combining ownership to create new business paradigms. When data from different owners is associated through 'chain names', it brings about issues of' authorization 'and' trust '. For example, the * * Dapp * * developed by account A is deployed on * * application A * *, while account B has a 'chain name' * * configuration A * *. Users can start * * application A * * through * * configuration A * *. In this use case, account B can composite its own required applications through different configurations without causing damage to the application itself. Even if the * * application A * * is unavailable, account B can disconnect the call association. For account A, it is possible to focus on the development and upgrading of the * * application A * *, which can be initiated through call association for many different configurations.

- `Chain anchors can also exist in the form of resource libraries for reference by other chain anchors. Due to the immutability of the 'chain anchor', this citation will be more secure. Even if resources are updated, the availability of references can be guaranteed by pointing to specific resources. This is similar to NPM's package management, but the data of these packages is published on the 'Anchor Network', is completely decentralized, and can also guarantee ownership.

#### Authority And Trust

- `The Anchor Network supports the interconnection of different chain anchors, which naturally creates a relationship between authorization and trust. The protocol implements these functions in a clearly specified manner. The protocol that supports the 'Anchor Network' will follow this authorization to process plaintext on chain data and implement intellectual property protection at the usage level. However, the data on the chain is plaintext, and authorization methods cannot protect the content from being read.

- `The 'authorization' of Anchor Network refers to the relationship between Chain Anchor and * * account * *, which is recorded in the protocol of Chain Anchor.

- `The 'trust' of Anchor Network refers to the relationship between Chain Anchor A and Chain Anchor B, recorded in the protocol of Chain Anchor A.

- `The Anchor Network protocol can also limit the time limits for authorization and trust, using block numbers for calibration. The blockchain network's block number has a time attribute and is suitable for use as an authorization period. For example, based on the block output speed, the block number corresponding to the authorization time can be calculated and written into the authorization information. However, due to the fact that the block output speed is not a strict time limit, the accuracy of this method is limited and cannot fully correspond to the real world time. Please note this when using it.

#### Declared Hidden

- `Declaring 'hidden' is a supplement to the tamper proof feature of blockchain. With the expansion of blockchain application scope, * * deletion * * is an unavoidable problem, such as an incorrect message or application that should be deleted, but this is difficult to achieve on the blockchain network` Anchor Network introduces the method of 'declaration concealment' to solve this problem, where the owner of the information hides the specified data through explicit declaration. Although this is not physically deleting data, in applications that follow the protocol, these 'declared hidden' data are indeed hidden and invisible.

- `Declaring 'hidden' is a supplement to the tamper proof feature of blockchain. With the expansion of blockchain application scope, * * deletion * * is an unavoidable problem, such as an incorrect message or application that should be deleted, but this is difficult to achieve on the blockchain network` Anchor Network introduces the method of 'declaration concealment' to solve this problem, where the owner of the information hides the specified data through explicit declaration. Although this is not physically deleting data, in applications that follow the protocol, these 'declared hidden' data are indeed hidden and invisible.

## Security

### Summary

- `The security of anchor network data itself is based on the basic security provided by * * Polkadot/Substrate * *, while ownership ensures the security of writes. The basic security for data storage has been established, and this system has been running stably for a long time. Practice has also proven the security of PoS` Anchor Network is a self starting network that supports the deployment and operation of * * Dapp * *, which has higher security requirements than simple data storage. We will compare the security of 'Anchor Network' from two aspects: one is compared to traditional centralized deployment, and the other is compared to other on chain storage solutions.

- Compared to traditional merchant self deployment, the * * Dapp * * deployed by 'Anchor Network' is more secure. Through the execution path below, it can be found that for * * Dapp * * deployed on the 'Anchor Network', it is only necessary to ensure that the 'loader' is secure and can be used with confidence. The immutability of running code also ensures the interests of merchants, avoiding the occurrence of operations and maintenance deleting libraries and running away, and even eliminating the need for operations personnel to maintain the availability of * * Dapp * *.

    ```
          不可控      重点部分     不可控      监督系统       监督系统
            |           |          |          |             |
            |           |          |          |             |
            V           V          V          V             V
        用户运行环境 --> 加载器 --> 访问链路 --> 链上应用 --> 其他区块链网络
    ```

- Compared to current on chain storage solutions, the main solution is * * IPFS * *. For * * IPFS * *, using independent hashes to calibrate files requires us to confirm that each file is executing a secure * * Dapp * *, and where to obtain these secure hashes becomes another issue` Anchor Network can continuously monitor * * Dapp * * through the method of 'chain name', not only establishing technical security, but also establishing trust in the security of 'chain name' through historical version tracing. Unlike the file storage of * * IPFS * *, 'chain anchors' can also organize resources on the chain, separating various dependencies of * * Dapp * *, and more conveniently ensuring the security of each component.

- As * * Dapp * * becomes increasingly complex, it will inevitably face more and more security issues. Ensuring security by limiting functionality is an effective way to process core financial data, which has also created the thriving 'Web3.0' world. However, with the expansion of application fields, 'Web3.0' requires a new security mechanism to ensure basic security requirements and also to cope with future problems` Anchor Network will make an in-depth attempt in this area, and the first step that can be achieved is to publish the * * Dapp * * itself in a tamper proof version, and subsequent measures can be based on this.

### Supervision On Chain

- `Anchor Network will establish a transparent monitoring system based on chain name. We believe that with the continuous development of 'Web3.0', there will be more and more malicious programs, and blindly blocking them will not be able to cope. 'Anchor Network' adopts a 'sparse' approach, and will assist in establishing a secure on chain * * Dapp * * ecosystem through transparent disclosure of * * white list * * and * * black list * *.

- **The whitelist * * is the 'chain name' of a trusted and verified * * Dapp * *, especially the 'loader' that is extremely important for security. It is recommended that users only use applications recommended by the whitelist. The whitelist can be maintained by different organizations, forming decentralized management. As the entire data history is recorded in the 'chain name', it is also convenient for users to understand and judge.

- **Blacklist * * refers to the publication of discovered malicious * * Dapp * * and * * malicious accounts * *` The loader uses a blacklist to indicate the operational risks of * * Dapp * * for users to make their own judgments. The blacklist is maintained by different organizations, forming decentralized management. For * * Dapp * * deployed on the Anchor Network, institutions or individuals maintaining blacklists can evaluate and judge the application as soon as possible, providing valuable information to users.

- Establishing a 'Web3.0' world that relies entirely on algorithmic security is equivalent to looking at the future from the current perspective, which will limit future development` Anchor Network establishes the smallest open supervision mechanism through * * on chain supervision * *, forming * * white list * * and * * black list * *, without increasing the complexity of Anchor Network and ensuring that future problems can be solved in the future.

## Components

### Anchor Pallet

- Data storage. The function of writing 'anchor' data onto the chain is based on * * Polkadot/Substrate * * to build a blockchain system using Anchor Pallet's setAnchor single method to store all on chain data.

- Data transactions. Trading on 'chain names' supports two methods:' free trading 'and' targeted trading ', with the owner pricing independently to achieve the trading function. No need for third-party intervention, relying solely on sellAnchor, buyAnchor, and unsellAnchor in Anchor Pallet to achieve a complete transaction loop.

### Default Protocol

- `The Anchor Network supports custom running protocols, but the network itself is only responsible for storing protocol data, and protocol execution relies on third-party libraries. Of course, this third-party JS library can be stored on the Anchor Network itself** The data of Dapp * * is stored on the 'Anchor Network', and when the on chain program running by the 'loader' starts, it can completely rely on the on chain data, which is the * * self bootable blockchain network * *.

- `Anchor Network uses' Easy Protocol 'by default to achieve various expected goals. This is a simple human-machine readable protocol that uses JSON as the protocol data format` Easy Protocol solves the problems of on chain data positioning and on chain data relationships, integrating on chain resources into a scalable framework, laying a solid foundation for establishing complex 'full chain applications'` Easy Protocol 'is an extensible protocol that reserves possibilities for more diverse applications in the future.

#### Bootstrap

- The 'Anchor Network' is a self bootable blockchain network that requires a 'loader' to start. Its main function is to connect to network nodes, parse chain anchors, obtain data, and then start applications. Meanwhile, the 'loader' itself can also be published to the 'Anchor Network'. At this point, a 'downloader' is needed to obtain it. This seems to have formed the problem of whether the existing chicken or the egg came first. On the Anchor Network, whether you have a chicken or an egg in your hand, you can successfully connect to the network and fully utilize various resources and applications on the chain. The loader needs to achieve complete support for both the front-end and back-end, both using Javascript, and the back-end needs to run with Node.js.

- `The 'Downloader' is a program used to download applications on the chain, which can download applications on the 'Anchor Network' locally. When you first encounter 'Anchor Network', this is the first stepping stone. After obtaining the 'loader' through the 'downloader', you can enjoy your 'Web3.0'.

- `The existence of loaders can improve the security of full chain applications` The loader passes restricted APIs to the full chain program, which brings two benefits: firstly, it can enhance some security, and secondly, it improves the development efficiency of the full chain program. In the future, the functionality of the loader can be implemented on the browser side to form a more secure sandbox environment, with a system level sandbox environment provided by the browser.

#### Chain Application

- Non modifiable on chain deployment` One of the main advantages of full chain applications is that they can be deployed transparently and publicly. Although this increases the requirements for release, it requires more thorough testing or a good separation of the program and configuration. That is to say, by deploying on chain, the application will be more robust. At the same time, it also left an indelible footprint in the world of 'Web3.0', seeing your contributions to a better 'Web3.0'.

- Support the implementation of complex logic. It can be found that fully functional APIs can empower developers to connect to various existing services, whether they are 'Web3.0' or * * Web2.0/Web1.0 * *. At the same time, Anchor Network also has easy-to-use online linked lists to store data. By combining the two, many complex functions can be achieved, supporting the development and release of non-financial 'full chain applications'.

- Flexible authorization methods` Full chain applications need to be able to support flexible authorization methods to establish a healthy environment and enable developers to focus more on functional implementation. Authorization can be divided into account authorization and chain name authorization, and the authorization period can be unlimited or authorized to a specified block number.

- Extremely low development threshold. No need to consider complex token economics anymore, focusing on solving various problems in the 'Web3.0' model. When 'Anchor Network' is considered a feasible runtime environment for 'full chain applications', using its SDK development will be very convenient. It only takes about one day of learning, and you can start developing your own' full chain applications'.

- Full chain applications that can be traded. This is a great convenience brought by the 'Anchor Network', where you can trade with the Anchor at any time, and endogenously support the realization of 'full chain applications', not just through the business model established by the' full chain applications' themselves to make money. This is a problem that non-financial 'full chain applications' must solve, forming a sustainable and profitable closed-loop, rather than creating a drumming and flower spreading environment.

### Toolbox, called EasyPolka

#### Local Simulator

- `The local testing program for Anchor Network is a fast network with a block output speed 10 times that of the main network of Anchor Network, making it convenient for local debugging. It can run with just one command line and has exactly the same functionality as' Anchor Network '.

- Local testing network is very important for debugging. Based on the characteristics of 'Anchor Network', the deployment of 'full chain applications' needs to be cautious. After thorough testing, it is a good way to release, which can save tokens and reflect your professional demeanor.

#### Anchor SDK

- `The basic access protocol of Anchor Network can achieve all the functions of chain anchor, mainly including two parts: storage and transaction. At the same time, it is also necessary to support account verification and access to basic network information.

- **AnchorJS * * is an SDK for Javascript that can implement all operations of Anchor Pallet and requires support from '@ Polkadot/api'.

#### Convertor

- `Converter is a tool that converts existing applications into full chain applications that can be deployed on Anchor Network, and can be developed based on any language. This can help developers quickly experience the similarities and differences between 'Web3.0' full chain applications and * * Web2.0/1.0 * * applications. It can also quickly convert many existing tasks into 'full chain applications', such as various UIs of * * Dapp * *.

- `The converter itself is also deployed on the Anchor Network and can be obtained using the Downloader. The conversion process is implemented locally by the customer, and there is a problem of whether the usage environment matches. Special attention should be paid when using it` Converters can be developed in different languages, and the conversion objects can also be different application programs.

#### Loader

- `The function of the loader is to read the on chain data of the Anchor Network, form executable applications or data, and then run it` The loader can establish a secure sandbox environment to further improve the security of full chain applications, mainly through two aspects. One is to provide account verification and on chain interaction functions, which are passed to the 'full chain application' through parameters; The second is to provide regulatory functions, read regulatory data, and provide prompts for the security of 'full chain applications'.

- From the perspective of application scenarios, it can be divided into front-end loaders and back-end loaders. The front-end loader is implemented based on a browser, mainly for Javascript applications, which can be executed in a browser environment. For the backend, 'Anchor Network' recommends using Node.js, so that the entire 'Web3.0' program can be built with just Javascript.

- `The loader supports external input parameters and can easily configure 'full chain applications', improving the convenience of using' full chain applications'.

#### Downloader

- `The downloader is a tool that integrates the on chain data of the Anchor Network according to the protocol and packages it into a single file for download. The main function is to download the on chain program that needs to run locally, so its security is extremely important, otherwise it will not be able to obtain the correct on chain program.

- `The downloader is also a full chain application, deployed on the Anchor Network, creating an interesting loop. You can run the 'downloader' through the 'loader' or obtain the 'loader' through the 'downloader'. Therefore, just ensure that you have one of the two, and you can use 'Anchor Network' to link to the entire 'Web3.0' network.

#### Plinth

```TEXT
    Loader -->  Plinth  -->  cApp/Data  -->  APIs  -->  Web3.0/Web2.0/Web1.0
                |             |           |               
                | on-chain    | on-chain  | on-chain      
                |             |           |               
                V             V           V
    ----------------------------Protocol---------------------------
                |             |           |               
                V             V           V
    -----------------------------Anchor----------------------------
    ----------------------------Polkadot---------------------------
```

- `Plinth 'is a' Anchor Network 'browser that allows for easy viewing and running of various data on the' Anchor Network ', and can be used as an entry point to' Web3.0 '` Plinth 'is also a' full chain application 'that only requires a' loader 'to run without the need for local execution.

- `Plinth provides a data search function that facilitates the retrieval and viewing of detailed data on the Anchor Network, tracing the history of the data.

- `Plinth also provides a sandbox environment for running 'full chain applications', making it easy for you to grasp the running status of' full chain applications',

#### Gateway

- `Gateway is a rapidly deployable full chain microservice framework provided by Anchor Network, helping developers develop complex full chain applications. This framework only requires a backend 'loader' to run the entire microservice system, whether it is a variety of different microservices or a configured running environment. This can liberate operations and maintenance, as long as you can connect to the 'Anchor Network', the backend system of this application can run normally, possibly with just one command line.

- A universal open microservice that provides plug and play microservices for basic applications, reducing the threshold for developers. For example, Anchor's data caching, account compression services, and managed account writing services. This will greatly improve the user experience of 'full chain a

## Resource

- [Substrate](https://substrate.io)
- [Polkadot](https://polkadot.network)
- [Anchor Network Homepage](https://metanchor.net)
- [Anchor Pallet](https://github.com/ff13dfly/Anchor)
- [EasyPolka Github](https://github.com/ff13dfly/EasyPolka)
