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
exports.ContractProvider = void 0;
var ethers_1 = require("ethers");
var configService_1 = __importDefault(require("./configService"));
var ContractProvider = /** @class */ (function () {
    function ContractProvider(config, provider, contracts) {
        this._provider = provider || configService_1.default.getEthersProvider();
        this._config = config;
        this._contracts = contracts;
    }
    ContractProvider.prototype._getSigner = function (signer) {
        if (!this._provider)
            throw new Error("JsonRpcProvider not set");
        return this._provider.getSigner(signer);
    };
    Object.defineProperty(ContractProvider.prototype, "config", {
        get: function () {
            return this._config;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContractProvider.prototype, "ethersProvider", {
        get: function () {
            return this._provider;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns an instance of a contract for read only
     * @param contractAddress The address of the contract
     * @param abi Contract's ABI
     * @param ethersProvider Web3Provider
     * @returns
     */
    ContractProvider.prototype.getContractForRead = function (contractAddress, abi) {
        return __awaiter(this, void 0, void 0, function () {
            var contract;
            return __generator(this, function (_a) {
                contract = new ethers_1.Contract(contractAddress, abi, this._provider);
                return [2 /*return*/, contract.connect(this._provider)];
            });
        });
    };
    /**
     * Returns an instance of a contract for executing write operations
     * @param contractAddress
     * @param abi
     * @param fromAddress
     * @param ethersProvider
     * @returns
     */
    ContractProvider.prototype.getContractForWrite = function (contractAddress, abi, fromAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var signer, contract;
            return __generator(this, function (_a) {
                signer = this._getSigner(fromAddress);
                contract = new ethers_1.Contract(contractAddress, abi, signer);
                return [2 /*return*/, contract.connect(signer)];
            });
        });
    };
    ContractProvider.prototype.getDummyPOHContractForWrite = function (fromAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getContractForWrite(this._config.POHAddress, this._contracts.POHContract.abi, fromAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ContractProvider.prototype.getPohContractForRead = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getContractForRead(this._config.POHAddress, this._contracts.POHContract.abi)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ContractProvider.prototype.getPostaContractForWrite = function (fromAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getContractForWrite(this._config.PostaAddress, this._contracts.PostaContract.abi, fromAddress)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns an instance of the PostaContract to execute read operations.
     * @param provider Web3Provider
     * @returns
     */
    ContractProvider.prototype.getPostaContractForRead = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getContractForRead(this._config.PostaAddress, this._contracts.PostaContract.abi)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ContractProvider.prototype.getUBIContractForRead = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getContractForRead(this._config.UBIAddress, this._contracts.UBIContract.abi)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ContractProvider.prototype.getUBIContractForWrite = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getContractForWrite(this._config.UBIAddress, this._contracts.UBIContract.abi, address)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ContractProvider;
}());
exports.ContractProvider = ContractProvider;
