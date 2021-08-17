"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var fetchURLMetadata_1 = require("./fetchURLMetadata");
var ethers_1 = require("ethers");
var posta_lib_1 = require("./posta-lib");
var ContractProvider_1 = require("./posta-lib/services/ContractProvider");
var nftMetadataBuilder_1 = require("./nftMetadataBuilder");
var ultimate_text_to_image_1 = require("ultimate-text-to-image");
var configProvider_1 = __importDefault(require("./config/configProvider"));
dotenv_1.default.config();
var app = express_1.default();
// Server React
var publicPath = path_1.default.join(__dirname, '..', 'build');
app.use(express_1.default.static(publicPath));
/**
 * Returns the ethers provider based on the .env and config.json
 * @param webProvider
 * @returns
 */
function getEthersProvider(webProvider) {
    if (webProvider === void 0) { webProvider = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var provider, config;
        return __generator(this, function (_a) {
            // If a web provider is passed, connect to it
            if (webProvider) {
                provider = new ethers_1.ethers.providers.Web3Provider(webProvider);
            }
            if (!provider) {
                config = configProvider_1.default.getConfig();
                if (process.env.CONFIG === "kovan") {
                    provider = ethers_1.ethers.getDefaultProvider("kovan", {
                        infura: process.env.INFURA_PROJECT_ID,
                        etherscan: process.env.ETHERSCAN_API_KEY,
                    });
                }
                else if (process.env.CONFIG === "develop") {
                    provider = new ethers_1.ethers.providers.JsonRpcProvider(config.network.URL, {
                        chainId: config.network.chainID,
                        name: config.network.name,
                    });
                }
                else {
                    provider = ethers_1.ethers.getDefaultProvider("mainnet");
                }
            }
            return [2 /*return*/, provider];
        });
    });
}
var contractsDefinitions = {
    UBIContract: require("./contracts/DummyUBI.sol/DummyUBI.json"),
    POHContract: require("./contracts/DummyProofOfHumanity.sol/DummyProofOfHumanity.json"),
    //PostaContract: require("../contracts/v0.2/Posta.sol/Posta.json"),
    PostaContract: require("./contracts/v0.8/PostaV0_8.sol/PostaV0_8.json"),
};
function getContractProvider() {
    return __awaiter(this, void 0, void 0, function () {
        var config, contractProvider, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    config = configProvider_1.default.getConfig();
                    _a = ContractProvider_1.ContractProvider.bind;
                    _b = [void 0, config];
                    return [4 /*yield*/, getEthersProvider()];
                case 1:
                    contractProvider = new (_a.apply(ContractProvider_1.ContractProvider, _b.concat([_c.sent(), contractsDefinitions])))();
                    return [2 /*return*/, contractProvider];
            }
        });
    });
}
function getPost(tokenId) {
    return __awaiter(this, void 0, void 0, function () {
        var contractProvider, config, pohService, postaService, posts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getContractProvider()];
                case 1:
                    contractProvider = _a.sent();
                    config = configProvider_1.default.getConfig();
                    pohService = new posta_lib_1.PohService(config.pohApiBaseUrl, contractProvider);
                    postaService = new posta_lib_1.PostaService(pohService, contractProvider);
                    ;
                    return [4 /*yield*/, postaService.getPosts(null, [tokenId])];
                case 2:
                    posts = _a.sent();
                    return [2 /*return*/, (posts && posts.length > 0 && posts[0]) || null];
            }
        });
    });
}
function getHuman(address) {
    return __awaiter(this, void 0, void 0, function () {
        var config, contractProvider, pohService;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = configProvider_1.default.getConfig();
                    return [4 /*yield*/, getContractProvider()];
                case 1:
                    contractProvider = _a.sent();
                    pohService = new posta_lib_1.PohService(config.pohApiBaseUrl, contractProvider);
                    return [4 /*yield*/, pohService.getHuman(address)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var port;
        var _this = this;
        return __generator(this, function (_a) {
            app.get('/post/:tokenId/image', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var tokenId, post, author, authorImage, postaTicker, authorCanvas, tickerCanvas, image;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokenId = ethers_1.BigNumber.from(req.params.tokenId);
                            return [4 /*yield*/, getPost(tokenId)];
                        case 1:
                            post = _a.sent();
                            if (!post)
                                return [2 /*return*/, res.status(404)];
                            return [4 /*yield*/, getHuman(post === null || post === void 0 ? void 0 : post.author)];
                        case 2:
                            author = _a.sent();
                            authorImage = new ultimate_text_to_image_1.UltimateTextToImage((author && (author.display_name || author.eth_address)) || "unknown", { marginBottom: 15, marginRight: 15 }).render().toBuffer();
                            postaTicker = new ultimate_text_to_image_1.UltimateTextToImage("$POSTA:" + tokenId.toString(), { marginTop: 15, marginLeft: 15, fontSize: 30, fontWeight: "bold" }).render().toBuffer();
                            return [4 /*yield*/, ultimate_text_to_image_1.getCanvasImage({ buffer: authorImage })];
                        case 3:
                            authorCanvas = _a.sent();
                            return [4 /*yield*/, ultimate_text_to_image_1.getCanvasImage({ buffer: postaTicker })];
                        case 4:
                            tickerCanvas = _a.sent();
                            image = new ultimate_text_to_image_1.UltimateTextToImage(post.content, {
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
                            return [2 /*return*/, res.status(200).send(image)];
                    }
                });
            }); });
            app.get('/post/:tokenId', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var tokenId, post, human, metadata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tokenId = ethers_1.BigNumber.from(req.params.tokenId);
                            return [4 /*yield*/, getPost(tokenId)];
                        case 1:
                            post = _a.sent();
                            return [4 /*yield*/, getHuman(post === null || post === void 0 ? void 0 : post.author)];
                        case 2:
                            human = _a.sent();
                            if (!post)
                                return [2 /*return*/, res.status(404)];
                            return [4 /*yield*/, nftMetadataBuilder_1.buildMetadata(post, human)];
                        case 3:
                            metadata = _a.sent();
                            res.setHeader('content-type', 'application/json');
                            res.status(200).send(JSON.stringify(metadata));
                            return [2 /*return*/];
                    }
                });
            }); });
            app.get("/posta/:tokenId", function (req, res) {
                res.sendFile(path_1.default.join(__dirname, '..', 'build', 'index.html'));
            });
            app.get("/human/:humanAddress", function (req, res) {
                res.sendFile(path_1.default.join(__dirname, '..', 'build', 'index.html'));
            });
            app.get('/preview', function (req, res) {
                return __awaiter(this, void 0, void 0, function () {
                    var metadata;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!req.query || !req.query.url)
                                    return [2 /*return*/, res.status(400).send()];
                                return [4 /*yield*/, fetchURLMetadata_1.fetchURLMetadata(req.query.url)];
                            case 1:
                                metadata = _a.sent();
                                return [2 /*return*/, res.status(200).send({ metadata: metadata })];
                        }
                    });
                });
            });
            app.get("/", function (req, res) {
                res.sendFile(path_1.default.join(__dirname, '..', 'build', 'index.html'));
            });
            port = process.env.PORT || 3000;
            app.listen(port, function () {
                console.log("Server is up on port " + port + ". =)");
            });
            return [2 /*return*/];
        });
    });
}
initialize();
