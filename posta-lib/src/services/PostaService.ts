import { BigNumber } from "ethers";

import { IContractProvider } from "./ContractProvider";
import { POHProfileModel } from "./PohAPI";
import { PohService } from "./PoHService";

import { TransactionResponse } from "@ethersproject/abstract-provider/lib"

interface IPostaService {
  getTokenUrl(tokenId: string, contractProvider: IContractProvider): Promise<string>;
  setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void>;
  getPostLogs(tokenIds: BigNumber[], contractProvider: IContractProvider): Promise<PostLogs[] | null>;
  /**
   * Returns an array of logs that belong to replies to a given post.
   * @param forTokenId Token ID of the posxt for which to retrieve replies
   * @param contractProvider 
   */
  getPostRepliesLogs(forTokenId: BigNumber, contractProvider: IContractProvider): Promise<PostLogs[] | null>;
  giveSupport(tokenID: string, amount: BigNumber, from: string, contractProvider: IContractProvider, confirmations: number | undefined): Promise<void>;
  publishPost(postData: IPostData, contractProvider: IContractProvider): Promise<TransactionResponse>;
  getLatestPosts(maxRecords: number, contractProvider: IContractProvider): Promise<IPostaNFT[] | null>;
  requestBurnApproval(from: string, amount: BigNumber, contractProvider: IContractProvider): Promise<void>;
  buildPost(log: PostLogs, contractProvider: IContractProvider): Promise<IPostaNFT>;

  /**
   * Returns the total number of tokens minted
   * @param contractProvider 
   * @returns 
   */
  getTokenCounter(contractProvider: IContractProvider): Promise<string>;

  /**
    * Returns a list of already built posts from a list of token ids
    * @param tokenIds 
    * @param contractProvider 
    * @returns 
    */
  getPosts(tokenIds: BigNumber[], contractProvider: IContractProvider): Promise<IPostaNFT[] | null>;

  /**
    * Returns the maxChars value on the posta contract
    * @param tokenIds 
    * @param contractProvider 
    * @returns 
    */
  getMaxChars(contractProvider: IContractProvider): Promise<number>;
}

export interface IPostData {
  author: string;
  text: string;
  replyOfTokenId?: BigNumber;
}

export interface PostLogs {
  author: string,
  tokenId: BigNumber
  content: string,
  blockTime: Date,
  replyOfTokenId?: BigNumber
}

export interface IPostaNFT extends PostLogs {
  authorImage: string | undefined;
  authorDisplayName: string;
  authorFullName: string;
  content: string;
  tokenURI: string;
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
  async getPostLogs(tokenIds: BigNumber[], contractProvider: IContractProvider): Promise<PostLogs[] | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.NewPost(null, tokenIds.map(id => id.toNumber()));
    const logs = await postaContract.queryFilter(filter);


    if (!logs) return null
    const retVal = await Promise.all(logs.map(async log => {
      const block = await log.getBlock();
      
      // Default replyof is 0 (non existing token)
      let replyOfTokenId: BigNumber = BigNumber.from(0);
      
      // Check if it's a reply 
      if (log.args) {
        const isReplyFilter = postaContract.filters.NewPostReply([log.args.tokenId.toNumber()], null);
        const isReplyLogs = await postaContract.queryFilter(isReplyFilter);

        // if logs are found, set the token id of the source post
        if (isReplyLogs && isReplyLogs.length > 0) {
          replyOfTokenId = isReplyLogs[0].args && isReplyLogs[0].args.replyOfTokenId;
        }
      }

      const retItm = {
        author: log.args && log.args.author,
        tokenId: log.args && log.args.tokenId,
        // Extract text from log object
        content: log.args && log.args.value,
        // Tweet date comes from block timestamp
        blockTime: (block && new Date(block.timestamp * 1000)) || new Date(0),
        replyOfTokenId: replyOfTokenId
      };

      return retItm;
    }));

