
require('dotenv').config()
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import '@openzeppelin/hardhat-upgrades';
import "hardhat-gas-reporter"

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

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
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
      accounts: [process.env.POSTA_DEPLOYER_PK],
      gas: "auto"
    }
  },
};

