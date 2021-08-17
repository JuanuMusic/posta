import { ethers, upgrades } from "hardhat";
import { getContractsByNetwork } from "./utils/utils";



const contractName = "PostaV0_8";

async function main() {
  const contracts = getContractsByNetwork(process.env.CONFIG || "");
  // Deploy Library
  // console.log("Deploying PostaLib...")
  // const PostaLib = await ethers.getContractFactory("PostaLib");
  // const postaLib = await PostaLib.deploy();
  // console.log("Posta Lib Address:", postaLib.address);
  const [deployer] = await ethers.getSigners();
  console.log(`Upgrading POSTA to ${contracts.posta} with account: ${deployer.address}`);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const postaContractFactory = await ethers.getContractFactory(contractName);
  await upgrades.upgradeProxy(contracts.posta, postaContractFactory);
  console.log("Posta upgraded to",contractName);
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
