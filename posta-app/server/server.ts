import path from 'path';
import express from 'express';
import dotenv from "dotenv";
import { fetchURLMetadata } from './fetchURLMetadata';
import { BigNumber, ethers } from "ethers";
import { PostaService, PohService } from "./posta-lib";
import { ContractProvider, IConfiguration, IContractProvider, IContractsDefinitions } from "./posta-lib/services/ContractProvider";
import { buildMetadata } from './nftMetadataBuilder';
import { getCanvasImage, UltimateTextToImage } from "ultimate-text-to-image";
import { IPostaNFT } from "./posta-lib/services/PostaService";
import configProvider from './config/configProvider';
import { POHProfileModel } from './posta-lib/services/PohAPI';

dotenv.config();
const app = express();

// Server React
const publicPath = path.join(__dirname, '..', 'build');
app.use(express.static(publicPath));


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
        const config = configProvider.getConfig();
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
            provider = ethers.getDefaultProvider("mainnet");
        }
    }

    return provider;
}

const contractsDefinitions: IContractsDefinitions = {
    UBIContract: require("./contracts/DummyUBI.sol/DummyUBI.json"),
    POHContract: require("./contracts/DummyProofOfHumanity.sol/DummyProofOfHumanity.json"),
    //PostaContract: require("../contracts/v0.2/Posta.sol/Posta.json"),
    PostaContract: require("./contracts/v0.8/PostaV0_8.sol/PostaV0_8.json"),
};

async function getContractProvider() {
    const config = configProvider.getConfig();
    const contractProvider = new ContractProvider(config, await getEthersProvider(), contractsDefinitions);
    return contractProvider;
}

async function getPost(tokenId: BigNumber): Promise<IPostaNFT | null> {
    const contractProvider = await getContractProvider();
    const config = configProvider.getConfig();
    const pohService = new PohService(config.pohApiBaseUrl, contractProvider);
    const postaService = new PostaService(pohService, contractProvider);;

    const posts = await postaService.getPosts(null, [tokenId]);
    return (posts && posts.length > 0 && posts[0]) || null;
}

async function getHuman(address: string): Promise<POHProfileModel | null> {
    const config = configProvider.getConfig();

    const contractProvider = await getContractProvider();
    const pohService = new PohService(config.pohApiBaseUrl, contractProvider);
    return await pohService.getHuman(address);
}

async function initialize() {



    app.get('/post/:tokenId/image', async (req, res) => {
        const tokenId = BigNumber.from(req.params.tokenId); // tokenId from url param
        const post = await getPost(tokenId);
        if (!post) return res.status(404);
        const author = await getHuman(post?.author);
        // Build metadata pbject

        const authorImage = new UltimateTextToImage((author && (author.display_name || author.eth_address)) || "unknown", { marginBottom: 15, marginRight: 15 }).render().toBuffer();
        const postaTicker = new UltimateTextToImage(`$POSTA:${tokenId.toString()}`, { marginTop: 15, marginLeft: 15, fontSize: 30, fontWeight: "bold" }).render().toBuffer();
        const authorCanvas = await getCanvasImage({ buffer: authorImage });
        const tickerCanvas = await getCanvasImage({ buffer: postaTicker });
        const image = new UltimateTextToImage(post.content,
            {
                margin: 20,
                width: 512,
                height: 512,
                borderColor: "#000000",
                borderSize: 10,
                valign: "middle",
                fontSize: 35,
                minFontSize: 12,
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
        const post = await getPost(tokenId);
        const human = await getHuman(post?.author!);
        if (!post) return res.status(404);
        const metadata = await buildMetadata(post, human);
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

    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
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