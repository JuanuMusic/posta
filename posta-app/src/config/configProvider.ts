import kovanConfig from "../config/kovan.json";
import developConfig from "../config/develop.json";
import { ethers } from "ethers";
import { IConfiguration } from "posta-lib/build";

// Change this to your local chain id
const LOCAL_CHAIN_ID = 1337;
const LOCAL_NETWORK_URL = "http://localhost:7545";
const LOCAL_NETWORK_NAME = "develop";

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
    getEthersProvider(webProvider: any | undefined= undefined): ethers.providers.BaseProvider {
        if(webProvider) return new ethers.providers.Web3Provider(webProvider);

        const provider = (process.env.REACT_APP_NETWORK && ethers.getDefaultProvider(process.env.REACT_APP_NETWORK)) ||
            (process.env.NODE_ENV === "development" ?
                new ethers.providers.JsonRpcProvider(LOCAL_NETWORK_URL, { chainId: LOCAL_CHAIN_ID, name: LOCAL_NETWORK_NAME }) :
                ethers.getDefaultProvider("kovan"));

        console.log("PROVIDER", provider);
        return provider;
    }
}