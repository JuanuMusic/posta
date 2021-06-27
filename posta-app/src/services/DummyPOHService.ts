import { Contract, ethers } from "ethers";
import configService from "./configService";
import contractProvider from "./ContractProvider";
//const { providers, Contract } = require('ethers');

export default {
  async registerHuman(address: string, provider: ethers.providers.JsonRpcProvider) {
    const dummyPoh = await contractProvider.getDummyPOHContractForWrite(address, provider);
    return await dummyPoh.register(address);
  }
}