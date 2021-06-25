import { Contract, ethers } from "ethers";
import configService from "./configService";
import contractProvider from "./ContractProvider";
//const { providers, Contract } = require('ethers');
const POH = require('../contracts/DummyProofOfHumanity.json');

export default {
  async registerHuman(address: string, provider: any) {
    const dummyPoh = await contractProvider.getDummyPOHContractForWrite(address, provider);
    return await dummyPoh.register(address);
  }
}