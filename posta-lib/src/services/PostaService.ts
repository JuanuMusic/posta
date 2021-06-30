import { ethers, BigNumber } from "ethers";

import { IContractProvider } from "./ContractProvider";
import { POHProfileModel } from "./PohAPI";
import { PohService } from "./PoHService";

interface IPostaService {
  getTokenUrl(tokenId: string, contractProvider: IContractProvider): Promise<string>;
  setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void>;
  getPostLogs(tokenIds: number[], contractProvider: IContractProvider): Promise<PostLogs[] | null>;
  giveSupport(tokenID: string, amount: BigNumber, from: string, contractProvider: IContractProvider, confirmations: number | undefined): Promise<void>;
  publishPost(postData: IPostData, contractProvider: IContractProvider): Promise<void>;
  getLatestPosts(maxRecords: number, contractProvider: IContractProvider): Promise<IPostaNFT[] | null>;
  requestBurnApproval(from: string, amount: BigNumber, contractProvider: IContractProvider): Promise<void>;
  buildPost(log: PostLogs, contractProvider: IContractProvider): Promise<IPostaNFT>;
}

export interface IPostData {
  author: string;
  text: string;
}

export interface PostLogs {
  author: string,
  blockTime: Date,
  content: string,
  tokenId: BigNumber
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
   * @param tokenIds 
   * @param provider 
   * @returns 
   */
  async getPostLogs(tokenIds: number[], contractProvider: IContractProvider): Promise<PostLogs[] | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.NewPost(null, tokenIds);
    const logs = await postaContract.queryFilter(filter);
    if (!logs) return null
    const retVal = await Promise.all(logs.map(async log => {
      const block = await log.getBlock();
      return {
        author: log.args && log.args.length >= 3 && log.args[0],
        tokenId: log.args && log.args.length >= 3 && log.args[1],
        // Extract text from log object
        content: log.args && log.args.length >= 3 && log.args[2],
        // Tweet date comes from block timestamp
        blockTime: block && new Date(block.timestamp * 1000) || new Date(0)
      };
    }));

    return retVal;
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
  async getLatestPosts(maxRecords: number, contractProvider: IContractProvider): Promise<IPostaNFT[] | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const bnCounter = await postaContract.getTokenCounter();
    const counter = bnCounter.toNumber()

    // Build the token id array to fetch from logs
    const tokenIds = []
    for (let i = counter - 1; i >= Math.max(counter - maxRecords, 0); i--) {
      tokenIds.unshift(i);
    }
    // Get logs for all token ids
    const postLogs = await PostaService.getPostLogs(tokenIds, contractProvider);
    if (!postLogs) return null;


    // Build the posts from the logs
    const postsNFTs: IPostaNFT[] = await Promise.all(postLogs.map(async log => await PostaService.buildPost(log, contractProvider)));

    // Return the list of nfts posts
    return postsNFTs.sort((a, b) => parseInt(a.tokenId, 10) > parseInt(b.tokenId, 10) ? - 1 : 1);
  },

  /**
   * Builds a post object to be used for display.
   * @param tokenId 
   * @param contractProvider 
   * @returns 
   */
  async buildPost(log: PostLogs, contractProvider: IContractProvider): Promise<IPostaNFT> {
    const postaContract = await contractProvider.getPostaContractForRead();

    const postNFT = await postaContract.getPost(log.tokenId);
    const tokenURI = await postaContract.tokenURI(log.tokenId);


    let human: POHProfileModel;
    try {
      human = await PohService.getHuman(log.author)
    } catch (error) {
      // If fails, set human object
      human = { display_name: "", first_name: "", last_name: "" };
      console.error(error);
    }
    return {
      author: log.author,
      authorDisplayName: (human && human.display_name) || log.author,
      authorFullName: (human && (human.first_name + " " + human.last_name)) || log.author,
      authorImage: human && human.photo,
      content: log.content,
      tokenId: log.tokenId.toString(),
      tokenURI: tokenURI,
      creationDate: new Date(log.blockTime),
      supportGiven: postNFT.supportGiven,
      supportCount: postNFT.supportersCount,
    }
  }
}

export { PostaService };

