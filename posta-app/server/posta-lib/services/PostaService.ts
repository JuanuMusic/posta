import { BigNumber, ethers, Event } from "ethers";

import { IContractProvider } from "./ContractProvider";
import { POHProfileModel } from "./PohAPI";
import { PohService } from "./PoHService";

import { TransactionResponse } from "@ethersproject/abstract-provider/lib"

interface IPostaService {
  getTokenUrl(tokenId: BigNumber): Promise<string>;
  setBaseURI(from: string, baseUrl: string): Promise<void>;
  getPostLogs(authors: string[] | null, tokenIds: BigNumber[] | null): Promise<PostLogs[] | null>;
  /**
   * Returns an array of logs that belong to replies to a given post.
   * @param forTokenId Token ID of the posxt for which to retrieve replies
   * @param contractProvider 
   */
  getPostRepliesLogs(forTokenId: BigNumber): Promise<PostLogs[] | null>;
  giveSupport(tokenID: BigNumber, amount: BigNumber, from: string, confirmations: number | undefined): Promise<void>;
  publishPost(postData: IPostData): Promise<TransactionResponse>;
  publishOnBehalfOf(postRequest: ISignedPostRequest, funderAddress: string): Promise<TransactionResponse>;
  getLatestPosts(maxRecords: number): Promise<IPostaNFT[] | null>;

  /**
  * Get a list of consecutive posts
  * @param fromTokenId Token id to start fetching results.
  * @param maxRecords Max number of records to fetch.
  * @param provider 
  * @returns 
  */
  getConsecutivePosts(fromTokenId: number, maxRecords: number): Promise<IPostaNFT[] | null>;

  requestBurnApproval(from: string, amount: BigNumber): Promise<void>;
  buildPost(log: PostLogs): Promise<IPostaNFT>;
  buildSupportLog(log: Event): Promise<SupportGivenLog>;

  /**
   * Returns the total number of tokens minted
   * @param contractProvider 
   * @returns 
   */
  getTokenCounter(): Promise<BigNumber>;

  /**
    * Returns a list of already built posts from a list of token ids
    * @param tokenIds 
    * @param contractProvider 
    * @returns 
    */
  getPosts(humans: string[] | null, tokenIds: BigNumber[] | null): Promise<IPostaNFT[] | null>;

  /**
    * Returns the maxChars value on the posta contract
    * @param tokenIds 
    * @param contractProvider 
    * @returns 
    */
  getMaxChars(): Promise<number>;

  /**
   * Returns the burn % set on the contract.
   * @param contractProvider 
   */
  getBurnPct(): Promise<BigNumber>;

  /**
   * Returns the factor to send to for reasury when support is given.
   * @param contractProvider 
   */
  getTreasuryPct(): Promise<BigNumber>;

  /**
   * Returns a list with the top recent supporters
   * @param max The max number of top supporters to retrieve.
   * @param contractProvider 
   */
  getLastSupporters(max: number): Promise<SupportGivenLog[] | null>;

  /**
   * Returns an array with the supporters of a post up to a max number of logs.
   * @param tokenId 
   * @param max 
   * @param contractProvider 
   */
  getSupportersOf(tokenId: BigNumber, max: number): Promise<SupportGivenLog[] | null>;

  /**
   * Returns a list of posts authored by a specific human.
   * @param human 
   * @param contractProvider 
   */
  getPostsBy(human: string): Promise<IPostaNFT[] | null>;

  /*
  * Sign a posta request
  */
  signPostaRequest(postData: IPostRequest, nonce: number) : Promise<string>;
}

export interface IPostData {
  author: string;
  text: string;
  replyOfTokenId?: BigNumber;
}

/**
 * Represnts a post request.
 */
export interface IPostRequest extends IPostData {
  nonce: number;
}

// Signed post request
export interface ISignedPostRequest extends IPostRequest {
  signature: string;
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


class PostaService implements IPostaService {

  private _pohService : PohService;
  private _contractProvider: IContractProvider;

  constructor(pohService: PohService, contractProvider: IContractProvider) {
    this._pohService = pohService;
    this._contractProvider = contractProvider;
  }

  /**
   * Gets the token URL with JSON metadata
   * @param tokenId 
   * @param provider 
   */
  async getTokenUrl(tokenId: BigNumber): Promise<string> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const uri = await postaContract.tokenURI(tokenId);
    return uri;
  }