    return retVal;
  },

  /**
   * Returns an array of logs that belong to replies to a given post.
   * @param forTokenId Token ID of the posxt for which to retrieve replies
   * @param contractProvider 
   */
  async getPostRepliesLogs(forTokenId: BigNumber, contractProvider: IContractProvider): Promise<PostLogs[] | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.NewPostReply(null, [forTokenId.toNumber()]);
    const repliesLogs = await postaContract.queryFilter(filter);

    if (!repliesLogs || repliesLogs.length === 0) {
      console.log("No reply logs found for ", forTokenId.toString())
      return null;
    }
    const retVal = await Promise.all(repliesLogs.map(async log => {

      console.log(log);

      if (log.args) {
        // Get the actual post and add the tokenId of the source post
        const sourcePostLogs = await PostaService.getPostLogs([log.args.tokenId], contractProvider);
        if (!sourcePostLogs) {
          console.warn(`Couldn't find post logs of source post ${forTokenId}`)
          return null;
        }

        return {
          ...sourcePostLogs[0],
          replyOfTokenId: BigNumber.from(forTokenId),
        };
      }

      return { author: "", content: "", tokenId: BigNumber.from(0), replyOfTokenId: forTokenId, blockTime: new Date(0) }

    }));

    return retVal.filter(e => !!e) as PostLogs[];

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

      if (confirmations === 0) return tx;
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
  async publishPost(postData: IPostData, contractProvider: IContractProvider): Promise<TransactionResponse> {
    const postaContract = await contractProvider.getPostaContractForWrite(postData.author);
    if (postData.replyOfTokenId) {
      return await postaContract.replyPost(postData.text, postData.replyOfTokenId);
    } else {
      return await postaContract.publishPost(postData.text);
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
    const tokenIds: BigNumber[] = []
    for (let i = counter; i > Math.max(counter - maxRecords, 0); i--) {
      tokenIds.unshift(BigNumber.from(i));
    }

    // Build the posts
    const postsNFTs = await PostaService.getPosts(tokenIds, contractProvider);
    console.log("LATEST POSTS", postsNFTs);

    // Return the list of nfts posts
    return (postsNFTs && postsNFTs.sort((a, b) => a.tokenId.gt(b.tokenId) ? - 1 : 1)) || null;
  },

  /**
   * Returns a list of already built posts from a list of token ids
   * @param tokenIds 
   * @param contractProvider 
   * @returns 
   */
  async getPosts(tokenIds: BigNumber[], contractProvider: IContractProvider): Promise<IPostaNFT[] | null> {
    // Get logs for all token ids
    const postLogs = await PostaService.getPostLogs(tokenIds, contractProvider);
    console.log("GET POSTS", postLogs);
    if (!postLogs) return null;


    // Build the posts from the logs
    const postsNFTs: IPostaNFT[] = await Promise.all(postLogs.map(async log => await PostaService.buildPost(log, contractProvider)));
    return postsNFTs;
  },

  /**
   * Returns the total number of tokens minted
   * @param contractProvider 
   * @returns 
   */
  async getTokenCounter(contractProvider: IContractProvider): Promise<string> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const bnCounter = await postaContract.getTokenCounter();
    return bnCounter.toString();
  },

  /**
   * Builds a post object to be used for display.
   * @param tokenId 
   * @param contractProvider 
   * @returns 
   */
  async buildPost(log: PostLogs, contractProvider: IContractProvider): Promise<IPostaNFT> {
    const postaContract = await contractProvider.getPostaContractForRead();
    console.log("Building with log", log)
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
      tokenId: log.tokenId,
      tokenURI: tokenURI,
      blockTime: new Date(log.blockTime),
      supportGiven: postNFT.supportGiven,
      supportCount: postNFT.supportersCount,
      replyOfTokenId: log.replyOfTokenId
    }
  },

  /**
    * Returns the maxChars value on the posta contract
    * @param tokenIds 
    * @param contractProvider 
    * @returns 
    */
  async getMaxChars(contractProvider: IContractProvider): Promise<number> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const maxChars = await postaContract.getMaxChars();
    return maxChars.toNumber();
  }


}

export { PostaService };

