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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostaService = void 0;
var PoHService_1 = require("./PoHService");
var DEFAULT_CONFIRMATIONS = 5;
var PostaService = {
    /**
     * Gets the token URL with JSON metadata
     * @param tokenId
     * @param provider
     */
    getTokenUrl: function (tokenId, contractProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.tokenURI(tokenId)];
                    case 2:
                        uri = _a.sent();
                        return [2 /*return*/, uri];
                }
            });
        });
    },
    /**
     * Sets the base url for buiulding the tokenURI.
     * OnlyOwner
     * @param baseUrl
     * @param provider
     */
    setBaseURI: function (from, baseUrl, contractProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractProvider.getPostaContractForWrite(from)];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.setBaseURI(baseUrl)];
                    case 2:
                        tx = _a.sent();
                        console.log("SET BASE URL TX", tx);
                        return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Returns an array with the posts logs to build the posts.
     * @param tokenIds
     * @param provider
     * @returns
     */
    getPostLogs: function (tokenIds, contractProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, filter, logs, retVal;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        filter = postaContract.filters.NewPost(null, tokenIds);
                        return [4 /*yield*/, postaContract.queryFilter(filter)];
                    case 2:
                        logs = _a.sent();
                        if (!logs)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.all(logs.map(function (log) { return __awaiter(_this, void 0, void 0, function () {
                                var block;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, log.getBlock()];
                                        case 1:
                                            block = _a.sent();
                                            return [2 /*return*/, {
                                                    author: log.args && log.args.length >= 3 && log.args[0],
                                                    tokenId: log.args && log.args.length >= 3 && log.args[1],
                                                    // Extract text from log object
                                                    content: log.args && log.args.length >= 3 && log.args[2],
                                                    // Tweet date comes from block timestamp
                                                    blockTime: block && new Date(block.timestamp * 1000) || new Date(0)
                                                }];
                                    }
                                });
                            }); }))];
                    case 3:
                        retVal = _a.sent();
                        return [2 /*return*/, retVal];
                }
            });
        });
    },
    /**
     * Requests approval to burn UBIs on the Posta contract.
     * @param from Human address that burns their UBIs
     * @param provider Web3Provider
     * @param waitConfirmation Wait for this confirmations to complete transaction.
     */
    requestBurnApproval: function (from, amount, contractProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var ubiContract, approvalTx, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, contractProvider.getUBIContractForWrite(from)];
                    case 1:
                        ubiContract = _c.sent();
                        _b = (_a = ubiContract).approve;
                        return [4 /*yield*/, contractProvider.config.PostaAddress];
                    case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), amount])];
                    case 3:
                        approvalTx = _c.sent();
                        return [4 /*yield*/, approvalTx.wait(DEFAULT_CONFIRMATIONS)];
                    case 4: return [2 /*return*/, _c.sent()];
                }
            });
        });
    },
    /**
     * Burn UBIs to support a users NFT.
     * @param tokenID IUD of the NFT to give support
     * @param amount amount of UBIs to be burned
     * @param from Human burning their UBIs.
     * @param provider Web3Provider
     */
    giveSupport: function (tokenID, amount, from, contractProvider, confirmations) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, contractProvider.getPostaContractForWrite(from)];
                    case 1:
                        contract = _a.sent();
                        return [4 /*yield*/, contract.support(tokenID, amount)];
                    case 2:
                        tx = _a.sent();
                        if (confirmations === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, tx.wait(confirmations || DEFAULT_CONFIRMATIONS)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_1 = _a.sent();
                        console.error(error_1.message);
                        console.error(error_1.stack);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Takes care of publishing a post.
     * It first uploads the post to a Decentralized service and then mints the NFT with the URL to it.
     * @param postData Data of the post
     * @param drizzle
     */
    publishPost: function (postData, contractProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, tx, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, contractProvider.getPostaContractForWrite(postData.author)];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.publishPost(postData.text)];
                    case 2:
                        tx = _a.sent();
                        return [2 /*return*/, { tx: tx }];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, { tx: null, error: error_2 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get the latest posts
     * @param provider
     * @param maxRecords Max number of records to fetch.
     * @returns
     */
    getLatestPosts: function (maxRecords, contractProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, bnCounter, counter, tokenIds, i, postLogs, postsNFTs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getTokenCounter()];
                    case 2:
                        bnCounter = _a.sent();
                        counter = bnCounter.toNumber();
                        tokenIds = [];
                        for (i = counter - 1; i >= Math.max(counter - maxRecords, 0); i--) {
                            tokenIds.unshift(i);
                        }
                        return [4 /*yield*/, PostaService.getPostLogs(tokenIds, contractProvider)];
                    case 3:
                        postLogs = _a.sent();
                        if (!postLogs)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.all(postLogs.map(function (log) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, PostaService.buildPost(log, contractProvider)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 4:
                        postsNFTs = _a.sent();
                        // Return the list of nfts posts
                        return [2 /*return*/, postsNFTs.sort(function (a, b) { return parseInt(a.tokenId, 10) > parseInt(b.tokenId, 10) ? -1 : 1; })];
                }
            });
        });
    },
    /**
     * Builds a post object to be used for display.
     * @param tokenId
     * @param contractProvider
     * @returns
     */
    buildPost: function (log, contractProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, postNFT, tokenURI, human, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Building post...", log);
                        return [4 /*yield*/, contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getPost(log.tokenId)];
                    case 2:
                        postNFT = _a.sent();
                        return [4 /*yield*/, postaContract.tokenURI(log.tokenId)];
                    case 3:
                        tokenURI = _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, PoHService_1.PohService.getHuman(log.author)];
                    case 5:
                        human = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        // If fails, set human object
                        human = { display_name: "", first_name: "", last_name: "" };
                        console.error(error_3);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, {
                            author: log.author,
                            authorDisplayName: (human && human.display_name) || log.author,
                            authorFullName: (human && (human.first_name + " " + human.last_name)) || log.author,
                            authorImage: human && human.photo,
                            content: log.content,
                            tokenId: log.tokenId.toString(),
                            tokenURI: tokenURI,
                            creationDate: new Date(log.blockTime),
                            supportGiven: postNFT.supportGiven,
                            supportCount: postNFT.supportersCount,
                        }];
                }
            });
        });
    }
};
exports.PostaService = PostaService;
