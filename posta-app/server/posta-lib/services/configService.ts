import { ethers } from "ethers";

// Change this to your local chain id
const LOCAL_CHAIN_ID = 31337;
const LOCAL_NETWORK_URL = "http://localhost:7545";
const LOCAL_NETWORK_NAME = "develop";

export default {

    getEthersProvider(): ethers.providers.BaseProvider | ethers.providers.JsonRpcProvider {
        const provider = (process.env.DEFAULT_NETWORK && ethers.getDefaultProvider(process.env.DEFAULT_NETWORK)) ||
            (process.env.NODE_ENV === "development" ?
                new ethers.providers.JsonRpcProvider(LOCAL_NETWORK_URL, { chainId: LOCAL_CHAIN_ID, name: LOCAL_NETWORK_NAME }) :
                ethers.getDefaultProvider("kovan"));

        return provider;
    }
}