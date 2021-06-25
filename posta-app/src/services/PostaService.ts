import { ethers, BigNumber } from "ethers";
import IPFSStorageService from "./IPFSStorageService";
import contractProvider, { EthersProviders } from "./ContractProvider";
import PohAPI from "../DAL/PohAPI";

interface IPostaService {
  giveSupport(tokenID: string, amount: BigNumber, from: string, provider: ethers.providers.Web3Provider): Promise<void>;
  publishPost(postData: IPostData, provider: ethers.providers.Web3Provider): Promise<void>;
  getLatestPosts(maxRecords: number, provider: ethers.providers.Web3Provider): Promise<IPostaNFT[]>;
  loadPostFromNFT(postNFT: IPostaNFT): Promise<PostData>;
  requestBurnApproval(from: string, amount: BigNumber, provider: ethers.providers.Web3Provider): Promise<void>;
}

interface PostData extends IPostaNFT {
  authorImage: string | undefined;
  authorDisplayName: string;
  authorFullName: string;
  text: string;
}

const DEFAULT_CONFIRMATIONS = 5;


const PostaService: IPostaService = {

  /**
   * Requests approval to burn UBIs on the Posta contract.
   * @param from Human address that burns their UBIs
   * @param provider Web3Provider
   * @param waitConfirmation Wait for this confirmations to complete transaction.
   */
  async requestBurnApproval(from: string, amount: BigNumber, provider: ethers.providers.Web3Provider) {
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
  async giveSupport(tokenID: string, amount: BigNumber, from: string, provider: ethers.providers.Web3Provider) {

    try {      
      // Give support using the Posta contract (which burns half of the UBI)
      const contract = await contractProvider.getPostaContractForWrite(from, provider);
      const tx = await contract.support(tokenID, amount);
      return await tx.wait(DEFAULT_CONFIRMATIONS);
    }
    catch (error) {
      console.log()
    }



  },

  /**
   * Takes care of publishing a post. 
   * It first uploads the post to a Decentralized service and then mints the NFT with the URL to it.
   * @param postData Data of the post
   * @param drizzle 
   */
  async publishPost(postData: IPostData, provider: ethers.providers.Web3Provider) {

    // upload the post to the storage service and get the path to the uploaded file
    const uploadedPath = await IPFSStorageService.uploadPost(postData);
    console.log("UPOADED FILE TO IPFS: ", uploadedPath)
    // Create as NFT on the Posta contract

    try {
      const postaContract = await contractProvider.getPostaContractForWrite(postData.author, provider);
      const tx = await postaContract.publishPost(`${uploadedPath}`);
      await tx.wait(7);
      console.log("Post published TX:", tx);
    }
    catch (error) {
      console.log("error", error);
    }
  },

  /**
   * Get the latest posts
   * @param provider 
   * @param maxRecords Max number of records to fetch.
   * @returns 
   */
  async getLatestPosts(maxRecords: number, provider: ethers.providers.Web3Provider): Promise<IPostaNFT[]> {
    const postaContract = await contractProvider.getPostaContractForRead(provider);
    console.log("HPST CONTRACT", postaContract)
    const counter = await postaContract.getTokenCounter();

    console.log("TOTAL HPSTs", counter);
    const postsNFTs: IPostaNFT[] = [];

    // Loop from the last
    for (let tokenId = counter - 1; tokenId >= Math.max(tokenId - maxRecords, 0); tokenId--) {
      // Get NFT data from the contract and add it to the collection of posts 
      const postNFT = await postaContract.getPost(tokenId);

      console.log("NFT", postNFT);

      // Add the NFT to the list of nfts
      postsNFTs.unshift({
        tokenId: tokenId.toString(),
        tokenURI: postNFT.tokenURI,
        creationDate: new Date(parseInt(postNFT.date, 10) * 1000),
        supportGiven: postNFT.supportGiven,
        supportCount: postNFT.supportCount
      });
    }
    return postsNFTs;
  },

  /**Load a post data from the token URI
   * @param postNFT NFT to load the data from.
   */
  async loadPostFromNFT(postNFT: IPostaNFT): Promise<PostData> {
    const postFile = await fetch(`http://127.0.0.1:8080/ipfs/${postNFT.tokenURI.replace("ipfs://", "")}`);
    const data: IPostData = await postFile.json();

    // Get the user registration data or an empty object
    const userRegistration = (await PohAPI.profiles.getByAddress(data.author)) || ({} as POHProfileModel);

    // Build the return value.
    const retVal: PostData = {
      ...postNFT,
      authorDisplayName: userRegistration.display_name || data.author,
      authorFullName: `${userRegistration.first_name} ${userRegistration.last_name}`,
      authorImage: userRegistration.photo,
      text: data.text,
    };

    return retVal;

  }
}

export default PostaService;