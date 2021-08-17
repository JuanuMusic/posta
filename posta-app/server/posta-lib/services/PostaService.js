"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var ethers_1 = require("ethers");
var DEFAULT_CONFIRMATIONS = 5;
var PostaService = /** @class */ (function () {
    function PostaService(pohService, contractProvider) {
        this._pohService = pohService;
        this._contractProvider = contractProvider;
    }
    /**
     * Gets the token URL with JSON metadata
     * @param tokenId
     * @param provider
     */
    PostaService.prototype.getTokenUrl = function (tokenId) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, uri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.tokenURI(tokenId)];
                    case 2:
                        uri = _a.sent();
                        return [2 /*return*/, uri];
                }
            });
        });
    };
    /**
     * Sets the base url for buiulding the tokenURI.
     * OnlyOwner
     * @param baseUrl
     * @param provider
     */
    PostaService.prototype.setBaseURI = function (from, baseUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForWrite(from)];
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
    };
    /**
     * Returns an array with the posts logs to search for to build the posts.
     * @param authors Array of human addresses to fetch posts.
     * @param tokenIds Array of token IDs to fetch posts.
     * @param provider
     * @returns
     */
    PostaService.prototype.getPostLogs = function (authors, tokenIds) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, filter, logs, retVal;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        filter = postaContract.filters.NewPost(authors || null, tokenIds && tokenIds.map(function (id) { return id.toNumber(); }) || null);
                        return [4 /*yield*/, postaContract.queryFilter(filter)];
                    case 2:
                        logs = _a.sent();
                        if (!logs)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.all(logs.map(function (log) { return __awaiter(_this, void 0, void 0, function () {
                                var block, replyOfTokenId, isReplyFilter, isReplyLogs, retItm;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, log.getBlock()];
                                        case 1:
                                            block = _a.sent();
                                            replyOfTokenId = ethers_1.BigNumber.from(0);
                                            if (!log.args) return [3 /*break*/, 3];
                                            isReplyFilter = postaContract.filters.NewPostReply([log.args.tokenId.toNumber()], null);
                                            return [4 /*yield*/, postaContract.queryFilter(isReplyFilter)];
                                        case 2:
                                            isReplyLogs = _a.sent();
                                            // if logs are found, set the token id of the source post
                                            if (isReplyLogs && isReplyLogs.length > 0) {
                                                replyOfTokenId = isReplyLogs[0].args && isReplyLogs[0].args.replyOfTokenId;
                                            }
                                            _a.label = 3;
                                        case 3:
                                            retItm = {
                                                author: log.args && log.args.author,
                                                tokenId: log.args && log.args.tokenId,
                                                // Extract text from log object
                                                content: log.args && log.args.value,
                                                // Tweet date comes from block timestamp
                                                blockTime: (block && new Date(block.timestamp * 1000)) || new Date(0),
                                                replyOfTokenId: replyOfTokenId
                                            };
                                            return [2 /*return*/, retItm];
                                    }
                                });
                            }); }))];
                    case 3:
                        retVal = _a.sent();
                        return [2 /*return*/, retVal];
                }
            });
        });
    };
    /**
     * Returns an array of logs that belong to replies to a given post.
     * @param forTokenId Token ID of the posxt for which to retrieve replies
     * @param contractProvider
     */
    PostaService.prototype.getPostRepliesLogs = function (forTokenId) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, filter, repliesLogs, retVal;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        filter = postaContract.filters.NewPostReply(null, [forTokenId.toNumber()]);
                        return [4 /*yield*/, postaContract.queryFilter(filter)];
                    case 2:
                        repliesLogs = _a.sent();
                        if (!repliesLogs || repliesLogs.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, Promise.all(repliesLogs.map(function (log) { return __awaiter(_this, void 0, void 0, function () {
                                var sourcePostLogs;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!log.args) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.getPostLogs(null, [log.args.tokenId])];
                                        case 1:
                                            sourcePostLogs = _a.sent();
                                            if (!sourcePostLogs) {
                                                console.warn("Couldn't find post logs of source post " + forTokenId);
                                                return [2 /*return*/, null];
                                            }
                                            return [2 /*return*/, __assign(__assign({}, sourcePostLogs[0]), { replyOfTokenId: ethers_1.BigNumber.from(forTokenId) })];
                                        case 2: 
                                        // If no args on the log, just return an object with empty data
                                        return [2 /*return*/, { author: "", content: "", tokenId: ethers_1.BigNumber.from(0), replyOfTokenId: forTokenId, blockTime: new Date(0) }];
                                    }
                                });
                            }); }))];
                    case 3:
                        retVal = _a.sent();
                        return [2 /*return*/, retVal.filter(function (e) { return !!e; })];
                }
            });
        });
    };
    /**
     * Requests approval to burn UBIs on the Posta contract.
     * @param from Human address that burns their UBIs
     * @param provider Web3Provider
     * @param waitConfirmation Wait for this confirmations to complete transaction.
     */
    PostaService.prototype.requestBurnApproval = function (from, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var ubiContract, approvalTx, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getUBIContractForWrite(from)];
                    case 1:
                        ubiContract = _c.sent();
                        _b = (_a = ubiContract).approve;
                        return [4 /*yield*/, this._contractProvider.config.PostaAddress];
                    case 2: return [4 /*yield*/, _b.apply(_a, [_c.sent(), amount])];
                    case 3:
                        approvalTx = _c.sent();
                        return [4 /*yield*/, approvalTx.wait(DEFAULT_CONFIRMATIONS)];
                    case 4: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    /**
     * Burn UBIs to support a users NFT.
     * @param tokenID IUD of the NFT to give support
     * @param amount amount of UBIs to be burned
     * @param from Human burning their UBIs.
     * @param provider Web3Provider
     */
    PostaService.prototype.giveSupport = function (tokenID, amount, from, confirmations) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, tx, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this._contractProvider.getPostaContractForWrite(from)];
                    case 1:
                        contract = _a.sent();
                        return [4 /*yield*/, contract.support(tokenID, amount)];
                    case 2:
                        tx = _a.sent();
                        if (confirmations === 0)
                            return [2 /*return*/, tx];
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
    };
    /**
     * Takes care of publishing a post.
     * It first uploads the post to a Decentralized service and then mints the NFT with the URL to it.
     * @param postData Data of the post
     * @param drizzle
     */
    PostaService.prototype.publishPost = function (postData) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForWrite(postData.author)];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.publishPost(postData.text, postData.replyOfTokenId || 0)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostaService.prototype.publishOnBehalfOf = function (postRequest, funderAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForWrite(funderAddress)];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.publishOnBehalfOf(postRequest.text, postRequest.author, postRequest.replyOfTokenId || 0, postRequest.nonce, postRequest.signature)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
    * Get a list of consecutive posts
    * @param fromTokenId Token id to start fetching results.
    * @param maxRecords Max number of records to fetch.
    * @param provider
    * @returns
    */
    PostaService.prototype.getConsecutivePosts = function (fromTokenId, maxRecords) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, bnCounter, counter, tokenIds, i, postsNFTs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getTokenCounter()];
                    case 2:
                        bnCounter = _a.sent();
                        counter = Math.min(bnCounter.toNumber(), fromTokenId);
                        tokenIds = [];
                        for (i = counter; i > Math.max(counter - maxRecords, 0); i--) {
                            tokenIds.unshift(ethers_1.BigNumber.from(i));
                        }
                        return [4 /*yield*/, this.getPosts(null, tokenIds)];
                    case 3:
                        postsNFTs = _a.sent();
                        // Return the list of nfts posts
                        return [2 /*return*/, (postsNFTs && postsNFTs.sort(function (a, b) { return a.tokenId.gt(b.tokenId) ? -1 : 1; })) || null];
                }
            });
        });
    };
    /**
    * Get the latest posts
    * @param provider
    * @param maxRecords Max number of records to fetch.
    * @returns
    */
    PostaService.prototype.getLatestPosts = function (maxRecords) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, bnCounter, counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getTokenCounter()];
                    case 2:
                        bnCounter = _a.sent();
                        counter = bnCounter.toNumber();
                        return [4 /*yield*/, this.getConsecutivePosts(counter, maxRecords)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns a list of already built posts from a list of token ids
     * @param tokenIds
     * @param contractProvider
     * @returns
     */
    PostaService.prototype.getPosts = function (humans, tokenIds) {
        return __awaiter(this, void 0, void 0, function () {
            var postLogs, postsNFTs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPostLogs(humans, tokenIds)];
                    case 1:
                        postLogs = _a.sent();
                        if (!postLogs)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, Promise.all(postLogs.map(function (log) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.buildPost(log)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); }))];
                    case 2:
                        postsNFTs = _a.sent();
                        return [2 /*return*/, postsNFTs];
                }
            });
        });
    };
    /**
     * Returns the total number of tokens minted
     * @param contractProvider
     * @returns
     */
    PostaService.prototype.getTokenCounter = function () {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, bnCounter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getTokenCounter()];
                    case 2:
                        bnCounter = _a.sent();
                        return [2 /*return*/, bnCounter];
                }
            });
        });
    };
    /**
     * Builds a post object to be used for display.
     * @param tokenId
     * @param contractProvider
     * @returns
     */
    PostaService.prototype.buildPost = function (log) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, postNFT, tokenURI, human, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
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
                        return [4 /*yield*/, this._pohService.getHuman(log.author)];
                    case 5:
                        human = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        // If fails, set human object
                        human = { display_name: "", first_name: "", last_name: "" };
                        console.error(error_2);
                        return [3 /*break*/, 7];
                    case 7: 
                    // Return data
                    return [2 /*return*/, {
                            author: log.author,
                            authorDisplayName: (human && human.display_name),
                            authorFullName: (human && (human.first_name + " " + human.last_name)),
                            authorImage: human && human.photo,
                            content: log.content,
                            tokenId: log.tokenId,
                            tokenURI: tokenURI,
                            blockTime: new Date(log.blockTime),
                            supportGiven: postNFT.supportGiven,
                            supportCount: postNFT.supportersCount,
                            replyOfTokenId: log.replyOfTokenId
                        }];
                }
            });
        });
    };
    /**
      * Returns the maxChars value on the posta contract
      * @param tokenIds
      * @param contractProvider
      * @returns
      */
    PostaService.prototype.getMaxChars = function () {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, maxChars;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getMaxChars()];
                    case 2:
                        maxChars = _a.sent();
                        return [2 /*return*/, maxChars.toNumber()];
                }
            });
        });
    };
    PostaService.prototype.getBurnPct = function () {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, burnPct;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getBurnPct()];
                    case 2:
                        burnPct = _a.sent();
                        return [2 /*return*/, burnPct];
                }
            });
        });
    };
    PostaService.prototype.getTreasuryPct = function () {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, treasuryPct;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        return [4 /*yield*/, postaContract.getTreasuryPct()];
                    case 2:
                        treasuryPct = _a.sent();
                        return [2 /*return*/, treasuryPct];
                }
            });
        });
    };
    /**
     * Returns a list with the top recent supporters
     * @param max The max number of top supporters to retrieve.
     * @param contractProvider
     */
    PostaService.prototype.getLastSupporters = function (max) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, filter, logs, retVal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        filter = postaContract.filters.SupportGiven(null, null);
                        return [4 /*yield*/, postaContract.queryFilter(filter)];
                    case 2:
                        logs = _a.sent();
                        if (!logs)
                            return [2 /*return*/, null];
                        if (logs.length > max)
                            logs = logs.slice(0, 10);
                        return [4 /*yield*/, Promise.all(logs.map(this.buildSupportLog))];
                    case 3:
                        retVal = _a.sent();
                        return [2 /*return*/, retVal];
                }
            });
        });
    };
    PostaService.prototype.buildSupportLog = function (log) {
        return __awaiter(this, void 0, void 0, function () {
            var block, retItm;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, log.getBlock()];
                    case 1:
                        block = _a.sent();
                        retItm = {
                            tokenId: log.args && log.args.tokenId,
                            supporter: log.args && log.args.supporter,
                            // Extract text from log object
                            amount: log.args && log.args.amount,
                            burnt: log.args && log.args.burnt,
                            treasury: log.args && log.args.treasury,
                            // Tweet date comes from block timestamp
                            blockTime: (block && new Date(block.timestamp * 1000)) || new Date(0)
                        };
                        return [2 /*return*/, retItm];
                }
            });
        });
    };
    /**
     * Returns a list of posts authored by a specific human.
     * @param human
     * @param contractProvider
     */
    PostaService.prototype.getPostsBy = function (human) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPosts([human], null)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns an array with the supporters of a post up to a max number of logs.
     * @param tokenId
     * @param max
     * @param contractProvider
     */
    PostaService.prototype.getSupportersOf = function (tokenId, max) {
        return __awaiter(this, void 0, void 0, function () {
            var postaContract, filter, logs, retVal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._contractProvider.getPostaContractForRead()];
                    case 1:
                        postaContract = _a.sent();
                        filter = postaContract.filters.SupportGiven([tokenId], null);
                        return [4 /*yield*/, postaContract.queryFilter(filter)];
                    case 2:
                        logs = _a.sent();
                        if (!logs)
                            return [2 /*return*/, null];
                        if (logs.length > max)
                            logs = logs.slice(0, 10);
                        return [4 /*yield*/, Promise.all(logs.map(this.buildSupportLog))];
                    case 3:
                        retVal = _a.sent();
                        return [2 /*return*/, retVal];
                }
            });
        });
    };
    PostaService.prototype.signPostaRequest = function (postData) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ((_a = this._contractProvider) === null || _a === void 0 ? void 0 : _a.signMessage(["address", "uint256", "uint256", "string"], [
                            postData.author,
                            postData.replyOfTokenId ? postData.replyOfTokenId.toString() : "0",
                            postData.nonce,
                            postData.text,
                        ], postData.author))];
                    case 1: 
                    //  Sign message with data
                    return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return PostaService;
}());
exports.PostaService = PostaService;
