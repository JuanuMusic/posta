import { ethers } from "ethers";
declare const _default: {
    /**
     * If env variable REACT_APP_NETWORK, returns getDefaultProvider(process.env.REACT_APP_NETWORK)
     * If NODE_ENV is "development" use local network. Fallback: use "kovan".
     * @returns
     */
    getEthersProvider(): ethers.providers.BaseProvider | ethers.providers.JsonRpcProvider;
};
export default _default;
