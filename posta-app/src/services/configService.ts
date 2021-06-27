import kovanConfig from "../config/kovan.json";
import developConfig from "../config/develop.json";
import { ethers } from "ethers";

export interface IConfiguration {
    network: string,
    PostaAddress: string,
    POHAddress: string,
    UBIAddress: string,
    pohApiBaseUrl: string,
}

// Change this to your local chain id
const LOCAL_CHAIN_ID = 1337;

const NETWORK_CONFIGS: { [key: number]: IConfiguration } = {
    [42]: kovanConfig,
    [LOCAL_CHAIN_ID]: developConfig
};

export default {
    getConfig(chainId: number): IConfiguration {
        if (!NETWORK_CONFIGS[chainId]) throw new Error(`No configuration found for chainId ${chainId}`);
        return NETWORK_CONFIGS[chainId];
    },

    /**
     * If env variable REACT_APP_NETWORK, returns getDefaultProvider(process.env.REACT_APP_NETWORK)
     * If NODE_ENV is "development" use local network. Fallback: use "kovan".
     * @returns 
     */
    getEthersProvider(): ethers.providers.BaseProvider {
        const provider = (process.env.REACT_APP_NETWORK && ethers.getDefaultProvider(process.env.REACT_APP_NETWORK)) ||
            (process.env.NODE_ENV === "development" ?
                new ethers.providers.JsonRpcProvider("http://localhost:7545", { chainId: LOCAL_CHAIN_ID, name: "develop" }) :
                ethers.getDefaultProvider("kovan"));
        return provider;
    }
}