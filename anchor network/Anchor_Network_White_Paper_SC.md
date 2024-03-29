# Anchor Network白皮书，一个可以自启动的Web3.0网络

作者：傅忠强, Victor
日期：2023年8月

## 概览 ( Overview )

- 比特币带来的区块链技术已经蓬勃发展了一段时间，以太坊的智能合约也丰富了区块链的应用场景。然而，到了今天的2023年，普通人还只是听说过比特币或者`Web3.0`，对于`Web3.0`的应用，也主要是交易所。对于普通用户而言，存在两个问题，一是用不到，二是难以用。各种`Web3.0`应用也集中在金融领域，无论是交易所，还是最近火爆的Defi和NFT。而非金融类应用，还没有一个走入普通用户的视野。但从技术角度来看，区块链的特性，的确是可以让非金融应用受益的，例如，无法篡改的特性，稳定的去中心化网络，健壮的账户体系等。

- 无论是从技术的外溢，还是从金融领域的日渐红海来看，`Web3.0`的破圈都在不远处。那怎么破，从哪里破，就变成了一个很值得探讨的问题。Anchor Network就是对这个问题思考的结果，用更简单的接入方式来促进`Web3.0`破圈。`Anchor Network`的思路，就是让接入`Web3.0`网络的门槛降低，尤其是开发部分。这样，就能吸引更多的人参与到`Web3.0`里来，也许，就能找到一个很好的突破点。

- `Anchor Network`基于**Polkadot/Substrate**，是独立的链，同时借助波卡的生态圈，具备通过波卡的方式接入其他链的能力。同时，`Anchor Network`被用作`Web3.0`应用程序部署的时候，也具备了一种跨链能力，通过应用程序开源部署的方式，透明的连接各个区块链网络，是一种应用层面的跨链。这一特性，给开发Dapps提供了一种新的方式。

- `Anchor Network`提供数据操作对象`链锚`，是一种链上存储方式，用自定义的字符串`链名`来代替随机哈希，建立进入区块链世界的锚。`Anchor Network`使用类似超链接的`锚链接`，来定位链上资源，起到和超链接一样的作用，将分布在链上的资源有机的组合起来。`Anchor Network`提供便捷的SDK，避免`Web3.0`的各种复杂概念，只需要链锚，一天的学习就可以进到We3.0开发的世界。`Anchor Network`提供完整的工具链（包括协议、加载器、微服务框架等）来实现`全链应用`的开发，从易到难的解决应用程序上链的问题。

- `Anchor Network`支持`Easy Protocol`协议，解决链上数据的关系和链上程序的调用方式，可以方便的定位链上资源，同时，通过`申明删除`的方式，来解决数据隐私的问题。这是一个开发可扩展的协议，致力于解决链上数据的关系，支持不同的类型，来实现链上程序、链上数据、链上资源库等开发常用功能。

- 安全性问题是`Web3.0`的重要方面，也是`Anchor Network`非常关注的。`Anchor Network`的`链锚`是具有所有权属性，导致了账号安全变得异常重要。不同于**Web2.0/Web1.0**，账号对于`Web3.0`来说，是一切的基础，而且没法通过去中心化的方式进行恢复。`Anchor Network`采用减少风险点、控制风险点的策略来解决安全问题。

## 词汇表

- `Anchor Network`，一个可以自启动的Web3.0网络，基于Polkadot/Substrate。
- `链锚`，存储在Anchor区块链上的结构化数据。
- `链名`，访问链锚数据的唯一名称，utf-8字符串。链名下可记录以链表方式关联的`链锚`。
- `锚链接`，用于标定Anchor Network资源的文本表达方式，类似于URL，可以唯一标定资源并传递外部参数。
- `Web3.0`，具有所有权属性的去中心化网络。
- `信任`，链锚和链锚之间的关系。
- `授权`，链锚和账户之间的关系。
- `申明删除`，链锚的所有者，可以申明删除指定的链上数据。虽然这些数据仍然物理的存在于链上，遵从`申明删除`的程序将不会显示这些数据
- `加载器`，连接到Anchor Network，并可以加载链上指定的链锚。 这样，就可以把JS项目部署到区块链上。
- `下载器`，连接到Anchor Network，按照协议要求，进行数据下载。这样，可以将App下载成本地文件。
- `转换器`，将应用程序转换并部署到Anchor Network的转换工具。
- `EasyPolka`，Anchor Network提供的整套开发工具。
- `Plinth`，Anchor Network提供的链上浏览器。
- `Easy Protocol`，Anchor Network默认支持的协议，定位和组织链上资源的协议。

