"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
// Change this to your local chain id
var LOCAL_CHAIN_ID = 31337;
var LOCAL_NETWORK_URL = "http://localhost:7545";
var LOCAL_NETWORK_NAME = "develop";
exports.default = {
    getEthersProvider: function () {
        var provider = (process.env.DEFAULT_NETWORK && ethers_1.ethers.getDefaultProvider(process.env.DEFAULT_NETWORK)) ||
            (process.env.NODE_ENV === "development" ?
                new ethers_1.ethers.providers.JsonRpcProvider(LOCAL_NETWORK_URL, { chainId: LOCAL_CHAIN_ID, name: LOCAL_NETWORK_NAME }) :
                ethers_1.ethers.getDefaultProvider("kovan"));
        return provider;
    }
};
