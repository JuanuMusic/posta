import { BigNumber } from "ethers";
import { IContractProvider } from "./ContractProvider";
import { TransactionResponse } from "@ethersproject/abstract-provider/lib";
interface IPostaService {
    getTokenUrl(tokenId: string, contractProvider: IContractProvider): Promise<string>;
    setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void>;
    getPostLogs(tokenIds: string[], contractProvider: IContractProvider): Promise<PostLogs[] | null>;
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
    getPosts(tokenIds: string[], contractProvider: IContractProvider): Promise<IPostaNFT[] | null>;
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
    replyOfTokenId?: string;
}
export interface PostLogs {
    author: string;
    blockTime: Date;
    content: string;
    tokenId: BigNumber;
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
declare const PostaService: IPostaService;
export { PostaService };
