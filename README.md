# POSTA 📢
A twitter-like social network for Human Beings only!

## Preface  (Why Posta)?
**Social Networks**🌎 are a great evolution of Human Society to socialize through the internet. One of the fundamental problems of the current state, is that they are fully centralized. All the data and content generated through them, is collected and managed by the owners of the service.

Another problem is the amount of fake profiles that can be generated 🦹‍♂️, making social networks untrustworthy about the authors of the content.

**Posta** is a twitter clone that runs on the Ethereum Blockchain ⛓️, and makes it a **MUST** that the user participating on it, is a Human being.

To achieve this, a user must be a registered and approved Human under the [Proof of Humanity registry](https://www.proofofhumanity.id/) to be able to generate a Post.

## How it works?
Posta is an ERC721 NFT (PSTA). Everytime an address tries to create a new Post, the contract validates that the creator address is registered on the [Proof of Humanity registry](https://www.proofofhumanity.id/).

If the address is an actual Human, a new NFT with symbol "PSTA" is minted and sent to the Human that created it, and a JSON file is generated with the post and the author, and uploaded to a decentralized storage system.

### 👍 Likes / Support (Or how to come up with excuses to burn UBI)🔥🔥🔥
---
Just as on any social network there is the concept of like, Posta has a "**support**" feature, which is paid in **UBIs**.
This feature does 4 things:
- Burns 50% of the UBIs payed 🔥
- Gives the remaining to the post creator (to increase interest on creating quality content) 👤🧾
- Adds the total balance paid to the total value of support given to the post (which is irevokable. Support can only be given, not taken away) 💎
- The NFTs keeps track of the number of unique humans that gave support. This way, no matter the amount of support received, the number of people also counts. 👥👥👥

Suggestions about this behavior are more than welcome

### Storage system
The storage system is still to be defined. A potential candidate for this could be [ARweave](https://www.arweave.org/) since it has the potential to store data for a long time (200 years) as opposed to [FileCoin](https://filecoin.io/) which requires monthly payments. **Other solutions suggestions are welcomed !🙌**

This part is important since it would mean that the HUman would need to pay for the storage of the NFT, so it must be thought pretty smartly 🧠.

###  Notice
This is a work in progress to learn about building a fully functioning Decentralized app.
PRs will be accepted to help improving the architecture.

### How to run it:
- Install truffle
- Deploy the contracts either to a local ethereum blockchain or to a test network (check `./posta-contracts/truffle-config.js`)
- Run the react app inside the directory (`./posta-app`) using `npm start`.

## How can I help?
This is still a Work in Progress so any kind of improvement is valid (architecture, protocol, contracts, frontend app, suggestions, ideas, etc).

- If you have a question, suggestion or idea, please, submit an Issue
- If you have a code improvement, fork the repository and sned a PR so that we can review it, discuss it, and potentially merge it.
