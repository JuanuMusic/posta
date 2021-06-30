import { BigNumber, ethers } from "ethers";
import express from "express";
// import { PostaService, PohService, ContractProvider } from "./posta-lib/index"
import dotenv from "dotenv";
import develop from "./config/develop.json";
import kovan from "./config/kovan.json";

import PostaContract from './contracts/Posta.json';
import UBIContract from './contracts/IUBI.json';
import DummyPOHContract from './contracts/DummyProofOfHumanity.json';
import { ContractProvider, IConfiguration, PohService, PostaService } from "./posta-lib";

dotenv.config();

const app = express();

// Change this to your local chain id
const LOCAL_CHAIN_ID = 1337;

/**
     * If env variable REACT_APP_NETWORK, returns getDefaultProvider(process.env.REACT_APP_NETWORK)
     * If NODE_ENV is "development" use local network. Fallback: use "kovan".
     * @returns 
     */
function getEthersProvider(): ethers.providers.BaseProvider {

    const provider = (process.env.NETWORK && ethers.getDefaultProvider(process.env.NETWORK, { infura: process.env.INFURA_PROJECT_ID })) ||
        (process.env.NODE_ENV === "development" ?
            new ethers.providers.JsonRpcProvider("http://localhost:7545", { chainId: LOCAL_CHAIN_ID, name: "develop" }) :
            ethers.getDefaultProvider("kovan", { infura: process.env.INFURA_PROJECT_ID }));
    return provider;
}

function getConfig(): IConfiguration {
    return process.env.NETWORK === "kovan" ? kovan : develop;
}


const provider = getEthersProvider();
const contractprovider = new ContractProvider(getConfig(), provider, { PostaContract, UBIContract, POHContract: DummyPOHContract });

app.get('/post/:tokenId', async (req, res) => {
    const tokenId = parseInt(req.params.tokenId, 10); // tokenId from url param
    // Get the logs for the token
    const logs = await PostaService.getPostLogs([tokenId], contractprovider);
    if (!logs || logs.length === 0) return res.status(404).send("Log not found");
    const log = logs[0];
    console.log("THE LOGS", logs);
    const human = await PohService.getHuman(log.author);
    const retVal = {
        author: log.author,
        blockTime: log.blockTime,
        content: log.content,
        name: `PSTA:${tokenId} by ${human && human.display_name || "UNKNOWN"}`,
        external_url: `${process.env.POSTA_WEB_URL}/post/${tokenId}`
    }

    res.status(200).send(JSON.stringify(retVal));

})

app.get('/', (req, res) => {
    res.send('Hi!');
})

async function initialize() {


    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`The application is listening on port ${PORT}!`);
    })
}


initialize();