## 解决的问题

- 单一入口。经过`Web3.0`同仁的努力工作，目前`Web3.0`已经变得简单了不少，但是相较于**Web2.0/Web1.0**的开发，门槛还是高很多。无论是开发工具，还是开发范式，`Web3.0`都有很多缺口，尤其是非金融开发应用的开发，还是`Web3.0`的盐碱地。`Anchor Network`使用**名称服务**的方式来解决这个问题，将简单易记的`链名`作为键值，结构化的`链锚`作为数据载体，概念上非常简单，和传统的KV存储系统一致。仅需微小的改动，就可以让现有的应用程序具备访问和写入区块链的能力。

- 简单的经济学。在万物皆可token的浪潮下，对于token的各种处理日渐复杂，其庞杂的体系已经很难从头开始理解。`Anchor Network`使用简单易懂的经济逻辑，只有**花钱存储**和**定价销售**，前者是存储数据的逻辑，后者是数据交易的逻辑。这样简单的经济逻辑，已经是现实世界中的常识，会非常容易的被理解。将复杂的token体系交给专业的第三方去处理，仅仅通过API去调用。`Anchor Network`致力于尝试这种简单的经济学在Web3.0世界建立自洽的体系。

- 你的`Web3.0`。**拥有**`Web3.0`的一个重要特征，`Anchor Network`充分诠释这一属性。`链名`和`链锚`是具有明确所有权的，哪怕你对`Web3.0`一无所知，也可以拥有一个`链名`，从而真切的体验下`Web3.0`拥有感，而不是作为旁观者，通过阅读新闻来参与。同时，对于**Dapp**的开发，**拥有**就带来了巨大的便利，可以让不同的程序运行在同一个网络，建立数据交互的规则而不破坏数据，`Anchor Network`就是这样的区块链网络。

- 上链的**Dapp**，就是`全链应用`。智能合约的使用带来了**Dapp**的蓬勃发展，但随着越来越多的**Dapp**被部署，却呈现出中性化的趋势，**Dapps**被开发者部署在各自的服务器上，虽然智能合约运行在去中心化的区块链网络上，而和这些智能合约互动的应用程序，却被中性化的控制着。这种中心化的控制，带来了用户账号暴露的风险，以及应用程序无法被审查。例如，中心化的交易所，对用户的行为一清二楚。`Anchor Network`使用`链锚`存储Dapps的UI和非智能合约部分，来解决这一问题，开发者只需将**Dapp**部署到`Anchor Network`，就实现了**Dapp**的全链化。

- 单一开发语言。Javascript是一个蓬勃发展具有丰富工具链的语言，`Anchor Network`可以实现完全基于Javascript的全链上系统。Javascript已经通过旺盛的生命力证明了自己，也被应用到了区块链开发的很多领域，甚至智能合约的开发语言Solidity也是类Javascript的。对于非智能合约开发，Javascript也是具备天生的优势，有丰富的框架和工具可以使用，帮助这些框架快速上链，将是`Anchor Network`的一个主要努力方向。

- `Anchor Network`还具备一个优势，就是会拥有很多开箱即用的**微服务**。传统的开源已经极大的促进了计算机技术的发展，但是，也面临着使用门槛的问题。当你想使用一个开源的项目时，运行环境、系统调试，都会是巨大的挑战。而在`Anchor Network`，这一情况会得到极大改善，基于统一的协议和加载器，部署于链上的应用程序，可以方便的被本地运行，大部分情况下，只需要一条命令行即可。也是因为基于同样的协议，就会存在很多通用的需求，而这些需求的解决方案，就部署在`Anchor Network`上，你只需要调用就可以了。

