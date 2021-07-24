import { BigNumber, Event } from "ethers";

import { IContractProvider } from "./ContractProvider";
import { POHProfileModel } from "./PohAPI";
import { PohService } from "./PoHService";

import { TransactionResponse } from "@ethersproject/abstract-provider/lib"

interface IPostaService {
  getTokenUrl(tokenId: BigNumber, contractProvider: IContractProvider): Promise<string>;
  setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void>;
  getPostLogs(authors: string[] | null, tokenIds: BigNumber[] | null, contractProvider: IContractProvider): Promise<PostLogs[] | null>;
  /**
   * Returns an array of logs that belong to replies to a given post.
   * @param forTokenId Token ID of the posxt for which to retrieve replies
   * @param contractProvider 
   */
  getPostRepliesLogs(forTokenId: BigNumber, contractProvider: IContractProvider): Promise<PostLogs[] | null>;
  giveSupport(tokenID: BigNumber, amount: BigNumber, from: string, contractProvider: IContractProvider, confirmations: number | undefined): Promise<void>;
  publishPost(postData: IPostData, contractProvider: IContractProvider): Promise<TransactionResponse>;
  getLatestPosts(maxRecords: number, contractProvider: IContractProvider): Promise<IPostaNFT[] | null>;
  requestBurnApproval(from: string, amount: BigNumber, contractProvider: IContractProvider): Promise<void>;
  buildPost(log: PostLogs, contractProvider: IContractProvider): Promise<IPostaNFT>;
  buildSupportLog(log: Event): Promise<SupportGivenLog>;

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
  getPosts(humans: string[] | null, tokenIds: BigNumber[] | null, contractProvider: IContractProvider): Promise<IPostaNFT[] | null>;

  /**
    * Returns the maxChars value on the posta contract
    * @param tokenIds 
    * @param contractProvider 
    * @returns 
    */
  getMaxChars(contractProvider: IContractProvider): Promise<number>;

  /**
   * Returns the burn % set on the contract.
   * @param contractProvider 
   */
  getBurnPct(contractProvider: IContractProvider): Promise<BigNumber>;

  /**
   * Returns the factor to send to for reasury when support is given.
   * @param contractProvider 
   */
  getTreasuryPct(contractProvider: IContractProvider): Promise<BigNumber>;

  /**
   * Returns a list with the top recent supporters
   * @param max The max number of top supporters to retrieve.
   * @param contractProvider 
   */
  getLastSupporters(max: number, contractProvider: IContractProvider): Promise<SupportGivenLog[] | null>;

  /**
   * Returns an array with the supporters of a post up to a max number of logs.
   * @param tokenId 
   * @param max 
   * @param contractProvider 
   */
  getSupportersOf(tokenId: BigNumber, max: number, contractProvider: IContractProvider): Promise<SupportGivenLog[] | null>;

