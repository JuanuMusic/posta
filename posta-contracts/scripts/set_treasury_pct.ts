
import { ethers, upgrades } from "hardhat";

const KOVAN_PROXY_ADDRESS = "0x0C5E8C6F974D2E2Ac8FF59b12d61b85E0bdfcC8b";
const LOCAL_PROXY_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

const TREASURY_PCT = "0.01"

async function main() {
  const [deployer] = await ethers.getSigners();
  const postaContract = await ethers.getContractFactory("PostaV0_5");
  const deployed = postaContract.attach(KOVAN_PROXY_ADDRESS);
  await deployed.setTreasuryPct(ethers.utils.parseEther(TREASURY_PCT));
  //await upgrades.upgradeProxy(KOVAN_PROXY_ADDRESS, PostaV3);
  console.log("Burn % updated to", TREASURY_PCT);
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
