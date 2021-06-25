import kovanConfig from "../config/kovan.json";

export interface IConfiguration {
        network: string,
        PostaAddress: string,
        POHAddress: string,
        UBIAddress: string,
        pohApiBaseUrl: string,
}

const NETWORK_CONFIGS: {[key: number]: IConfiguration} = {
    [42]: kovanConfig
};

export default {
    getConfig(chainId: number) : IConfiguration {
        return NETWORK_CONFIGS[chainId];
    }
}