import { BigNumber, ethers } from "ethers";
import express from "express";
// import { PostaService, PohService, ContractProvider } from "./posta-lib/index"
import dotenv from "dotenv";


import { ContractProvider, PohService, PostaService } from "./posta-lib";
import { IConfiguration } from "./posta-lib/services/ContractProvider";
import { IContractsDefinitions } from "posta-lib/services/ContractProvider";

dotenv.config();
const app = express();

import kovanConfig from "./config/kovan.json";
import developConfig from "./config/develop.json";
const config = (process.env.CONFIG === "kovan" ? kovanConfig : developConfig) as IConfiguration;

import IUBI from "./contracts/IUBI.sol/IUBI.json";
import IProofOfHumanity from "./contracts/IProofOfHumanity.sol/IProofOfHumanity.json";
import PostaV0_3 from "./contracts/v0.3/PostaV0_3.sol/PostaV0_3.json";


// Change this to your local chain id
const LOCAL_CHAIN_ID = 1337;

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
    if (process.env.CONFIG === "kovan") {
      provider = ethers.getDefaultProvider("kovan", {
        infura: process.env.INFURA_PROJECT_ID,
        etherscan: process.env.ETHERSCAN_API_KEY,
      });
    } else if (process.env.CONFIG === "develop") {
      provider = new ethers.providers.JsonRpcProvider(config.network.URL, {
        chainId: config.network.chainID,
        name: config.network.name,
      });
    } else {
      provider = ethers.getDefaultProvider();
    }
  }

  return provider;
}


async function initialize() {
  const provider = await getEthersProvider();
  const contractprovider = new ContractProvider(config, provider, { PostaContract: PostaV0_3, UBIContract: IUBI, POHContract: IProofOfHumanity });



  app.get('/post/:tokenId', async (req, res) => {
    const tokenId = BigNumber.from(req.params.tokenId); // tokenId from url param
    // Get the logs for the token
    const logs = await PostaService.getPostLogs([tokenId], contractprovider);
    if (!logs || logs.length === 0) return res.status(404).send("Log not found");
    const log = logs[0];
    const human = await PohService.getHuman(log.author);
    const retVal = {
      author: log.author,
      blockTime: log.blockTime,
      content: log.content,
      name: `PSTA:${tokenId} by ${human && (human.display_name || human.eth_address)}`,
      external_url: `${process.env.POSTA_WEB_URL}/post/${tokenId}`,
      replyOfTokenId: log.replyOfTokenId?.toNumber()
    }

    res.status(200).send(JSON.stringify(retVal));

  })

  app.get('/', (req, res) => {
    res.send('Hi!');
  })

  const PORT = process.env.PORT;


  app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
  })
}


initialize();