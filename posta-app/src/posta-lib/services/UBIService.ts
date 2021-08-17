import { IContractProvider } from "./ContractProvider";

class UBIService {
  
  private _contractProvider: IContractProvider;

  constructor(contractProvider: IContractProvider) {
    this._contractProvider = contractProvider;
  }
  /**
   * Returns the UBI balance of an account.
   * @param address 
   * @param provider 
   * @returns 
   */
  async balanceOf(address: string) {
    try {
      if (!address) throw new Error(`Invalid address ${address}`);
      const contract = await this._contractProvider.getUBIContractForRead();
      return await contract.balanceOf(address);
    }
    catch (error) {
      console.error("Error getting UBI balance", error.message);
      console.error(error.stack);
      return 0;
    }
  }

  /** Call to Start accruing UBI  */
  async startAccruing(address: string) {
    const contract = await this._contractProvider.getUBIContractForWrite(address);
    const tx = await contract.startAccruing(address);
    return tx;
  }
}

export { UBIService }