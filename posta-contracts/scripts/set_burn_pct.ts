
import { ethers, upgrades } from "hardhat";

const KOVAN_PROXY_ADDRESS = "0x0C5E8C6F974D2E2Ac8FF59b12d61b85E0bdfcC8b";
const LOCAL_PROXY_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

async function main() {
  // Deploy Library
  // console.log("Deploying PostaLib...")
  // const PostaLib = await ethers.getContractFactory("PostaLib");
  // const postaLib = await PostaLib.deploy();
  // console.log("Posta Lib Address:", postaLib.address);
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading POSTA with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const PostaV3 = await ethers.getContractFactory("PostaV0_3");
  const deployed = PostaV3.attach(KOVAN_PROXY_ADDRESS);
  const BURN_PCT = "0.5"
  await deployed.setBurnPct(ethers.utils.parseEther(BURN_PCT));
  //await upgrades.upgradeProxy(KOVAN_PROXY_ADDRESS, PostaV3);
  console.log("Burn % updated to", BURN_PCT);
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
