import { useWeb3React } from "@web3-react/core";
import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  ContractProvider,
  IConfiguration,
  IContractProvider,
  IContractsDefinitions,
} from "../posta-lib/services/ContractProvider";
import configProvider from "../config/configProvider";
import { PohService, PostaService, UBIService } from "../posta-lib";

const contractsDefinitions: IContractsDefinitions = {
  UBIContract: require("../contracts/DummyUBI.sol/DummyUBI.json"),
  POHContract: require("../contracts/DummyProofOfHumanity.sol/DummyProofOfHumanity.json"),
  //PostaContract: require("../contracts/v0.2/Posta.sol/Posta.json"),
  PostaContract: require("../contracts/v0.8/PostaV0_8.sol/PostaV0_8.json"),
};

/**
 * Returns the ethers provider based on the .env and config.json
 * @param webProvider
 * @returns
 */
async function getEthersProvider(
  webProvider: any | undefined = undefined
): Promise<ethers.providers.BaseProvider> {
  let provider: ethers.providers.BaseProvider | undefined;
  // If a web provider is passed, connect to it
  if (webProvider) {
    provider = new ethers.providers.Web3Provider(webProvider);
  }

  if (!provider) {
    if (process.env.REACT_APP_CONFIG === "kovan") {
      provider = ethers.getDefaultProvider("kovan", {
        infura: process.env.REACT_APP_INFURA_PROJECT_ID,
        etherscan: process.env.REACT_APP_ETHERSCAN_API_KEY,
        alchemy: undefined,
      });
    } else if (process.env.REACT_APP_CONFIG === "develop") {
      const config = configProvider.getConfig();
      provider = new ethers.providers.JsonRpcProvider(config.network.URL, {
        chainId: config.network.chainID,
        name: config.network.name,
      });
    } else {
      provider = ethers.getDefaultProvider();
    }
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

const context = createContext<{
  contractProvider: IContractProvider | null;
  postaService: PostaService | null;
  pohService: PohService | null;
  ubiService: UBIService | null;
}>({
  contractProvider: null,
  postaService: null,
  pohService: null,
  ubiService: null,
});

export default function PostaContext({ children }: { children: any }) {
  const [currentProvider, setContractsProvider] =
    useState<IContractProvider | null>(null);

  const [postaService, setPostaService] = useState<PostaService | null>(null);
  const [ubiService, setUbiService] = useState<UBIService | null>(null);
  const [pohService, setPohService] = useState<PohService | null>(null);

  const web3Context = useWeb3React();

  // initialize contracts
  useEffect(() => {
    async function initializeContracts() {
      // Get current configuration
      let config: IConfiguration = configProvider.getConfig();

      // Get the contract provider
      const contractsProvider = new ContractProvider(
        config,
        await getEthersProvider(
          web3Context.library && web3Context.library.provider
        ),
        contractsDefinitions
      );

      setContractsProvider(contractsProvider);

      const pohService = new PohService(config.pohApiBaseUrl, contractsProvider);
      setPostaService(new PostaService(pohService, contractsProvider));
      setPohService(pohService);
      setUbiService(new UBIService(contractsProvider));
    }

    initializeContracts();
  }, [web3Context.library]);

  return (
    <context.Provider
      value={{
        contractProvider: currentProvider,
        postaService: postaService,
        pohService: pohService,
        ubiService: ubiService,
      }}
    >
      {children}
    </context.Provider>
  );
}

PostaContext.context = context;

export function usePostaContext() {
  // Get data about the human by calling useContext()
  return useContext(PostaContext.context);
}
