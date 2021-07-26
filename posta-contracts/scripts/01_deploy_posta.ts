import { ethers, upgrades } from "hardhat";

const MAINNET_UBI_ADDRESS = "0xDd1Ad9A21Ce722C151A836373baBe42c868cE9a4";
const MAINNET_POH_ADDRESS = "0xC5E9dDebb09Cd64DfaCab4011A0D5cEDaf7c9BDb";


const KOVAN_UBI_ADDRESS = "0xDdAdE19B13833d1bF52c1fe1352d41A8DD9fE8C9";
const KOVAN_POH_ADDRESS = "0x73BCCE92806BCe146102C44c4D9c3b9b9D745794";

const LOCAL_UBI_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const LOCAL_POH_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const MAX_CHARS = "280";
const BURN_PCT = "0.5";
const TREASURY_PCT = "0.01";
async function main() {
  // const PostaLib = await ethers.getContractFactory("PostaLib");
  // const postaLib = await PostaLib.deploy();
  const [deployer] = await ethers.getSigners();

  console.log("Deploying POSTA with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Posta = await ethers.getContractFactory("PostaV0_7");
  const postaContract = await upgrades.deployProxy(Posta, [MAINNET_POH_ADDRESS, MAINNET_UBI_ADDRESS, MAX_CHARS, ethers.utils.parseEther(BURN_PCT).toString(), ethers.utils.parseEther(TREASURY_PCT).toString()])
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
