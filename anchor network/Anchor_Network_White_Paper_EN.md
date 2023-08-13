# Anchor Network White Paper, A Bootstrap Web3.0 Network

- Author: Billy Fu, Victor
- Date: August 2023

## Overview

- The Blockchain brought by **Bitcoin** has been thriving for a period of p time, and **Ethereum Smart Contract** have also enriched the blockchain. But until today, normal user only hear of Bitcoin, as Web3.0 applications, it is mainly **Trade Market**. For normal user **uselessness** and **hard-to-use** are the main obstacle.Various of `Web3.0` Dapps are only concentrating in finance such as Defi and NFT, and non-financial Dapps is not popular totally. Although from tech view, the intrinsic attribute of blockchain can indeed benefit non-financial Dapps, such as immutable features, stable decentralized networks, and robust account systems.

- Either from the spillover of blockchain or the increasingly prosperous financial Dapps, the breakpoint of non-financial Web3.0 is not far away. Where and how to break is becoming a question. `Anchor Network` is the result of such thinking, making the access to `Web3.0` much more simple, the development part especially. This way, more developers will join Web3.0 trying to break through. 

- `Anchor Network` is a blockchain network based on **Polkadot/Substrate** which is an ecosystem do have ability to connect to other blockchain networks. By another hand, `Anchor Network` can be used for Web3.0 `Dapp` deployment, these Dapps do connect to various blockchain networks transparently. It is a Dapp level cross-blockchain way which is new way to develop cross-blockchain Dapps.

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

- **Part of eecentralized way**. **IPFS** is a decentralized storage network with the goal of distributed storage, such as large files such as images and videos. **IPFS** is the most popular decentralized storage right now. But the difficulty is hard to orginize the stucture data, unique hash is used to label the decentralized file which is not human-being way to remember. The files is isolated, Dapps need extra effects to put them together to implement complex functions. With the widespread application of `Web3.0` in the future, Name System that can calibrate `Web3.0` resources is also emerging , as the domain name of `Web3.0`. However, **IPFS** cannot support this.

- **High operation and maintenance costs**. Deploying full on-chain Dapp today, both the **Dapp** development and  DevOps, require huge manpower and high on-chain fee. Blockchain network, which is designed for financial transactions mainly, has very limited storage. That's why the cost is pretty high when you want to deploy the Dapp full on chain.`Anchor Network` is designed to support Full-chain Dapps, make the deployment on chain much cheap. The DevOps will also be easy as the data and application grouped on `Anchor Name`.

### Issues

- **Execution efficiency problem**. Due to the fact that data is public storaged on chain, the access problem will be complex,  which directly lead to a decrease in execution efficiency and an additional process of retrieving and downloading data. This problem can be solved through a trusted caching server. The so-called Trusted Cache Server is Dapp full on chain and can be run directly, thus avoiding security issues with intermediate servers. When the server program started by yourself is trusted, the front-end application using this service is also trusted, this improves execution efficiency. This method can also be used to  deploy huge distributed systems quickly, meet system response requirements.

- **Code safety to care about**. The full on chain Dapp which is more complex than fincial Dapps right now will be run at client side, there will be more breakpoint than the Smart Contract running on server. Facing at least three challenges. 
    1. Security download
    2. Safety during execution
    3. Security of external requests

    Therefore, we can find that there are two best practices on `Anchor Network`.
    1. Just treat `Anchor Network` as a deployment server, similar to Javascript package management.
    2. Full on chain development base on `Anchor Network`, storage all data on chain.

## Architecture

- `Anchor Network` is combined by two parts: `Storage Lay` and `Protocol Lay`. The storage part, running on Anchor Network nodes, can read/write data on chain and trade the `Anchor Name`. The protocol part, defined the data on chain and relationship of the data, support full on chain Dapps. With the `Loader` suppot such protocol, `Anchor Network` is a bootstrap blockchain network.

`Anchor Network` running workflow
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

### Storage Lay

#### Storage

