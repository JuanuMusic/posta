import{ IContractProvider } from "./ContractProvider";
//const { providers, Contract } = require('ethers');

export default {
  async registerHuman(address: string, contractProvider: IContractProvider) {
    const dummyPoh = await contractProvider.getDummyPOHContractForWrite(address);
    return await dummyPoh.register(address);
  }
}