  /**
   * Sets the base url for buiulding the tokenURI.
   * OnlyOwner
   * @param baseUrl 
   * @param provider 
   */
  async setBaseURI(from: string, baseUrl: string): Promise<void> {
    const postaContract = await this._contractProvider.getPostaContractForWrite(from);
    const tx = await postaContract.setBaseURI(baseUrl);
    console.log("SET BASE URL TX", tx);
  }

  /**
   * Returns an array with the posts logs to search for to build the posts.
   * @param authors Array of human addresses to fetch posts.
   * @param tokenIds Array of token IDs to fetch posts.
   * @param provider 
   * @returns 
   */
  async getPostLogs(authors: string[] | null, tokenIds: BigNumber[] | null): Promise<PostLogs[] | null> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
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
  }



  /**
   * Returns an array of logs that belong to replies to a given post.
   * @param forTokenId Token ID of the posxt for which to retrieve replies
   * @param contractProvider 
   */
  async getPostRepliesLogs(forTokenId: BigNumber): Promise<PostLogs[] | null> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.NewPostReply(null, [forTokenId.toNumber()]);
    const repliesLogs = await postaContract.queryFilter(filter);

    if (!repliesLogs || repliesLogs.length === 0) {
      return null;
    }
    // Load each log
    const retVal = await Promise.all(repliesLogs.map(async log => {

      if (log.args) {

        // Get the actual post and add the tokenId of the source post
        const sourcePostLogs = await this.getPostLogs(null, [log.args.tokenId]);
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

  }

  /**
   * Requests approval to burn UBIs on the Posta contract.
   * @param from Human address that burns their UBIs
   * @param provider Web3Provider
   * @param waitConfirmation Wait for this confirmations to complete transaction.
   */
  async requestBurnApproval(from: string, amount: BigNumber) {
    const ubiContract = await this._contractProvider.getUBIContractForWrite(from);
    const approvalTx = await ubiContract.approve(await this._contractProvider.config.PostaAddress, amount);
    return await approvalTx.wait(DEFAULT_CONFIRMATIONS);
  }

  /**
   * Burn UBIs to support a users NFT.
   * @param tokenID IUD of the NFT to give support
   * @param amount amount of UBIs to be burned
   * @param from Human burning their UBIs.
   * @param provider Web3Provider
   */
  async giveSupport(tokenID: BigNumber, amount: BigNumber, from: string, confirmations: number | undefined) {

    try {
      // Give support using the Posta contract (which burns half of the UBI)
      const contract = await this._contractProvider.getPostaContractForWrite(from);
      const tx = await contract.support(tokenID, amount);

      if (confirmations === 0) return tx;
      return await tx.wait(confirmations || DEFAULT_CONFIRMATIONS);
    }
    catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
  }

  /**
   * Takes care of publishing a post. 
   * It first uploads the post to a Decentralized service and then mints the NFT with the URL to it.
   * @param postData Data of the post
   * @param drizzle 
   */
  async publishPost(postData: IPostData): Promise<TransactionResponse> {
    const postaContract = await this._contractProvider.getPostaContractForWrite(postData.author);
    return await postaContract.publishPost(postData.text, postData.replyOfTokenId || 0);
  }

  async publishOnBehalfOf(postRequest: ISignedPostRequest, funderAddress: string): Promise<TransactionResponse> {
    const postaContract = await this._contractProvider.getPostaContractForWrite(funderAddress);

    return await postaContract.publishOnBehalfOf(postRequest.text, postRequest.author, postRequest.replyOfTokenId || "0", postRequest.nonce, postRequest.signature);
  }

  /**
  * Get a list of consecutive posts
  * @param fromTokenId Token id to start fetching results.
  * @param maxRecords Max number of records to fetch.
  * @param provider 
  * @returns 
  */
   async getConsecutivePosts(fromTokenId: number, maxRecords: number): Promise<IPostaNFT[] | null> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const bnCounter = await postaContract.getTokenCounter();
    const counter = Math.min(bnCounter.toNumber(), fromTokenId);

    // Build the token id array to fetch from logs
    const tokenIds: BigNumber[] = []
    for (let i = counter; i > Math.max(counter - maxRecords, 0); i--) {
      tokenIds.unshift(BigNumber.from(i));
    }

    // Build the posts
    const postsNFTs = await this.getPosts(null, tokenIds);

    // Return the list of nfts posts
    return (postsNFTs && postsNFTs.sort((a, b) => a.tokenId.gt(b.tokenId) ? - 1 : 1)) || null;
  }

  /**
  * Get the latest posts
  * @param provider 
  * @param maxRecords Max number of records to fetch.
  * @returns 
  */
  async getLatestPosts(maxRecords: number): Promise<IPostaNFT[] | null> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const bnCounter = await postaContract.getTokenCounter();
    const counter = bnCounter.toNumber()
    return await this.getConsecutivePosts(counter, maxRecords);
  }

  /**
   * Returns a list of already built posts from a list of token ids
   * @param tokenIds 
   * @param contractProvider 
   * @returns 
   */
  async getPosts(humans: string[] | null, tokenIds: BigNumber[] | null): Promise<IPostaNFT[] | null> {
    // Get logs for all token ids
    const postLogs = await this.getPostLogs(humans, tokenIds);
    if (!postLogs) return null;


    // Build the posts from the logs
    const postsNFTs: IPostaNFT[] = await Promise.all(postLogs.map(async log => await this.buildPost(log)));
    return postsNFTs;
  }

  /**
   * Returns the total number of tokens minted
   * @param contractProvider 
   * @returns 
   */
  async getTokenCounter(): Promise<BigNumber> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const bnCounter = await postaContract.getTokenCounter();
    return bnCounter;
  }

  /**
   * Builds a post object to be used for display.
   * @param tokenId 
   * @param contractProvider 
   * @returns 
   */
  async buildPost(log: PostLogs): Promise<IPostaNFT> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    // Get post data from contract and URI
    const postNFT = await postaContract.getPost(log.tokenId);
    const tokenURI = await postaContract.tokenURI(log.tokenId);

    // Get the human that wrote the post
    let human: POHProfileModel;
    try {
      human = await this._pohService.getHuman(log.author);
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
  }

  /**
    * Returns the maxChars value on the posta contract
    * @param tokenIds 
    * @param contractProvider 
    * @returns 
    */
  async getMaxChars(): Promise<number> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const maxChars = await postaContract.getMaxChars();
    return maxChars.toNumber();
  }


  async getBurnPct(): Promise<BigNumber> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const burnPct = await postaContract.getBurnPct();
    return burnPct;
  }

  async getTreasuryPct(): Promise<BigNumber> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const treasuryPct = await postaContract.getTreasuryPct();
    return treasuryPct;
  }

  /**
   * Returns a list with the top recent supporters
   * @param max The max number of top supporters to retrieve.
   * @param contractProvider 
   */
  async getLastSupporters(max: number): Promise<SupportGivenLog[] | null> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.SupportGiven(null, null);
    let logs = await postaContract.queryFilter(filter);


    if (!logs) return null
    if (logs.length > max) logs = logs.slice(0, 10);
    const retVal = await Promise.all(logs.map(this.buildSupportLog));

    return retVal;
  }

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
  }

  /**
   * Returns a list of posts authored by a specific human.
   * @param human 
   * @param contractProvider 
   */
  async getPostsBy(human: string): Promise<IPostaNFT[] | null> {
    return await this.getPosts([human], null);
  }

  /**
   * Returns an array with the supporters of a post up to a max number of logs.
   * @param tokenId 
   * @param max 
   * @param contractProvider 
   */
  async getSupportersOf(tokenId: BigNumber, max: number): Promise<SupportGivenLog[] | null> {
    const postaContract = await this._contractProvider.getPostaContractForRead();
    const filter = postaContract.filters.SupportGiven([tokenId], null);
    let logs = await postaContract.queryFilter(filter);

    if (!logs) return null
    if (logs.length > max) logs = logs.slice(0, 10);
    const retVal = await Promise.all(logs.map(this.buildSupportLog));

    return retVal;
  }

  async signPostaRequest(postData: IPostRequest) : Promise<string> {
    console.log("SIGNING WITH", postData);
    //  Sign message with data
    return await this._contractProvider?.signMessage(
      ["address", "uint256", "uint256", "string"],
      [
        postData.author,
        postData.replyOfTokenId ? postData.replyOfTokenId.toString() : "0",
        postData.nonce,
        postData.text,
      ],
      postData.author
    );
  }

}

export { PostaService };