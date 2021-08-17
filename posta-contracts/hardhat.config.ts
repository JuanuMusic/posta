
require('dotenv').config()
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import '@openzeppelin/hardhat-upgrades';
import "hardhat-gas-reporter"
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-etherscan";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts  = process.env.POSTA_DEPLOYER_PK && [process.env.POSTA_DEPLOYER_PK];

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    ganache: { // default with truffle unbox is 7545, but we can use develop to test changes, ex. truffle migrate --network develop
      url: "http://127.0.0.1:7545",
      accounts: [process.env.TEST_ACC_1,
      process.env.TEST_ACC_2,
      process.env.TEST_ACC_3,
      process.env.TEST_ACC_4]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: accounts || undefined,
      //loggingEnabled: true
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: accounts || undefined,
      //loggingEnabled: true
    }, 
    localhost: {
      loggingEnabled: true
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  },
  contractSizer: {
    runOnCompile: true
  }
};

