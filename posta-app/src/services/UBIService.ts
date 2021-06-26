import contractProvider from "./ContractProvider";
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

    /** Call to Start accruing UBI  */
    async startAccruing(address: string, provider: Web3Provider) {
      const contract = await contractProvider.getUBIContractForWrite(address, provider);
      const tx = await contract.startAccruing(address);
    }
}