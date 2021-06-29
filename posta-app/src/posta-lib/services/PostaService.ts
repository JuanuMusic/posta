import { ethers, BigNumber } from "ethers";

import { IContractProvider } from "./ContractProvider";
import { POHProfileModel } from "./PohAPI";
import { PohService } from "./PoHService";

interface IPostaService {
  getTokenUrl(tokenId: string, contractProvider: IContractProvider): Promise<string>;
  setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void>;
  getPostLogs(tokenId: BigNumber, contractProvider: IContractProvider): Promise<PostLogs | null>;
  giveSupport(tokenID: string, amount: BigNumber, from: string, contractProvider: IContractProvider, confirmations: number | undefined): Promise<void>;
  publishPost(postData: IPostData, contractProvider: IContractProvider): Promise<void>;
  getLatestPosts(maxRecords: number, contractProvider: IContractProvider): Promise<IPostaNFT[]>;
  requestBurnApproval(from: string, amount: BigNumber, contractProvider: IContractProvider): Promise<void>;
  buildPost(tokenId: string, contractProvider: IContractProvider): Promise<IPostaNFT>;
}

export interface IPostData {
  author: string;
  text: string;
}

export interface PostLogs {
  author: string,
  blockTime: Date,
  content: string
}

export interface IPostaNFT {
  authorImage: string | undefined;
  authorDisplayName: string;
  authorFullName: string;
  author: string;
  content: string;
  tokenId: string;
  tokenURI: string;
  creationDate: Date;
  supportGiven: BigNumber;
  supportCount: BigNumber;
}

const DEFAULT_CONFIRMATIONS = 5;


const PostaService: IPostaService = {
  /**
   * Gets the token URL with JSON metadata
   * @param tokenId 
   * @param provider 
   */
  async getTokenUrl(tokenId: string, contractProvider: IContractProvider): Promise<string> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const uri = await postaContract.tokenURI(tokenId);
    return uri;
  },

  /**
   * Sets the base url for buiulding the tokenURI.
   * OnlyOwner
   * @param baseUrl 
   * @param provider 
   */
  async setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void> {
    const postaContract = await contractProvider.getPostaContractForWrite(from);
    const tx = await postaContract.setBaseURI(baseUrl);
    console.log("SET BASE URL TX", tx);
  },

  /**
   * Returns an array with the posts logs to build the posts.
   * @param tokenId 
   * @param provider 
   * @returns 
   */
  async getPostLogs(tokenId: BigNumber, contractProvider: IContractProvider): Promise<PostLogs | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.NewPost(null, tokenId);
    const log = await postaContract.queryFilter(filter);

    const block = log && log.length ? await log[0].getBlock() : null;
    return {
      author: log && log.length && log[0].args && log[0].args.length >= 3 && log[0].args[0],
      // Extract text from log object
      content: log && log.length && log[0].args && log[0].args.length >= 3 && log[0].args[2],
      // Tweet date comes from block timestamp
      blockTime: block && new Date(block.timestamp * 1000) || new Date(0)
    };
  },

  /**
   * Requests approval to burn UBIs on the Posta contract.
   * @param from Human address that burns their UBIs
   * @param provider Web3Provider
   * @param waitConfirmation Wait for this confirmations to complete transaction.
   */
  async requestBurnApproval(from: string, amount: BigNumber, contractProvider: IContractProvider) {
    const ubiContract = await contractProvider.getUBIContractForWrite(from);
    const approvalTx = await ubiContract.approve(await contractProvider.config.PostaAddress, amount);
    return await approvalTx.wait(DEFAULT_CONFIRMATIONS);
  },

  /**
   * Burn UBIs to support a users NFT.
   * @param tokenID IUD of the NFT to give support
   * @param amount amount of UBIs to be burned
   * @param from Human burning their UBIs.
   * @param provider Web3Provider
   */
  async giveSupport(tokenID: string, amount: BigNumber, from: string, contractProvider: IContractProvider, confirmations: number | undefined) {

    try {
      // Give support using the Posta contract (which burns half of the UBI)
      const contract = await contractProvider.getPostaContractForWrite(from);
      const tx = await contract.support(tokenID, amount);

      if (confirmations === 0) return;
      return await tx.wait(confirmations || DEFAULT_CONFIRMATIONS);
    }
    catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
  },

  /**
   * Takes care of publishing a post. 
   * It first uploads the post to a Decentralized service and then mints the NFT with the URL to it.
   * @param postData Data of the post
   * @param drizzle 
   */
  async publishPost(postData: IPostData, contractProvider: IContractProvider) {

    try {
      const postaContract = await contractProvider.getPostaContractForWrite(postData.author);
      const tx = await postaContract.publishPost(postData.text);
      await tx.wait(DEFAULT_CONFIRMATIONS);
      console.log("Post published TX:", tx);
    }
    catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
  },

  /**
   * Get the latest posts
   * @param provider 
   * @param maxRecords Max number of records to fetch.
   * @returns 
   */
  async getLatestPosts(maxRecords: number, contractProvider: IContractProvider): Promise<IPostaNFT[]> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const counter = await postaContract.getTokenCounter();
    const postsNFTs: IPostaNFT[] = [];

    // Loop from the last
    for (let tokenId = counter - 1; tokenId >= Math.max(tokenId - maxRecords, 0); tokenId--) {

      // Get NFT data from the contract and add it to the collection of posts 
      const post = await PostaService.buildPost(tokenId.toString(), contractProvider);
      postsNFTs.push(post);
    }

    return postsNFTs;
  },

  /**
   * Builds a post object to be used for display.
   * @param tokenId 
   * @param contractProvider 
   * @returns 
   */
  async buildPost(tokenId: string, contractProvider: IContractProvider): Promise<IPostaNFT> {
    const postaContract = await contractProvider.getPostaContractForRead();

    const postNFT = await postaContract.getPost(tokenId);
    const postLogs = await PostaService.getPostLogs(BigNumber.from(tokenId), contractProvider);
    const tokenURI = await postaContract.tokenURI(tokenId);


    if (postLogs) {
      let human: POHProfileModel;
      try {
        human = await PohService.getHuman(postLogs.author)
      } catch (error) {
        // If fails, set human object
        human = { display_name: "", first_name: "", last_name: "" };
        console.error(error);
      }
      return {
        author: postLogs.author,
        authorDisplayName: (human && human.display_name) || postLogs.author,
        authorFullName: (human && (human.first_name + " " + human.last_name)) || postLogs.author,
        authorImage: human && human.photo,
        content: postLogs.content,
        tokenId: tokenId.toString(),
        tokenURI: tokenURI,
        creationDate: new Date(postLogs.blockTime),
        supportGiven: postNFT.supportGiven,
        supportCount: postNFT.supportersCount,
      }
    }
    else {
      return {
        author: "UNKNOWN",
        authorDisplayName: "UNKNOWN",
        authorFullName: "UNKNOWN",
        authorImage: "",
        content: "",
        tokenId: tokenId.toString(),
        tokenURI: tokenURI,
        creationDate: new Date(0),
        supportGiven: postNFT.supportGiven,
        supportCount: postNFT.supportersCount,
      }
    }
  }
}

export { PostaService };

