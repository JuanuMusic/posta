import { ethers, BigNumber, EventFilter } from "ethers";

import contractProvider, { EthersProviders } from "./ContractProvider";
import PohAPI from "../DAL/PohAPI";
import PohService from "./PoHService";

interface IPostaService {
  getTokenUrl(tokenId: string, provider: ethers.providers.BaseProvider): Promise<string>;
  setBaseURI(from: string, baseUrl: string, provider: ethers.providers.BaseProvider): Promise<void>;
  getPostLogs(tokenId: BigNumber, provider: ethers.providers.BaseProvider): Promise<PostLogs>;
  giveSupport(tokenID: string, amount: BigNumber, from: string, provider: ethers.providers.BaseProvider, confirmations: number | undefined): Promise<void>;
  publishPost(postData: IPostData, provider: ethers.providers.BaseProvider): Promise<void>;
  getLatestPosts(maxRecords: number, provider: ethers.providers.BaseProvider): Promise<IPostaNFT[]>;
  requestBurnApproval(from: string, amount: BigNumber, provider: ethers.providers.BaseProvider): Promise<void>;
}

interface PostLogs {
  author: string,
  blockTime: Date,
  content: string
}

const DEFAULT_CONFIRMATIONS = 5;


const PostaService: IPostaService = {
  /**
   * Gets the token URL with JSON metadata
   * @param tokenId 
   * @param provider 
   */
  async getTokenUrl(tokenId: string, provider: ethers.providers.BaseProvider): Promise<string> {
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
  async setBaseURI(from: string, baseUrl: string, provider: ethers.providers.JsonRpcProvider): Promise<void> {
    const postaContract = await contractProvider.getPostaContractForWrite(from, provider);
    const tx = await postaContract.setBaseURI(baseUrl);
    console.log("SET BASE URL TX", tx);
  },

  /**
   * Returns an array with the posts logs to build the posts.
   * @param tokenId 
   * @param provider 
   * @returns 
   */
  async getPostLogs(tokenId: BigNumber, provider: ethers.providers.BaseProvider): Promise<PostLogs> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.NewPost(null, tokenId);
    const log = await postaContract.queryFilter(filter);
    const block = await log[0].getBlock();
    return {
      author: log && log.length && log[0].args && log[0].args.length >= 3 && log[0].args[0],
      // Extract text from log object
      content: log && log.length && log[0].args && log[0].args.length >= 3 && log[0].args[2],
      // Tweet date comes from block timestamp
      blockTime: new Date(block.timestamp * 1000)
    };
  },
  
  /**
   * Requests approval to burn UBIs on the Posta contract.
   * @param from Human address that burns their UBIs
   * @param provider Web3Provider
   * @param waitConfirmation Wait for this confirmations to complete transaction.
   */
  async requestBurnApproval(from: string, amount: BigNumber, provider: ethers.providers.JsonRpcProvider) {
    const ubiContract = await contractProvider.getUBIContractForWrite(from, provider);
    const approvalTx = await ubiContract.approve(await contractProvider.getPostaContractAddress(provider), amount);
    return await approvalTx.wait(DEFAULT_CONFIRMATIONS);
  },

  /**
   * Burn UBIs to support a users NFT.
   * @param tokenID IUD of the NFT to give support
   * @param amount amount of UBIs to be burned
   * @param from Human burning their UBIs.
   * @param provider Web3Provider
   */
  async giveSupport(tokenID: string, amount: BigNumber, from: string, provider: ethers.providers.JsonRpcProvider, confirmations: number | undefined) {

    try {
      // Give support using the Posta contract (which burns half of the UBI)
      const contract = await contractProvider.getPostaContractForWrite(from, provider);
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
  async publishPost(postData: IPostData, provider: ethers.providers.JsonRpcProvider) {

    try {
      const postaContract = await contractProvider.getPostaContractForWrite(postData.author, provider);
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
  async getLatestPosts(maxRecords: number, provider: ethers.providers.BaseProvider): Promise<IPostaNFT[]> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const counter = await postaContract.getTokenCounter();
    const postsNFTs: IPostaNFT[] = [];

    // Loop from the last
    for (let tokenId = counter - 1; tokenId >= Math.max(tokenId - maxRecords, 0); tokenId--) {

      // Get NFT data from the contract and add it to the collection of posts 
      const post = await buildPost(postaContract, tokenId, provider);
      postsNFTs.unshift(post);
    }

    return postsNFTs;
  }
}

export default PostaService;

async function buildPost(postaContract: ethers.Contract, tokenId: number, provider: ethers.providers.BaseProvider): Promise<IPostaNFT> {
  const postNFT = await postaContract.getPost(tokenId);
  const postLogs = await PostaService.getPostLogs(BigNumber.from(tokenId), provider);
  const tokenURI = await postaContract.tokenURI(tokenId);
  let human: POHProfileModel;
  try {
    human = await PohService.getHuman(postLogs.author)
  } catch (error) {
    // If fails, set human object
    human = { display_name: "", first_name: "", last_name: "" };
    console.error(error);
  }

  // Add the NFT to the list of nfts
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
  };
}
