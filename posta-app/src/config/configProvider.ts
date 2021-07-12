import { ethers } from "ethers";
import { IConfiguration } from "../posta-lib/services/ContractProvider";

// // Change this to your local chain id
// const LOCAL_CHAIN_ID = 31337;
// const LOCAL_NETWORK_URL = "http://127.0.0.1:8545/";
// const LOCAL_NETWORK_NAME = "develop";


// const KOVAN_CHAIN_ID = 42;
// const NETWORK_CONFIGS: { [key: number]: IConfiguration } = {
//     [KOVAN_CHAIN_ID]: kovanConfig,
//     [LOCAL_CHAIN_ID]: developConfig
// };

// const CHAIN_ID_BY_NAME: { [key: string]: number } = {
//     ["kovan"]: KOVAN_CHAIN_ID,
//     ["develop"]: LOCAL_CHAIN_ID
// }


export default {

    getConfig(): IConfiguration {
        return require(`./${process.env.REACT_APP_CONFIG}.json`) as IConfiguration;
    },
    /**
     * If env variable REACT_APP_NETWORK, returns getDefaultProvider(process.env.REACT_APP_NETWORK)
     * If NODE_ENV is "development" use local network. Fallback: use "kovan".
     * @returns 
     */
    async getEthersProvider(webProvider: any | undefined = undefined): Promise<ethers.providers.BaseProvider> {

        if (webProvider) {
            console.log("Getting web provider")
            return new ethers.providers.Web3Provider(webProvider);
        }

        const config = this.getConfig();

        // Try to get the provider using the network name
        let provider: ethers.providers.BaseProvider | undefined;

        try {
            provider = ethers.getDefaultProvider(config.network.name, { infura: process.env.REACT_APP_INFURA_PROJECT_ID, etherscan: process.env.REACT_APP_ETHERSCAN_API_KEY });
        } catch (error) {
            console.warn(error.message);
        }

        // If not , try to hget it from the URL.
        if (!provider || (await provider.getNetwork()).name !== config.network.name) {
            provider = new ethers.providers.JsonRpcProvider(config.network.URL, { chainId: config.network.chainID, name: config.network.name, });
            console.log("PROVIDER", provider);
        }
        // Handle network changes
        provider.on("network", (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork) {
                window.location.reload();
            }
        });
        return provider;
    }
}