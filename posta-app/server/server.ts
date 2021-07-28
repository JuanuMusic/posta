import path from 'path';
import express from 'express';
import dotenv from "dotenv";
import { fetchURLMetadata } from './fetchURLMetadata';
import { BigNumber, ethers } from "ethers";
import { PostaService, PohService, ContractProvider } from "./posta-lib";
const kovanConfig = require("./config/kovan.json");
// const developConfig = require("./config/develop.json");
const mainnetConfig = require("./config/mainnet.json");
import { IConfiguration, IContractProvider, IContractsDefinitions } from './posta-lib/services/ContractProvider';
import { buildMetadata } from './nftMetadataBuilder';
import { getCanvasImage, UltimateTextToImage } from "ultimate-text-to-image";
import { IPostaNFT } from './posta-lib/services/PostaService';

dotenv.config();
const app = express();

// Server React
const publicPath = path.join(__dirname, '..', 'build');
app.use(express.static(publicPath));


const configData = (process.env.CONFIG === "kovan" ? kovanConfig : mainnetConfig) as IConfiguration;

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
            provider = new ethers.providers.JsonRpcProvider(configData.network.URL, {
                chainId: configData.network.chainID,
                name: configData.network.name,
            });
        } else {
            provider = ethers.getDefaultProvider("mainnet");
        }
    }

    return provider;
}

const contractsDefinitions: IContractsDefinitions = {
    UBIContract: require("./contracts/DummyUBI.sol/DummyUBI.json"),
    POHContract: require("./contracts/DummyProofOfHumanity.sol/DummyProofOfHumanity.json"),
    //PostaContract: require("../contracts/v0.2/Posta.sol/Posta.json"),
    PostaContract: require("./contracts/v0.7/PostaV0_7.sol/PostaV0_7.json"),
};

async function getPost(tokenId: BigNumber, contractProvider: IContractProvider): Promise<IPostaNFT | null> {

    // Get the logs for the token
    const logs = await PostaService.getPostLogs(null, [tokenId], contractProvider);
    if (!logs || logs.length === 0) return null;
    const log = logs[0];
    const post = await PostaService.buildPost(log, contractProvider);
    return post;
}

async function initialize() {

    const provider = await getEthersProvider();
    const contractprovider = new ContractProvider(configData, provider, contractsDefinitions);



    app.get('/post/:tokenId/image', async (req, res) => {
        const tokenId = BigNumber.from(req.params.tokenId); // tokenId from url param
        const post = await getPost(tokenId, contractprovider);
        if (!post) return res.status(404);
        const author = await PohService.getHuman(post?.author, contractprovider);
        // Build metadata pbject

        const authorImage = new UltimateTextToImage((author && (author.display_name || author.eth_address)) || "unknown", { marginBottom: 10, marginRight: 10 }).render().toBuffer();
        const postaTicker = new UltimateTextToImage(`$POSTA:${tokenId.toString()}`, { marginTop: 10, marginLeft: 10, fontSize: 30, fontWeight: "bold" }).render().toBuffer();
        const authorCanvas = await getCanvasImage({ buffer: authorImage });
        const tickerCanvas = await getCanvasImage({ buffer: postaTicker });
        const image = new UltimateTextToImage(post.content,
            {
                margin: 20,
                width: 512,
                height: 512,
                borderColor: "#00000000",
                borderSize: 2,
                valign: "middle",
                fontSize: 35,
                lineHeight: 50,
                images: [
                    { canvasImage: authorCanvas, layer: -1, repeat: "bottomRight" },
                    { canvasImage: tickerCanvas, layer: -1, repeat: "topLeft" },
                ]
            }).render().toBuffer();
        res.setHeader('content-type', 'image/png');
        return res.status(200).send(image);

    })

    app.get('/post/:tokenId', async (req, res) => {
        const tokenId = BigNumber.from(req.params.tokenId); // tokenId from url param
        const post = await getPost(tokenId, contractprovider);
        if (!post) return res.status(404);
        const metadata = await buildMetadata(post, contractprovider);
        res.setHeader('content-type', 'application/json');

        res.status(200).send(JSON.stringify(metadata));

    })

    app.get("/posta/:tokenId", (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    });

    app.get("/human/:humanAddress", (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    });

    app.get('/preview', async function (req, res) {
        if (!req.query || !req.query.url) return res.status(400).send();
        const metadata = await fetchURLMetadata(req.query.url as string);
        return res.status(200).send({ metadata: metadata });
    });

    // app.get('/post/**', function (req, res) {
    //     res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    // });
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is up on port ${port}. =)`);
    });
}


initialize();