import { Contract, ethers } from "ethers";
import configService from "./configService";

const DummyPOHContract = require('../contracts/DummyProofOfHumanity.json');
const PostaContract = require('../contracts/Posta.json');
const UBIContract = require('../contracts/IUBI.json');

export type EthersProviders = ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc;


const contractProvider = {

    /**
     * Returns an instance of a contract for read only
     * @param contractAddress The address of the contract
     * @param abi Contract's ABI
     * @param ethersProvider Web3Provider
     * @returns 
     */
    async getContractForRead(contractAddress: string, abi: any, ethersProvider: ethers.providers.BaseProvider): Promise<Contract> {
        const contract = new Contract(contractAddress, abi, ethersProvider);
        return contract.connect(ethersProvider)
    },

    /**
     * Returns an instance of a contract for executing write operations
     * @param contractAddress 
     * @param abi 
     * @param fromAddress 
     * @param ethersProvider 
     * @returns 
     */
    async getContractForWrite(contractAddress: string, abi: any, fromAddress: string, ethersProvider: ethers.providers.JsonRpcProvider): Promise<Contract> {
        const signer = ethersProvider.getSigner(fromAddress);
        const contract = new Contract(contractAddress, abi, signer);
        return contract.connect(signer);
    },

    async getDummyPOHContractForWrite(fromAddress: string, provider: ethers.providers.JsonRpcProvider): Promise<Contract> {
        const network = await provider.getNetwork();
        const config = configService.getConfig(network.chainId);
        return await this.getContractForWrite(config.POHAddress, DummyPOHContract.abi, fromAddress, provider);
    },

    async getPostaContractForWrite(fromAddress: string, provider: ethers.providers.JsonRpcProvider): Promise<Contract> {
        const network = await provider.getNetwork();
        const config = configService.getConfig(network.chainId);
        return await this.getContractForWrite(config.PostaAddress, PostaContract.abi, fromAddress, provider);
    },

    /**
     * Returns an instance of the PostaContract to execute read operations.
     * @param provider Web3Provider
     * @returns 
     */
    async getPostaContractForRead(provider: ethers.providers.BaseProvider): Promise<Contract> {
        const network = await provider.getNetwork();
        const config = configService.getConfig(network.chainId);
        return await this.getContractForRead(config.PostaAddress, PostaContract.abi, provider);
    },

    async getUBIContractForRead(provider: ethers.providers.BaseProvider): Promise<Contract> {
        const network = await provider.getNetwork();
        const config = configService.getConfig(network.chainId);
        return await this.getContractForRead(config.UBIAddress, UBIContract.abi, provider);
    },

    async getUBIContractForWrite(address: string, provider: ethers.providers.JsonRpcProvider): Promise<Contract> {
        const network = await provider.getNetwork();
        const config = configService.getConfig(network.chainId);
        return await this.getContractForWrite(config.UBIAddress, UBIContract.abi, address, provider);
    },

    async getPostaContractAddress(provider: ethers.providers.BaseProvider) {
        const network = await provider.getNetwork();
        const config = configService.getConfig(network.chainId);
        return config.PostaAddress;
    }

}

export default contractProvider;