  /**
   * Returns a list of posts authored by a specific human.
   * @param human 
   * @param contractProvider 
   */
  getPostsBy(human: string, contractProvider: IContractProvider): Promise<IPostaNFT[] | null>;
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
  async getTokenUrl(tokenId: BigNumber, contractProvider: IContractProvider): Promise<string> {
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
   * Returns an array with the posts logs to search for to build the posts.
   * @param authors Array of human addresses to fetch posts.
   * @param tokenIds Array of token IDs to fetch posts.
   * @param provider 
   * @returns 
   */
  async getPostLogs(authors: string[] | null, tokenIds: BigNumber[] | null, contractProvider: IContractProvider): Promise<PostLogs[] | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.NewPost(authors || null, tokenIds && tokenIds.map(id => id.toNumber()) || null);
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
      return null;
    }
    // Load each log
    const retVal = await Promise.all(repliesLogs.map(async log => {

      if (log.args) {

        // Get the actual post and add the tokenId of the source post
        const sourcePostLogs = await PostaService.getPostLogs(null, [log.args.tokenId], contractProvider);
        if (!sourcePostLogs) {
          console.warn(`Couldn't find post logs of source post ${forTokenId}`)
          return null;
        }

        return {
          ...sourcePostLogs[0],
          replyOfTokenId: BigNumber.from(forTokenId),
        };
      }

      // If no args on the log, just return an object with empty data
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
  async giveSupport(tokenID: BigNumber, amount: BigNumber, from: string, contractProvider: IContractProvider, confirmations: number | undefined) {

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
    const postsNFTs = await PostaService.getPosts(null, tokenIds, contractProvider);

    // Return the list of nfts posts
    return (postsNFTs && postsNFTs.sort((a, b) => a.tokenId.gt(b.tokenId) ? - 1 : 1)) || null;
  },

  /**
   * Returns a list of already built posts from a list of token ids
   * @param tokenIds 
   * @param contractProvider 
   * @returns 
   */
  async getPosts(humans: string[] | null, tokenIds: BigNumber[] | null, contractProvider: IContractProvider): Promise<IPostaNFT[] | null> {
    // Get logs for all token ids
    const postLogs = await PostaService.getPostLogs(humans, tokenIds, contractProvider);
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
    // Get post data from contract and URI
    const postNFT = await postaContract.getPost(log.tokenId);
    const tokenURI = await postaContract.tokenURI(log.tokenId);

    // Get the human that wrote the post
    let human: POHProfileModel;
    try {
      human = await PohService.getHuman(log.author, contractProvider);
    } catch (error) {
      // If fails, set human object
      human = { display_name: "", first_name: "", last_name: "" };
      console.error(error);
    }

    // Return data
    return {
      author: log.author,
      authorDisplayName: (human && human.display_name),
      authorFullName: (human && (human.first_name + " " + human.last_name)),
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
  },


  async getBurnPct(contractProvider: IContractProvider): Promise<BigNumber> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const burnPct = await postaContract.getBurnPct();
    return burnPct;
  },

  async getTreasuryPct(contractProvider: IContractProvider): Promise<BigNumber> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const burnPct = await postaContract.getTreasuryPct();
    return burnPct;
  },

  /**
   * Returns a list with the top recent supporters
   * @param max The max number of top supporters to retrieve.
   * @param contractProvider 
   */
  async getLastSupporters(max: number, contractProvider: IContractProvider): Promise<SupportGivenLog[] | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.SupportGiven(null, null);
    let logs = await postaContract.queryFilter(filter);


    if (!logs) return null
    if (logs.length > max) logs = logs.slice(0, 10);
    const retVal = await Promise.all(logs.map(PostaService.buildSupportLog));

    return retVal;
  },

  async buildSupportLog(log: Event) {
    const block = await log.getBlock();

    const retItm = {
      tokenId: log.args && log.args.tokenId,
      supporter: log.args && log.args.supporter,
      // Extract text from log object
      amount: log.args && log.args.amount,
      burnt: log.args && log.args.burnt,
      treasury: log.args && log.args.treasury,
      // Tweet date comes from block timestamp
      blockTime: (block && new Date(block.timestamp * 1000)) || new Date(0)
    };

    return retItm;
  },

  /**
   * Returns a list of posts authored by a specific human.
   * @param human 
   * @param contractProvider 
   */
  async getPostsBy(human: string, contractProvider: IContractProvider): Promise<IPostaNFT[] | null> {
    return await PostaService.getPosts([human], null, contractProvider);
  },

  /**
   * Returns an array with the supporters of a post up to a max number of logs.
   * @param tokenId 
   * @param max 
   * @param contractProvider 
   */
  async getSupportersOf(tokenId: BigNumber, max: number, contractProvider: IContractProvider): Promise<SupportGivenLog[] | null> {
    const postaContract = await contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.SupportGiven([tokenId], null);
    let logs = await postaContract.queryFilter(filter);

    if (!logs) return null
    if (logs.length > max) logs = logs.slice(0, 10);
    const retVal = await Promise.all(logs.map(PostaService.buildSupportLog));

    return retVal;
  }

}

export { PostaService };