- `Anchor` is the basic data structure of `Anchor Network`. It is an `On-chain Linked List` which can be accessed by `Anchor Name`, thus you can tread `Anchor Network` as a `Key-value Storage System`. Adopting this approach solves two problems: first ofa all, on-chain data can be regarded as a KV storage, extremely easy to understanding; Secondly, this way reduce the overhead of on-chain states through **Linked List** to avoid **state explosion**. Currently, it has been implemented through [Anchor Pallet](https://github.com/ff13dfly/Anchor).
![Anchor Data structure]()

- Memorable `Anchor Name` is a great feature of `Anchor Network`. Blockchain has brought **Hash** to the public and made them aware of this cryptographic concept, However, for human beings, **Hash** is almost impossible to remember. As we can seen on exchange market, you can remember the abbreviations corresponding to Smart Contract, such as **DOT**, but it is almost impossible to remember the contract hash address. By `Anchor Name` way, `Anchor Network` solve this problem as the domain system did to IP address. For example, we name the on-chain resource browser `Plinth`, you can access and run it on `Anchor Network` by using this memorable name.

- Ownership of `Anchor Name` and `Anchor Data` is another great feature. This ensures that complex applications can be established on `Anchor Network`. Even in the development practice of **Web2.0/Web1.0**, such as database systems, permission management has played an important role in ensuring data security.  When this advantage is applied to all on-chain data, its convenience will bring unexpected advantages to `Dapp` development. For example, even the same data source, many interesting `full on chain Dapps` can show in different way to meet multi requirement.

#### Data Trade

- `Anchor Name` can be decentralized traded. `Anchor Name` is owned to an unique account, when the ownership can be changed by paying, it is called trade naturally. Whether it is the commercial value inherent in the concise `Anchor Name` itself, or the data recorded under the `Anchor Name`, it can become the transaction subject by this way. Free price helps to form a market and activate `Anchor Name` trades. This is different from domain name trade at **Web2.0/Web1.0** time. When a `Anchor Name` is traded, its associated historical data will also be transferred without more delivery. This may form a business partten for `Web3.0` development, the model of **checking result before delivering**.

- Two ways of `Anchor Name` trade, free and designated. In free way, owner of `Anchor Name` set a price to sell, anybody accept the price can buy it. In designated way, seller need to set both price and buying account address, then only the target account can buy this `Anchor Name`. This provides a secure trading foundation without any unexpected loss of digital assets.

- One-time fee of initialization. Compared to the continuous recharge way of domain names, `Anchor Name` adopts a method of **One-time fee**, after initialization, there are no more maintenance fees.

### Protocol Lay

#### Location

- `Anchor Link` is the expression for locating the resouce on `Anchor Network`. A normal format is like **anchor://hello/123/**, similar as hyperlinks. This **anchor://hello/123/** means the data on block number **123** follow the `Anchor` named as **hello**, **anchor://** is the identification of `Anchor Link`. This way is simple and clear, and even without the help of complex parsing system, it can locate data on blockchain network, making it more intuitive compared to unmemorable hash. Still take **hello** for example, the simplest expression of `Anchor Network` is **anchor://hello** which means the latest data of `Anchor` **hello**.

- `Anchor Link` can support  multiple network, with the addition of **@network** at the end of expression to declare different chains, the default is `Anchor Network`. This reserves the possibility for future heterogeneous blockchain networks, even completely different blockchain networks can be located by a same way, which will be a huge advantage for the development of **Dapp**.

- `Anchor Link` provide more features to support **Dapp** development. Especially for JSON format, for example, **anchor://anchor_name|key_name** is used to locate JSON data objects under a single `Anchor`, improving the expressive power of `Anchor` and facilitating the **Dapp** development.

#### Relationship

- Call function. **Anchor_A** can call **Anchor_B** by following the `Anchor Network` protocol. In this way, data on-chain can be freely organized and well grouped. This make the blockchain data not isolate, and alse make the historical data meaningful, significantly improving the data utilization rate of the blockchain network. Support for such complex data sturcture is the foundation of building scaleable Dapp. As `Anchor Link` support heterogeneous blockchain networks, by calling a heterogeneous network, we can say it is a new way to cross chain.

- Configuration and **Dapp** isolatation. When data of different owners is associated through `Anchor Name`, it brings about issues of `authority` and `trust`. For example, the **Dapp** developped by **account_A** is deployed on `Anchor` **app_A**, **account_B** have a `Anchor` named **config_A** which call the **Dapp** **app_A**. In this use case, **account_B** can composite its own required as **config_A** to call **app_A** without any change to the **Dapp** itself. Then developper only need to focus on **Dapp**.

- Library and resource form of `Anchor`.  It means that `Anchor` can be treated as library or resource called by other `Anchor`.Due to the immutability of the `Anchor`, this citation will be more security. Even if resources are updated, the availability of references can be guaranteed by pointing to specific resource. This is similar to package management, but the data of these packages is published on the `Anchor Network` completely decentralized, and can also guarantee ownership.

#### Authority And Trust

- `Anchor Network` supports the interconnection of different `Anchor`, then the relationship is created naturally as `Authority` and `Trust`. The protocol that supports the '`Anchor Network` will follow this authorization to process plaintext on `Anchor` and implement intellectual property protection at the usage level. However, the data on chain is plaintext, and authorization methods cannot protect the content from being read.

- `Authority` of `Anchor Network` refers to the relationship between `Anchor` and account, which is recorded in the protocol of `Anchor`.

- `Authority` of `Anchor Network` refers to the relationship between `Anchor` **A** and `Anchor` **B**, which is recorded in the protocol of `Anchor` **A**.

- Time limit of authorization supported by `Anchor Network`. `Anchor Network` protocol use block numbers as timestamp. The blockchain network's block number has a time attribute and is suitable for use as an authorization period. Based on the block finalized speed, the block number corresponding to the authorization time can be calculated. However, due to the fact that the block finalized speed is not a strict time limit, the accuracy of this method is limited and cannot fully correspond to the real world time. Please note this when using it.

#### Declared Hidden

- `Declared Hidden` is a supplement of blockchain. As the expansion of **Dapp**, **deletion** is an unavoidable problem, such as an incorrect message or application that should be deleted, but this is unable to achieve on blockchain network. `Anchor Network` introduces the way of `Declared Hidden` to solve this problem, the deletion is explicit declaration in `Anchor Data`. Although this is not physically deletion, but by following the protocol, these `Declared Hidden` data are indeed hidden and invisible.

- Defined in `Anchor Data`. The content that is declared to be hidden is published through `Anchor Data` transparently.It is even possible to hide the previously hidden data in subsequent declarations. This is similar to the common recycling box in computer operating systems, where we can put files into the recycling box. Even if these files still exist, they cannot be used or started unless you perform a restore operation. But remember that, the data in the world of blockchain can not be removed once it was created, `Declared Hidden` is a protocol level function to implement the deletion.

## Security

### Security Overview

- `Anchor Network` is base on **Polkadot/Substrate** which is pretty security already, either in network or in writing function. The basic security for data storage has been established, and **Polkadot Network** has been running stably for a long time. `Anchor Network` is a bootstrap blockchain network that supports the deployment and operation of **Dapp**, which need higher security requirements than simple data storage. We will compare the security of `Anchor Network` from two aspects, one is comparing to traditional centralized deployment, the other is comparing to other blockchain storage solution network.

- Compared to traditional centralized deployment. Deploying **Dapp** on `Anchor Network` is much security.  From the execution flow of **Dapp**, it can be found that for **Dapp** deployed on the `Anchor Network`, the single key is to ensure the `Loader` is secure. The immutability of running code also ensures the interests of merchants, avoiding the occurrence of devops, and even eliminating the need of operationor to maintain the availability of **Dapp**.

```
      Key           Key        The same  Regulatory    Regulatory
        |           |          |          |             |
        |           |          |          |             |
        V           V          V          V             V
    Client Env --> Loader --> Access --> Dapps --> Blockchain Networks
```

- Compared to current blockchain storage solutions. The main solution is **IPFS**. By **IPFS** way, using independent hashes to calibrate files requires us to confirm that each file is executing a secure **Dapp**. And where to obtain these secure hashes becomes another issue. `Anchor Network` can continuously monitor **Dapp** by checking `Anchor Name`. It is a way not only establishing technical security, but also establishing trust in the security of `Anchor Name` through historical version tracing. Unlike the file storage of **IPFS**, separating various dependencies of **Dapp** is supported by `Anchor Network`, then we can ensure the security of each components conveniently. It is better to ensure the security of **Dapp**.

- As **Dapp** become more and more complex, it will inevitably face more and more security issues. Ensuring security by limiting functionality is an effective way to process core financial data, which has also created the thriving `Web3.0` world. But it is not logical that we solve all the issues right now before it happen, `Web3.0` requires a new security mechanism to ensure basic security requirements and also to cope with future issues. `Anchor Network` will make an in-depth attempt in this area, and the first step that can be achieved is to publish **Dapp** itself on chain, and the future security method can be based on this.

### Supervision On Chain

- `Anchor Network` will establish a transparent monitoring system based on `Anchor Name`. There will be more and more malicious **Dapps** as the `Web3.0` improving. Because of the immutability, blocking the malicious **Dapps** is not a proper way. `Anchor Network` will assist in establishing a secure on-chain **Dapp** supervision system by publishing **white list** and **black list**. Before you run a **Dapp**, check it first.

- The **white list** is the `Anchor` list of trusted and verified **Dapp**. It is recommended that users only run **Dapp** recommended by the **white list**. The whitelist can be maintained by different organizations, forming decentralized management. As the entire data history is recorded in the `Anchor Name`, it is also convenient for users to review and make the decision to run **Dapp** especially the `Loader` that is extremely important for security.

- The **black list** is the `Anchor` list of discovered malicious **Dapp** or a list of malicious **accounts**. The `Loader` should use a **black list** to indicate the operational risks of **Dapp** for users to make their own decision. The **black list** is maintained by different organizations, forming decentralized management. For **Dapp** deployed on the `Anchor Network`, institutions or individuals maintaining **black list** can evaluate and judge the application as soon as possible, providing valuable information to users.

- Establishing a `Web3.0` world that relies entirely on algorithmic security is equivalent to looking at the future from the current perspective, which will limit future development and high cost. `Anchor Network` establishes a small open supervision mechanism, forming **white list** and **black list**, without increasing the complexity of `Anchor Network`` and ensuring that future issues can be solved in the future.

## Components

### Anchor Pallet

- Data storage function implement. The function of writing `Anchor Data`  onto the chain is based on **Polkadot/Substrate** pallet. By **Anchor Pallet** *setAnchor* function, you can storage data on blockchain.

- Data trade function implement. No need for third-party intervention, relying on *sellAnchor*, *buyAnchor*, and *unsellAnchor* functions in **Anchor Pallet**, you can do trade `Anchor Name` successful.

### Easy Protocol

- `Anchor Network` supports customize protocols, it should be third-party protocol, as the network only support `Anchor Data` storage and `Anchor Name` trade. Of course, this third-party JS library can be stored on the `Anchor Network` to make code public. When both the **Dapp** data and application itself are on chain, `Anchor Network` is a self bootable network, or can be call **Bootstrap Blockchain Network**.

- `Anchor Network` support `Easy Protocol` as default to achieve various expected goals. This is a simple human-being readable protocol that uses JSON as the format. `Easy Protocol` solves the problems of on-chain data location and relationship, orginize the on-chain resource as a scalable framework, then is can support complex **Dapp**. `Easy Protocol` is an extensible protocol that reserves possibilities for more diverse applications in the future.

#### Loader

- `Loader` is an important **Dapp** of `Anchor Network`. Its main function is to connect to `Anchor Network` node, parse `Anchor Data`, then load **Dapp** to run. Meanwhile, the `Loader` itself can also be deployed on `Anchor Network`. At this point, a `Downloader` is needed to get the raw data of `Loader`. It looks like the egg-chicken problem. But on `Anchor Network`, whether you have the chicken or the egg in your hand, you can successfully connect to the network and fully utilize various resources and **Dapp**. The `Loader` is supported for both the front-end and back-end, by using Javascript, and the back-end needs to run with **Node.js**.

- `Downloader` is a **Dapp** to download **Dapp** on `Anchor Network`. When you first encounter `Anchor Network`, this is the first stepping stone. After obtaining the `Loader` through the `Downloader`, you can enjoy your `Web3.0`.

- More security to run **Dapp**. `Loader` passes restricted APIs to **Dapp**, which brings two benefits: firstly, it can enhance security, and secondly, it improves the development efficiency of **Dapp**. In the future, the functionality of `Loader` can be implemented on the browser side to form a more secure sandbox environment which is system level security.

#### Full On Chain Dapp

- Non modifiable on chain deployment` One of the main advantages of full chain applications is that they can be deployed transparently and publicly. Although this increases the requirements for release, it requires more thorough testing or a good separation of the program and configuration. That is to say, by deploying on chain, the application will be more robust. At the same time, it also left an indelible footprint in the world of 'Web3.0', seeing your contributions to a better 'Web3.0'.

- Support the implementation of complex logic. It can be found that fully functional APIs can empower developers to connect to various existing services, whether they are 'Web3.0' or * * Web2.0/Web1.0 * *. At the same time, Anchor Network also has easy-to-use online linked lists to store data. By combining the two, many complex functions can be achieved, supporting the development and release of non-financial 'full chain applications'.

- Flexible authorization methods` Full chain applications need to be able to support flexible authorization methods to establish a healthy environment and enable developers to focus more on functional implementation. Authorization can be divided into account authorization and chain name authorization, and the authorization period can be unlimited or authorized to a specified block number.

- Extremely low development threshold. No need to consider complex token economics anymore, focusing on solving various problems in the 'Web3.0' model. When 'Anchor Network' is considered a feasible runtime environment for 'full chain applications', using its SDK development will be very convenient. It only takes about one day of learning, and you can start developing your own' full chain applications'.

- Full chain applications that can be traded. This is a great convenience brought by the 'Anchor Network', where you can trade with the Anchor at any time, and endogenously support the realization of 'full chain applications', not just through the business model established by the' full chain applications' themselves to make money. This is a problem that non-financial 'full chain applications' must solve, forming a sustainable and profitable closed-loop, rather than creating a drumming and flower spreading environment.

### EasyPolka Toolbox

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
