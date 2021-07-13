import { ethers, upgrades } from "hardhat";

const POSTA_ADDRESS = "0xde4ABEdd6527e4DcBBd50221734Ff5A609bE275C";

async function main() {
  const PostaV2 = await ethers.getContractFactory("PostaV2");
  console.log("Upgrading...")
  await upgrades.upgradeProxy(POSTA_ADDRESS, PostaV2);
  console.log("Posta upgraded to V2");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
