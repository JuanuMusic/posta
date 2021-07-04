import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { ethers } from "ethers"
import { ContractProvider, IConfiguration, IContractProvider, IContractsDefinitions } from "../posta-lib/services/ContractProvider";
import configProvider from "../config/configProvider";


const contracts: IContractsDefinitions = {
    UBIContract: require("../contracts/DummyUBI.json"),
    POHContract: require("../contracts/DummyProofOfHumanity.json"),
    PostaContract: require("../contracts/Posta.json"),
};

/**
 * A hook that provides a contract provider.
 * Initially tries to load a default and then changes when context.chainId changes.
 * @returns 
 */
export default function useContractProvider() {
    const [contractProvider, setContractProvider] = useState<IContractProvider>();
    const context = useWeb3React<ethers.providers.Web3Provider>();

    

    // Try to load default assuming there is no provider
    useEffect(() => {
        
        console.log("Loading contract provider for network",process.env.REACT_APP_NETWORK,"...");
        let config: IConfiguration = process.env.REACT_APP_NETWORK ? configProvider.getConfigByName(process.env.REACT_APP_NETWORK) :
            ((process.env.NODE_ENV === "development") ? configProvider.getConfigByName("local") : configProvider.getConfigByName("kovan"));

        console.log("CONFIG", config);
        setContractProvider(new ContractProvider(
            config,
            configProvider.getEthersProvider(),
            contracts));
    }, [])

    // Load contract provider when context.chainId changes
    useEffect(() => {
        if (!context || !context.chainId) return;
        setContractProvider(new ContractProvider(
            configProvider.getConfig(context.chainId),
            configProvider.getEthersProvider(context.library?.provider),
            contracts));
    }, [context.chainId]);

    return contractProvider;
}