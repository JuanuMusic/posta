import { providers, Contract, ethers, BigNumber } from "ethers";
import IPFSStorageService from "./IPFSStorageService";
//const { providers, Contract } = require('ethers');
import configService from "./configService";
import contractProvider, { EthersProviders } from "./ContractProvider";
import { Web3Provider } from "@ethersproject/providers";

export default {
  /**
   * Returns the UBI balance of an account.
   * @param address 
   * @param provider 
   * @returns 
   */
    async balanceOf(address: string, provider: Web3Provider) {
      
      const contract = await contractProvider.getUBIContractForRead(provider);
      return await contract.balanceOf(address);
    },

    async startAccruing(address: string, provider: Web3Provider) {
      const contract = await contractProvider.getUBIContractForWrite(address, provider);
      console.log("UBI CONTRACT", contract);
      const tx = await contract.startAccruing(address);
    }
}