### 应用上链现状

- **Dapp**所倡导的去中心化理念，在目前的实践中碰到了现实的困难。主流的实现方式，是“Web3.0部署的智能合约”+“Web1.0/Web2.0部署的UI”，当没有了“Web1.0/Web2.0部署的UI”后，普通用户几乎无法使用“Web3.0部署的智能合约”，也就是说，现有的**Dapp**严重依赖于中心化部署的UI，而UI端的运行和安全，完全依赖于其开发者。即使想要运行比特币的终端，你也需要去比特币的官方网站，下载比特币的应用程序来运行，这也是完全的传统方式。

- **IPFS**是一种去中心化的储存方式，目标是分布化的数据存储，解决的是大量数据的分布式存储，例如图像、视频等大文件。也存在使用困难的问题，其标记用的hash，完全无法依靠记忆进行访问。随着未来`Web3.0`的广泛应用，可以标定`Web3.0`资源的链名系统，也就是`Web3.0`世界的域名系统也是呼之欲出的。然而，**IPFS**无法支持这种方式。

- 高昂的成本，基于现有的方式部署全链上应用，无论是**Dapp**开发，还是部署运维，都需要投入巨大的人力，以及很高的上链成本。以处理金融交易为主的区块链系统，存储空间非常有限，如果将数据全链存储，就会带来巨大的上链成本。`Anchor Network`作为专门用于部署**Dapp**的区块链系统，针对这一情况进行了优化，提供完整的工具链支持`全链应用`，又可以低廉的将**Dapp**部署上链。同时，`全链应用`免去运维的烦恼，再一次降低了**Dapp**的开发成本。

### 会面临的问题

- 执行效率。由于所有数据都存在链上，就会存在存取复杂的问题，直接带来的问题，就是执行效率的下降，增加了一个检索数据、下载数据的过程。可以通过可信的缓存服务器来解决。所谓可信的缓存服务器，就是所有代码发布在链上，可以直接运行起来的服务器程序，这样，就可以避免中间服务器的安全性问题。当自己启动的服务器程序是可信的时候，使用这个服务的前端程序也就可信的，就能安全使用缓存的数据，提高执行效率。这种方式，也可以快速的部署分布系统，满足系统响应需求。

- 代码安全性。`Anchor Network`上的应用程序执行依赖于客户机，同时也是逻辑更复杂的操作，对比于在服务器节点运行的服务或者智能合约，安全性是要降低了不少，至少面临了以下3个方面的挑战。
    1. 获取数据的安全性
    2. 执行过程的安全性
    3. 外部请求的安全性

   因此，我们可以发现，在`Anchor Network`的最佳实践有两种方式。
    1. 仅仅将`Anchor Network`看成是一个部署的场所，类似于Javascript的包管理。
    2. 使用`链锚`进行程序开发，将数据直接存储在`Anchor Network`。

## 系统架构

