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
var kovanConfig = require("./config/kovan.json");
// const developConfig = require("./config/develop.json");
var mainnetConfig = require("./config/mainnet.json");
dotenv_1.default.config();
var app = express_1.default();
// Server React
var publicPath = path_1.default.join(__dirname, '..', 'build');
app.use(express_1.default.static(publicPath));
var configData = (process.env.CONFIG === "kovan" ? kovanConfig : mainnetConfig);
/**
 * Returns the ethers provider based on the .env and config.json
 * @param webProvider
 * @returns
 */
function getEthersProvider(webProvider) {
    if (webProvider === void 0) { webProvider = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var provider;
        return __generator(this, function (_a) {
            // If a web provider is passed, connect to it
            if (webProvider) {
                provider = new ethers_1.ethers.providers.Web3Provider(webProvider);
            }
            if (!provider) {
                if (process.env.CONFIG === "kovan") {
                    provider = ethers_1.ethers.getDefaultProvider("kovan", {
                        infura: process.env.INFURA_PROJECT_ID,
                        etherscan: process.env.ETHERSCAN_API_KEY,
                    });
                }
                else if (process.env.CONFIG === "develop") {
                    provider = new ethers_1.ethers.providers.JsonRpcProvider(configData.network.URL, {
                        chainId: configData.network.chainID,
                        name: configData.network.name,
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
    PostaContract: require("./contracts/v0.7/PostaV0_7.sol/PostaV0_7.json"),
};
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var provider, contractprovider, port;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getEthersProvider()];
                case 1:
                    provider = _a.sent();
                    contractprovider = new posta_lib_1.ContractProvider(configData, provider, contractsDefinitions);
                    app.get('/post/:tokenId', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var tokenId, logs, log, human, retVal;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    tokenId = ethers_1.BigNumber.from(req.params.tokenId);
                                    return [4 /*yield*/, posta_lib_1.PostaService.getPostLogs(null, [tokenId], contractprovider)];
                                case 1:
                                    logs = _b.sent();
                                    if (!logs || logs.length === 0)
                                        return [2 /*return*/, res.status(404).send("Log not found")];
                                    log = logs[0];
                                    return [4 /*yield*/, posta_lib_1.PohService.getHuman(log.author, contractprovider)];
                                case 2:
                                    human = _b.sent();
                                    retVal = {
                                        author: log.author,
                                        blockTime: log.blockTime,
                                        content: log.content,
                                        name: "$POSTA:" + tokenId + " by " + (human && (human.display_name || human.eth_address)),
                                        external_url: process.env.POSTA_WEB_URL + "/posta/" + tokenId,
                                        replyOfTokenId: (_a = log.replyOfTokenId) === null || _a === void 0 ? void 0 : _a.toNumber()
                                    };
                                    res.status(200).send(JSON.stringify(retVal));
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/posta/:tokenId", function (req, res) {
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
                    port = process.env.PORT || 3000;
                    app.listen(port, function () {
                        console.log("Server is up on port " + port + ". =)");
                    });
                    return [2 /*return*/];
            }
        });
    });
}
initialize();
