import { Contract, ethers } from "ethers";
import configService from "./configService";

export type EthersProviders = ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc;
type EthersParamType = string | ethers.utils.ParamType

export interface IContractProvider {
    config: IConfiguration;
    ethersProvider: ethers.providers.BaseProvider;
    /**
    * Returns an instance of a contract for read only
    * @param contractAddress The address of the contract
    * @param abi Contract's ABI
    * @param ethersProvider Web3Provider
    * @returns 
    */
    getContractForRead(contractAddress: string, abi: any): Promise<Contract>;

    /**
     * Returns an instance of a contract for executing write operations
     * @param contractAddress 
     * @param abi 
     * @param fromAddress 
     * @param ethersProvider 
     * @returns 
     */
    getContractForWrite(contractAddress: string, abi: any, fromAddress: string): Promise<Contract>;
    getDummyPOHContractForWrite(fromAddress: string): Promise<Contract>;
    getPostaContractForWrite(fromAddress: string): Promise<Contract>;

    /**
     * Returns an instance of the PostaContract to execute read operations.
     * @param provider Web3Provider
     * @returns 
     */
    getPostaContractForRead(): Promise<Contract>;
    getPohContractForRead(): Promise<Contract>;
    getUBIContractForRead(): Promise<Contract>;
    getUBIContractForWrite(address: string): Promise<Contract>;
    getSigner(signer: string) : ethers.providers.JsonRpcSigner;
    signMessage(types: EthersParamType[], data: any[], signerAddress: string) : Promise<string>;
}

export interface IConfiguration {
    network: {
        URL: string,
        chainID: number,
        name: string,
    },
    PostaAddress: string,
    POHAddress: string,
    UBIAddress: string,
    pohApiBaseUrl: string,
}

export interface IContractsDefinitions {
    PostaContract: any,
    UBIContract: any;
    POHContract: any;
}

export class ContractProvider implements IContractProvider {

    _provider: ethers.providers.JsonRpcProvider | ethers.providers.BaseProvider;
    _config: IConfiguration;
    _contracts: IContractsDefinitions;

    constructor(config: IConfiguration, provider: ethers.providers.JsonRpcProvider | ethers.providers.BaseProvider | undefined, contracts: IContractsDefinitions) {
        this._provider = provider || configService.getEthersProvider();
        this._config = config;
        this._contracts = contracts;
    }

    getSigner(signer: string) : ethers.providers.JsonRpcSigner {
        if(!this._provider) throw new Error("JsonRpcProvider not set");
        return (this._provider as ethers.providers.JsonRpcProvider).getSigner(signer);

    }

    get config (): IConfiguration {
        return this._config;
    }

    get ethersProvider() : ethers.providers.BaseProvider {
        return this._provider;
    }

    /**
     * Returns an instance of a contract for read only
     * @param contractAddress The address of the contract
     * @param abi Contract's ABI
     * @param ethersProvider Web3Provider
     * @returns 
     */
    async getContractForRead(contractAddress: string, abi: any): Promise<Contract> {
        const contract = new Contract(contractAddress, abi, this._provider);
        return contract.connect(this._provider)
    }

    /**
     * Returns an instance of a contract for executing write operations
     * @param contractAddress 
     * @param abi 
     * @param fromAddress 
     * @param ethersProvider 
     * @returns 
     */
    async getContractForWrite(contractAddress: string, abi: any, fromAddress: string): Promise<Contract> {
        const signer = this.getSigner(fromAddress);
        const contract = new Contract(contractAddress, abi, signer);
        return contract.connect(signer);
    }

    async getDummyPOHContractForWrite(fromAddress: string): Promise<Contract> {
        return await this.getContractForWrite(this._config.POHAddress, this._contracts.POHContract.abi, fromAddress);
    }

    async getPohContractForRead(): Promise<Contract> {
        return await this.getContractForRead(this._config.POHAddress, this._contracts.POHContract.abi);
    }

    async getPostaContractForWrite(fromAddress: string): Promise<Contract> {
        return await this.getContractForWrite(this._config.PostaAddress, this._contracts.PostaContract.abi, fromAddress);
    }

    /**
     * Returns an instance of the PostaContract to execute read operations.
     * @param provider Web3Provider
     * @returns 
     */
    async getPostaContractForRead(): Promise<Contract> {
        return await this.getContractForRead(this._config.PostaAddress, this._contracts.PostaContract.abi);
    }

    async getUBIContractForRead(): Promise<Contract> {
        return await this.getContractForRead(this._config.UBIAddress, this._contracts.UBIContract.abi);
    }

    async getUBIContractForWrite(address: string): Promise<Contract> {
        return await this.getContractForWrite(this._config.UBIAddress, this._contracts.UBIContract.abi, address);
    }

    async signMessage(types: EthersParamType[], data: any[], signerAddress: string) : Promise<string> {
        let payload = ethers.utils.defaultAbiCoder.encode(types, data);
        let payloadHash = ethers.utils.keccak256(payload);
    
        // This adds the message prefix
        const signer = this.getSigner(signerAddress);
        let signature = await signer.signMessage(ethers.utils.arrayify(payloadHash));
        return signature;
      }

}