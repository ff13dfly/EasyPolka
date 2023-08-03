# EasyPolka

Anchor Network parts, including **Anchor JS SDK**, **Easy Protocol**, **Loader**, **Convertor**, **Gateway Micro-service System**. Anchor Network is a full chain solution.

- **Anchor JS SDK** ( [Folder to open](https://github.com/ff13dfly/EasyPolka/tree/main/anchorJS) ): The IO SDK for [Anchor Pallet](https://github.com/ff13dfly/EasyAnchor), the basestone of Anchor Network. There is a [playground](https://playground.metanchor.net/) to know it well.

- **Easy Protocol** ( [Folder to open](https://github.com/ff13dfly/EasyPolka/tree/main/protocol) ): Simple protocol to organize data on Anchor Network, support interesting features, such as `Anchor Linke`, `Declared Hidden`, `Anchor Authority`.

- **Loader** ( [Folder to open](https://github.com/ff13dfly/EasyPolka/tree/main/loader) ): Booter of Anchor Network, can run the Dapps by Anchor name, base on **Easy Protocol**. There is a [website](http://plinth.metanchor.net/) you can try. The Anchor name can be passed to application by URL hash.

- **Convertor** ( [Folder to open](https://github.com/ff13dfly/EasyPolka/tree/main/convertor) ): Tools to deploy your current web applications on Anchor Network without coding. NodeJS needed to run the convertor properly.

- **Gateway Micro-service System** ( [Folder to open](https://github.com/ff13dfly/EasyPolka/tree/main/gateway) ): Gateway is a Micro-service System full on chain. You can run this sytem by **Loader** directly. If you want to develop a complex application full on chain, try this.