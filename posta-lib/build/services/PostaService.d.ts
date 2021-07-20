import { BigNumber } from "ethers";
import { IContractProvider } from "./ContractProvider";
import { TransactionResponse } from "@ethersproject/abstract-provider/lib";
interface IPostaService {
    getTokenUrl(tokenId: BigNumber, contractProvider: IContractProvider): Promise<string>;
    setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void>;
    getPostLogs(tokenIds: BigNumber[], contractProvider: IContractProvider): Promise<PostLogs[] | null>;
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
    author: string;
    tokenId: BigNumber;
    content: string;
    blockTime: Date;
    replyOfTokenId?: BigNumber;
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
declare const PostaService: IPostaService;
export { PostaService };