- `Anchor Network`分为数据层、协议层两部分。数据层，运行在区块链节点上，即[Anchor Pallet](https://github.com/ff13dfly/Anchor),完成`链锚`的读写和`链名`的交易。协议层，是`链锚`的**protocol**字段，用来定义链上数据的运行方式和数据关联。这样就能支持全链的**Dapp**发布，通过`加载器`，也就实现的了自启动的区块链网络，`Anchor Network`。

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

### 数据层

#### 数据存储

- `Anchor Network`使用**链上链表**的方式来组织数据，使用KV的思路来检索数据，提供可定制化的原子数据结构,即`链锚`。采用这种方式，主要解决两方面的问题：一是所有链上数据可以被看成是一个KV存储，理解门槛极低；二是通过链表的方式，降低了链上状态的开销，为长久运行打下基础。`链锚`的数据存储分为两部分，**数据**和**协议**，兼顾存储和数据解析。目前，已经通过Pallet的方式实现了，[Anchor Pallet](https://github.com/ff13dfly/Anchor)

- `Anchor Networ`使用`链名`，解决链上资源的可记忆性问题。区块链把哈希带给了大众，让大家认识到这个秘密学的产品，然而，对于人类而言，哈希几乎无法记住，就像我们在交易所看到，你能记住智能合约对应的缩写，例如波卡的DOT，但是要记住合约地址，几乎不可能了。于是`Anchor Network`就使用类似域名的**名称服务**来解决这一问题。例如，我们给链上资源浏览器取名叫`Plinth`,你就可以通过这个简单易记的名称，在`Anchor Network`上访问并运行这个浏览器。

- 链上存储天生具有的特点就是所有权，确保了可以在`Anchor Network`上建立互不干扰又方便读取的复杂应用程序。即使在**Web2.0/Web1.0**开发实践中，例如数据库系统，权限管理也发挥了重要的作用，保障了数据安全。当这一优势应用到所有的链上数据时，其便利性将给**Dapp**开发带来意想不到的优势，例如，对于同一数据源，却能诞生很多有趣的`全链应用`。

#### 数据交易

- `Anchor Network`的数据具有所有权，当这种所有权能够进行转让时，就实现了数据的交易，是一种非常直观且不需要中介参与的方式。无论是简洁`链名`本身所具有的商业价值，还是记录在`链名`下的数据，都可以成为这种方式的交易主体。自由定价的方式，也有助于形成天然的市场，进一步活跃`链名`交易。这是区别于**Web2.0/Web1.0**时代的域名交易的，当`链名`进行交易时，其关联的历史内容，也将实现转移，无需分为域名和应用程序的二次交割。这有助于形成`Web3.0`开发的商业范式，一种先检测结果再交割的模式。

- `链名`交易分为两种方式：一种是谁都可以参与的交易，先到先得；一种是指定受让者的定向交易，其他用户无法购买。这就提供了安全的交易基础，不会出现意外而导致了数字资产的流失。

- 相对于域名的持续充值方式，`链名`是采用的是**一次拥有再无费用**的方式，初始化之后，就再无维护费用。

### 协议层

#### 数据定位

- `Anchor Network`引入`锚链接`来实现`链锚`数据的定位，其使用`anchor://`这样的标识符来进行识别，类似超链接。例如，当我们需要访问**hello**在区块**n**上的数据时，其表达为**anchor://hello/n**，这种方式简单明了，即使不借助于复杂的解析系统，也可以定位到链上数据，相对于无法记忆的hash，更加直观。还是以**hello**为例，`锚链接`最简洁的表达方式为**anchor://hello**，这表示去获取**hello**的最新数据。

- `锚链接`提供对多网络的支持，尾部增加`@network`来进行不同链之间的信息传递，默认的即为`Anchor Network`。这为未来异构网络预留可能性，即使完全不同的区块链网络，也可以使用统一的方式进行访问。这是一个非常有意思的特性，在完全异构的网络，也能提供统一的访问体验，对于**Dapp**的开发来说，将是一个巨大的优势。

- `锚链接`提供更多的特性，来支持应用开发，尤其是对于JSON数据结构的支持，使用**anchor://anchor_name|key_name**的方式，来读取单一`链锚`下的JSON数据对象，提高链锚的表达力，方便了**Dapp**的开发。

#### 数据关联

- 呼叫关联。**链锚A**可以在协议中指定呼叫**链锚B**。通过这种方式，链上数据就能够被自由的组织，形成网络。这就让区块数据不在孤立，让历史的区块数据也具有意义，显著的提升区块链系统的数据利用率。对于这种复杂数据网络的支持，是建立大型应用程序的基础。甚至基于`锚链接`跨异构网络的特性，实现了一种新形式的跨链，即数据仍然在不同的网络上，也可以安心访问。

- 和所有权结合产生新的商业范式。当不同所有者的数据，通过`链名`进行关联之后，就带来了`授权`和`信任`的问题。例如，A账号开发的**Dapp**部署在**应用A**上，B账号则拥有`链名`**配置A**，用户可以通过**配置A**来启动**应用A**。在这个用例里，B账号可以通过不同的配置来实现复合自己要求的应用，也不会对应用程序本身产生破坏，甚至一旦**应用A**不可用，B账号可以切断呼叫关联。而对于A账号来说，可以专注于**应用A**的开发升级，供很多不同的配置通过呼叫关联的方式来启动。

- `链锚`也可以资源库的形式存在，供其他`链锚`进行引用。因为`链锚`的不可篡改性，这种引用的会更加安全。即使资源进行了更新，也可以通过指向特定资源的方式，保障引用的可用性。这类似于NPM的包管理，不过这些包的数据，是发布在`Anchor Network`上的，是完全去中心化的，而且还能保障所有权。

#### 授权和信任

- `Anchor Network`支持不同的`链锚`相互关联，就自然产生了授权和信任的关系，协议通过明确指定的方式来实现这些功能。支持`Anchor Network`的协议，会遵循这个授权来处理明文的链上数据，在使用层面实现知识产权保护的功能。但是链上数据是明文的，授权方式没法保护内容的不被读取。

- `Anchor Network`的`授权`，是指`链锚`对**账号**的关系，记录在`链锚`的协议里。

- `Anchor Network`的`信任`，是指`链锚A`对`链锚B`的关系，记录在`链锚A`的协议里。

- `Anchor Network`的协议还可以对`授权`和`信任`的时限进行限定，使用区块号来进行标定。区块链网络的区块号具有时间属性，是适合作为授权期限来使用的。例如，根据出块速度，可以计算出授权时间对应的区块号，写入到授权信息里。但是，由于出块速度不是严格的时间，这种方式的精确度是受限的，无法和现实世界的时间完全对应，使用时请注意这一点。

#### 申明隐藏

- `申明隐藏`是对区块链无法篡改特性的一种补充，随着区块链应用范围的扩展，**删除**就是一个无法回避的问题，例如，一个错误的信息，一个错误的应用程序，理应被删除，但是这在区块链网络上是难以实现的。`Anchor Network`引入`申明隐藏`的方式来解决这个问题，即信息的所有者，通过明确声明的方式，来隐藏指定的数据。这虽然不是在物理上删除数据，但是在遵循协议的应用上，这些`申明隐藏`的数据的确是被隐藏不可见的。

- `申明隐藏`的内容也是通过`链锚`进行发布的，公开透明。甚至可以在后继的申明中重新显示之前被`申明隐藏`的数据。这和计算机操作系统中常见的回收站类似，我们可以把文件放到回收站里，即使这些文件还是存在着的，也是没有办法被使用和启动的，除非你进行还原操作。Anchor Network支持的`申明隐藏`是同样的方式，只是在区块链的世界里，**永久删除**的功能是无法实现的。

## 安全问题

### 安全性概述

- `Anchor Network`网络数据本身的安全性，基于**Polkadot/Substrate**所能提供的基础安全，同时，所有权确保了写入的安全。对于数据的保存已经具备了基础的安全性，这套系统也稳定运行了很长时间，实践也证明了PoS的安全性。`Anchor Network`是一个自启动的网络，支持**Dapp**的部署和运行，就比单纯的数据存储，具有更高的安全要求。将从两个个方面来比较`Anchor Network`的安全性，一是和传统的中心化部署比较，二是和其他链上存储解决方案比较。

- 和传统的商户自主部署比较，`Anchor Network`部署的**Dapp**更安全。通过下面的执行路径，可以发现，对于部署在`Anchor Network`的**Dapp**，只需要确保`加载器`是安全的，即可放心的使用。运行代码的不可篡改性，也确保了商户的利益，不会发生运维删库跑路的情况，甚至不需要运维人员来保持**Dapp**的可用性。

    ```
          不可控      重点部分     不可控      监督系统       监督系统
            |           |          |          |             |
            |           |          |          |             |
            V           V          V          V             V
        用户运行环境 --> 加载器 --> 访问链路 --> 链上应用 --> 其他区块链网络
    ```

- 相较于目前的链上存储解决方案，主要是**IPFS**。对于**IPFS**，使用独立的Hash来标定文件，这就导致了我们需要确认每个文件来保障执行的是安全的**Dapp**，而从哪里获取这些安全的hash，就成了另外一个问题。`Anchor Network`通过`链名`的方式，可以对**Dapp**进行持续的监控，不仅仅建立技术的安全性，也能通过历史版本的回溯，建立对于`链名`安全性的信赖。不同于**IPFS**的文件存储，`链锚`还可以在链上组织资源，将**Dapp**的各种依赖拆分开，更方便的确保每个组件的安全。

- 随着**Dapp**的日渐复杂，必然会面临越来越多的安全问题。通过限制功能的方式来确保安全，这对于处理核心金融类数据，是有效的方式，这也造就了现在繁荣的`Web3.0`世界。但是，随着应用领域的扩展，`Web3.0`需要一种新的安全机制，来保障基础的安全需求，也能应对未来出现的问题。`Anchor Network`将在此方面进行深入的尝试，目前能做到的第一步，就是将**Dapp**本身发布出来，发布一个无法篡改的版本，后继的措施都可以基于此展开。

### 链上监督

- `Anchor Network`将基于`链名`建立透明的监督系统。我们相信，随着`Web3.0`的持续发展，将会出现越来越多的恶意程序，在区块链的世界**堵**是不行的，`Anchor Network`采用的是**疏**的方式，将通过透明的公布**白名单**和**黑名单**的方式，来协助建立安全的链上**Dapp**生态。

- **白名单**是公布可信并经过验证的**Dapp**的`链名`，尤其是对安全极其重要的`加载器`，建议用户仅采用白名单推荐的应用。白名单可由不同的组织进行维护，形成去中心化的管理，由于整个数据历史都会在`链名`中进行记录，也有方便用户去了解和判断。

- **黑名单**是公布已经发现的恶意**Dapp**和**恶意账号**。`加载器`使用黑名单来提示**Dapp**的运行风险，供用户进行自行判断。黑名单由不同的组织进行维护，形成去中心化的管理。对于部署在`Anchor Network`上的**Dapp**，维护黑名单的机构或个人，可以第一时间对应用进行评估和判断，给用户提供有价值的信息。

- 建立完全依赖算法安全的`Web3.0`世界，相当于用现在的眼光去看未来，这将限制未来的发展。`Anchor Network`通过**链上监督**这一方式，建立最小的开放的监督机制，形成**白名单**和**黑名单**，不增加`Anchor Network`的复杂性，也保障了未来的问题可以在未来被解决。

## 功能组件

### 区块链部分 （ Anchor Pallet ）

- 数据存储。将`链锚`数据写入到链上的功能，`Anchor Network`基于**Polkadot/Substrate**来构建了区块链系统，使用Anchor Pallet的setAnchor单一方法，实现所有的链上数据存储。

- 数据交易。对`链名`进行交易，支持`自由交易`和`定向交易`两种方式，拥有者自主定价，来实现交易功能。无需第三方介入，仅仅依赖Anchor Pallet中的sellAnchor、buyAnchor和unsellAnchor来实现完整的交易闭环。

### 运行协议 （ Easy Protocol ）

- `Anchor Network`支持自定义的运行协议，但网络本身仅负责协议数据的存储，协议执行依赖于第三方库。当然，这第三方的JS库，本身可以存放在`Anchor Network`上。**Dapp**的数据都存储在`Anchor Network`上，当`加载器`运行的链上程序启动时，可以完全依赖链上数据，这就是**可自启动的区块链网络**。

- `Anchor Network`默认使用`Easy Protocol`来实现各种预期的目标。这是一个简单的人机可读的协议，使用JSON作为协议数据格式。`Easy Protocol`解决链上数据定位、链上数据关系的问题，将链上资源整合到一个可伸缩的框架里，为建立复杂的`全链应用`打下坚实的基础。`Easy Protocol`是一个可扩展的协议，为未来更丰富的应用预留可能性。

#### 加载器

- `Anchor Network`的**可自启动的区块链网络**，需要`加载器`来进行启动，其主要功能是接入网络节点，解析链锚，获取数据后启动应用程序。同时，`加载器`自身也是可以发布到`Anchor Network`的。这时候，就需要`下载器`来进行获取。这似乎形成了现有鸡还是先有蛋的问题，在`Anchor Network`上，无论你手中有鸡还是有蛋，都可以成功连接到网络，尽情使用链上的各种资源和应用。加载器需要实现对前后端的完整支持，都使用Javacript来实现，后端需借助Node.js来运行。

- `下载器`是用来下载链上应用的程序，可以将`Anchor Network`上的应用程序下载到本地。当你第一次接触`Anchor Network`时，这是第一块垫脚石，通过`下载器`获取到`加载器`后，就可以畅游你的`Web3.0`了。

- `加载器`的存在，可以提升`全链应用`的安全性。`加载器`将受限的API传递给全链程序，这样带来两方面的好处，一是可以增强一些安全性，二是提高了全链程序的开发效率。未来，加载器的功能在浏览器端实现后，就可以形成更安全的沙箱环境，有浏览器提供的系统级别的沙箱环境。

#### 全链应用

- 不可修改的链上部署。`全链应用`的一个主要的优势，就是可以进行透明公开的部署。虽然这提高了发布的要求，需要更充分的测试，或者将程序和配置进行很好的分离。也就是说，通过链上部署这种方式，应用程序会更健壮一些。同时，也在`Web3.0`的世界里留下了你不可磨灭的脚印，看到你为更好的`Web3.0`做出的贡献。

- 支持复杂逻辑的实现。可以发现，功能完善的API可以赋予开发者各种能力去连接现有的各种服务，无论是`Web3.0`或者**Web2.0/Web1.0**。同时`Anchor Network`也有简单易用的线上链表来存储数据。两者结合，就可以实现很多复杂的功能，支持非财务`全链应用`的开发和发布。

- 灵活的授权方式。`全链应用`需要能够支持灵活的授权方式，来建立良性的环境，让开发者更专注于功能实现。授权分为对账号授权和对`链名`授权，授权的时限可以是无限的，或者授权到指定的区块号。

- 极低的开发门槛。无需再考虑复杂的代币经济学，专注于在`Web3.0`模式下解决各种问题。当`Anchor Network`被当成一个可行的`全链应用`的运行环境时候，使用其SDK开发会非常的便利，大概只需要1天的学习，你就可以开始开发你自己的`全链应用`了。

- 可以交易的`全链应用`。这是基于`Anchor Network`带来的一大便利，你可以随时对Anchor进行交易，内生的支持`全链应用`的变现，不仅仅是通过`全链应用`自己建立的商业模式来赚钱。这是非财务`全链应用`必须要解决的一个问题，形成一个可持续赚钱的闭环，而不是形成一个击鼓传花的环境。

### 工具链

- 整个工具链体系，被称为`EasyPolka`。

#### 本地测试链（Substrate Node）

- `Anchor Network`的本地测试程序，是一个快速网络，出块速度为`Anchor Network`主网的10倍，方便本地调试。只需要一行命令行就可以运行起来，和`Anchor Network`具有完全相同的功能。

- 本地测试网络对调试非常重要，基于`Anchor Network`的特性，`全链应用`的部署就需要谨慎一些，充分测试之后再发布，是一个很好的方式，既能节省代币，又能体现你的专业风范。

#### 交互SDK（AnchorJS）

- `Anchor Network`的基础存取协议，可以实现`链锚`的全部功能，主要包括存储和交易两个部分。同时也需要支持账号验证及网络基础信息的获取。

- **AnchorJS**是Javascript的SDK，可以实现Anchor Pallet的所有操作，需要`@Polkadot/api`的支持。

#### 协议SDK（Easy Protocol）

- `Easy Protocol`是`Anchor Network`默认使用的协议，基于Anchor Pallet的操作，实现应用程序的链上启动，建立链上资源的复杂关系，从而可以形成自洽的`Web3.0`全链运行化境。

- `Easy Protocol`使用JSON来进行定义，方便理解，降低使用门槛。

#### 转换器（Convertor）

- `转换器`是将现有应用转换成可以部署在`Anchor Network`上`全链应用`的工具，可以基于任何语言来进行开发。这可以帮助开发者迅速的体验`Web3.0`的`全链应用`和**Web2.0/1.0**应用的异同。也能将很多现有的工作快速转换成`全链应用`，例如，**Dapp**的各种UI。

- `转换器`自身也部署在`Anchor Network`，可以使用`下载器`来获取。转换的过程在客户本地实现，存在使用环境是否匹配的问题，使用时需要特别注意。`转换器`可以使用不同的语言来开发，转换对象也可以是不同的应用程序。

#### 加载器（Loader）

- `加载器`的作用，是读取`Anchor Network`的链上数据，形成可执行的应用程序或者数据，之后进行运行。`加载器`可建立安全的沙箱环境，来进一步提高`全链应用`的安全性，主要通过两方面来实现。一是，提供账户验证和链上交互功能，用参数的方式传递给`全链应用`；二是，提供监管功能，读取监管数据数据，对`全链应用`的安全性做出提示。

- 从应用场景来看，可以分为前端加载器和后端加载器。前端加载器基于浏览器实现，主要是Javascript应用，只需浏览器环境即可执行。对于后端，`Anchor Network`推荐使用Node.js，如此，只需Javascript，就可以完成整个`Web3.0`程序的构建。

- `加载器`支持外部传入参数，可以对`全链应用`进行简单的配置，提升`全链应用`使用的便利性。

#### 下载器（Downloader）

- `下载器`是根据协议，整合`Anchor Network`的链上数据，打包成单一文件供下载的工具。主要作用是将需要本地运行的链上程序下载下来，因此其安全性就异常重要，否则将无法获取到正确的链上程序。

- `下载器`也是一个`全链应用`，部署在`Anchor Network`上，就形成了一个有趣的循环。你可以通过`加载器`来运行`下载器`，也可以通过`下载器`来获取到`加载器`。因此，只需要保障你有二者中的一个，就可以使用`Anchor Network`来链接到整个`Web3.0`网络。

#### 资源管理器（Plinth）

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

- `Plinth`是一个`Anchor Network`的浏览器，可以方便的查看和运行`Anchor Network`上的各种数据，可以作为一个`Web3.0`的入口来使用。`Plinth`也是一个`全链应用`，只需要有`加载器`就可以运行，无须本地执行。

- `Plinth`提供数据搜索功能，方便的检索和查看`Anchor Network`上的详细数据，追溯数据的历史。

- `Plinth`也提供运行`全链应用`的沙箱环境，方便你掌握`全链应用`的运行状态，

#### 开发框架（Gateway）

- `Gateway`是`Anchor Network`提供的可快速部署的**全链微服务框架**，助力开发者开发复杂的`全链应用`。这个框架仅需要后端的`加载器`即可运行整个微服务体系，无论是各种不同的微服务，还是需要配置的运行环境。这可以解放运维，只需要能连接到`Anchor Network`，这个应用程序的后台体系就可以正常的运行起来，可能只需要一条命令行。

- 通用的开放微服务，对于基础应用，提供即插即用的微服务，降低开发者的门槛。例如，Anchor的数据缓存，账号压缩服务，托管账号写入服务等。这将极大的提高`全链应用`的使用感受，达到现有**Web2.0/Web1.0**的响应级别。

## 相关资源链接

- [Substrate](https://substrate.io)
- [Polkadot](https://polkadot.network)
- [Anchor Network Homepage](https://metanchor.net)
- [Anchor Pallet](https://github.com/ff13dfly/Anchor)
- [EasyPolka Github](https://github.com/ff13dfly/EasyPolka)
