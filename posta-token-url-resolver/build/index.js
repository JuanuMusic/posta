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
var ethers_1 = require("ethers");
var express_1 = __importDefault(require("express"));
var index_1 = require("posta-lib/build/index");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app = express_1.default();
// Change this to your local chain id
var LOCAL_CHAIN_ID = 1337;
/**
     * If env variable REACT_APP_NETWORK, returns getDefaultProvider(process.env.REACT_APP_NETWORK)
     * If NODE_ENV is "development" use local network. Fallback: use "kovan".
     * @returns
     */
function getEthersProvider() {
    var provider = (process.env.NETWORK && ethers_1.ethers.getDefaultProvider(process.env.NETWORK)) ||
        (process.env.NODE_ENV === "development" ?
            new ethers_1.ethers.providers.JsonRpcProvider("http://localhost:7545", { chainId: LOCAL_CHAIN_ID, name: "develop" }) :
            ethers_1.ethers.getDefaultProvider("kovan"));
    return provider;
}
var develop_json_1 = __importDefault(require("./config/develop.json"));
var Posta_json_1 = __importDefault(require("./contracts/Posta.json"));
var IUBI_json_1 = __importDefault(require("./contracts/IUBI.json"));
var DummyProofOfHumanity_json_1 = __importDefault(require("./contracts/DummyProofOfHumanity.json"));
var provider = getEthersProvider();
var contractprovider = new index_1.ContractProvider(develop_json_1.default, provider, { PostaContract: Posta_json_1.default, UBIContract: IUBI_json_1.default, POHContract: DummyProofOfHumanity_json_1.default });
app.get('/post/:tokenId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tokenId, logs, human, retVal;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tokenId = req.params.tokenId;
                return [4 /*yield*/, index_1.PostaService.getPostLogs(ethers_1.BigNumber.from(tokenId), contractprovider)];
            case 1:
                logs = _a.sent();
                if (!logs)
                    return [2 /*return*/, res.status(404).send("Log not found")];
                return [4 /*yield*/, index_1.PohService.getHuman(logs.author)];
            case 2:
                human = _a.sent();
                retVal = {
                    author: logs.author,
                    blockTime: logs.blockTime,
                    content: logs.content,
                    name: "PSTA:" + tokenId + " by " + (human && human.display_name || "UNKNOWN"),
                    external_url: "localhost:3001/post/" + tokenId
                };
                res.status(200).send(JSON.stringify(retVal));
                return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) {
    res.send('Hi!');
});
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var provider;
        return __generator(this, function (_a) {
            provider = getEthersProvider();
            app.listen(3000, function () {
                console.log('The application is listening on port 3000!');
            });
            return [2 /*return*/];
        });
    });
}
initialize();
