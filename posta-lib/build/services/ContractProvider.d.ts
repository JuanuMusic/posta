import { Contract, ethers } from "ethers";
export declare type EthersProviders = ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc;
export interface IContractProvider {
    config: IConfiguration;
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
    getUBIContractForRead(): Promise<Contract>;
    getUBIContractForWrite(address: string): Promise<Contract>;
}
export interface IConfiguration {
    network: string;
    PostaAddress: string;
    POHAddress: string;
    UBIAddress: string;
    pohApiBaseUrl: string;
}
export interface IContractsDefinitions {
    PostaContract: any;
    UBIContract: any;
    POHContract: any;
}
export declare class ContractProvider implements IContractProvider {
    _provider: ethers.providers.JsonRpcProvider | ethers.providers.BaseProvider;
    _config: IConfiguration;
    _contracts: IContractsDefinitions;
    constructor(config: IConfiguration, provider: ethers.providers.JsonRpcProvider | ethers.providers.BaseProvider | undefined, contracts: IContractsDefinitions);
    _getSigner(signer: string): ethers.providers.JsonRpcSigner;
    get config(): IConfiguration;
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
    getUBIContractForRead(): Promise<Contract>;
    getUBIContractForWrite(address: string): Promise<Contract>;
}
