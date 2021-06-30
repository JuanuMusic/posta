import { BigNumber } from "ethers";
import { IContractProvider } from "./ContractProvider";
interface IPostaService {
    getTokenUrl(tokenId: string, contractProvider: IContractProvider): Promise<string>;
    setBaseURI(from: string, baseUrl: string, contractProvider: IContractProvider): Promise<void>;
    getPostLogs(tokenIds: BigNumber[], contractProvider: IContractProvider): Promise<PostLogs[] | null>;
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
