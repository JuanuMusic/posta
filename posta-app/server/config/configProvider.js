"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// // Change this to your local chain id
// const LOCAL_CHAIN_ID = 31337;
// const LOCAL_NETWORK_URL = "http://127.0.0.1:8545/";
// const LOCAL_NETWORK_NAME = "develop";
// const KOVAN_CHAIN_ID = 42;
// const NETWORK_CONFIGS: { [key: number]: IConfiguration } = {
//     [KOVAN_CHAIN_ID]: kovanConfig,
//     [LOCAL_CHAIN_ID]: developConfig
// };
// const CHAIN_ID_BY_NAME: { [key: string]: number } = {
//     ["kovan"]: KOVAN_CHAIN_ID,
//     ["develop"]: LOCAL_CHAIN_ID
// }
exports.default = {
    getConfig: function () {
        return require("./" + process.env.REACT_APP_CONFIG + ".json");
    },
};
