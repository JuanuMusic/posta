import { ethers, upgrades } from "hardhat";


const KOVAN_UBI_ADDRESS = "0xDdAdE19B13833d1bF52c1fe1352d41A8DD9fE8C9";
const KOVAN_POH_ADDRESS = "0x73BCCE92806BCe146102C44c4D9c3b9b9D745794";

const LOCAL_UBI_ADDRESS = "0xc0cF5A7CCAF665E41dE112e1C3dD4cD64b5af83c";
const LOCAL_POH_ADDRESS = "0xA2BE3f56dD768e442e49f0c5B9385c4067bAdf2f";
const MAX_CHARS = "280";
const BURN_PCT = "0.5";
const TREASURY_PCT = "0";
async function main() {
  // const PostaLib = await ethers.getContractFactory("PostaLib");
  // const postaLib = await PostaLib.deploy();

  const Posta = await ethers.getContractFactory("Posta");
  const postaContract = await upgrades.deployProxy(Posta, [KOVAN_POH_ADDRESS, KOVAN_UBI_ADDRESS, MAX_CHARS, ethers.utils.parseEther(BURN_PCT).toString(), ethers.utils.parseEther(TREASURY_PCT).toString()])
  await postaContract.deployed();
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
