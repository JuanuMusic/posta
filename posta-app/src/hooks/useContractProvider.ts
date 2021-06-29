import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { ethers } from "ethers"
import configProvider from "src/config/configProvider";
import { ContractProvider, IContractProvider, IContractsDefinitions } from "posta-lib/build/services/ContractProvider";


const contracts: IContractsDefinitions = {
    UBIContract: require("../contracts/DummyUBI.json"),
    POHContract: require("../contracts/DummyProofOfHumanity.json"),
    PostaContract: require("../contracts/Posta.json"),
};

export default function useContractProvider() {
    const [contractProvider, setContractProvider] = useState<IContractProvider>();
    const context = useWeb3React<ethers.providers.Web3Provider>();

    useEffect(() => {
        if (!context || !context.chainId) return;
        setContractProvider(new ContractProvider(
            configProvider.getConfig(context.chainId!),
            configProvider.getEthersProvider(context.library?.provider),
            contracts));
    }, [context.chainId]);

    return contractProvider;
}