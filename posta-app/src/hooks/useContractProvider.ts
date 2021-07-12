import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { ethers } from "ethers"
import { ContractProvider, IConfiguration, IContractProvider, IContractsDefinitions } from "../posta-lib/services/ContractProvider";
import configProvider from "../config/configProvider";


const contracts: IContractsDefinitions = {
    UBIContract: require("../contracts/contracts/DummyUBI.sol/DummyUBI.json"),
    POHContract: require("../contracts/contracts/DummyProofOfHumanity.sol/DummyProofOfHumanity.json"),
    PostaContract: require("../contracts/contracts/v2/PostaV2.sol/PostaV2.json"),
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

        async function loadContractProvider() {

            let config: IConfiguration = configProvider.getConfig();

            console.log("CONFIG", config);
            setContractProvider(new ContractProvider(
                config,
                await configProvider.getEthersProvider(),
                contracts));
        }

        loadContractProvider();
    }, [])

    return contractProvider;
}