import { IContractProvider } from "./ContractProvider";

const UBIService = {
  /**
   * Returns the UBI balance of an account.
   * @param address 
   * @param provider 
   * @returns 
   */
  async balanceOf(address: string, contractProvider: IContractProvider) {
    if(!address) throw new Error(`Invalid address ${address}`);
    const contract = await contractProvider.getUBIContractForRead();
    return await contract.balanceOf(address);
  },

  /** Call to Start accruing UBI  */
  async startAccruing(address: string, contractProvider: IContractProvider) {
    const contract = await contractProvider.getUBIContractForWrite(address);
    const tx = await contract.startAccruing(address);
  }
}

export { UBIService }