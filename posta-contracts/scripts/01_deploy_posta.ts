import { ethers, upgrades } from "hardhat";
import { getContractsByNetwork } from "./utils/utils";

const MAX_CHARS = "280";
const BURN_PCT = "0.5";
const TREASURY_PCT = "0.01";

const contractName = "PostaV0_7";

async function main() {
  // const PostaLib = await ethers.getContractFactory("PostaLib");
  // const postaLib = await PostaLib.deploy();
  const [deployer] = await ethers.getSigners();

  console.log("Deploying POSTA with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const contracts = getContractsByNetwork(process.env.CONFIG || "");

  const Posta = await ethers.getContractFactory(contractName);
  const postaContract = await upgrades.deployProxy(Posta, [contracts?.poh, contracts?.ubi, MAX_CHARS, ethers.utils.parseEther(BURN_PCT).toString(), ethers.utils.parseEther(TREASURY_PCT).toString()])
  const owner = await postaContract.owner();
  console.log("OWNER", owner);

  //const c = await postaContract.deployed();
  //console.log(c);
  console.log("Posta deployed to:", postaContract.address);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
