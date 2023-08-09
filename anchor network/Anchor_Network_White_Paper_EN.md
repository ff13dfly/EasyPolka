# Anchor Network White Paper, A Bootstrap Web3.0 Network

Author: Billy Fu, Victor
Date: Augest 2023

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

### Solution

- A simple entrance. After the hard work of Web3.0 colleagues, currently Web3.0 has become much simpler, but compared to the development of Web2.0/Web1.0, the threshold is still much higher. Both in terms of development tools and paradigms, Web3.0 has many gaps, especially in the development of non-financial development applications and the saline alkali land of Web3.0. Anchor Network uses name services to solve this problem, using simple and easy to remember chain names as key values and structured chain anchors as data carriers. The concept is very simple and consistent with traditional KV storage systems. With only minor modifications, existing applications can have the ability to access and write to blockchain.
