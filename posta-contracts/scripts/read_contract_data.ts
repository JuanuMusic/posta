
import { ethers, upgrades } from "hardhat";
import { getContractsByNetwork } from "./utils/utils";

const KOVAN_PROXY_ADDRESS = "0x0C5E8C6F974D2E2Ac8FF59b12d61b85E0bdfcC8b";
const LOCAL_PROXY_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

const DEPLOY_NETWORK: DeployableNetwork = "localhost";

async function main() {
  
  const contracts = getContractsByNetwork(DEPLOY_NETWORK);

  // Get contract factory
  const postaContract = await ethers.getContractFactory("PostaV0_8");
  
  // Attach the deployed contract
  const deployed = postaContract.attach(contracts.posta);
  
  // Get values
  const treasuryPct = await deployed.getTreasuryPct();
  const burnPct = await deployed.getBurnPct();
  const tokenCount = await deployed.getTokenCounter();  
  //await upgrades.upgradeProxy(KOVAN_PROXY_ADDRESS, PostaV3);
  console.log("Burn %", burnPct .toString());
  console.log("Treasury %", treasuryPct.toString());
  console.log("Tokens", tokenCount.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    console.error(JSON.stringify(error));
    process.exit(1);
  });
