import {ethers, upgrades} from "hardhat";

const POSTA_ADDRESS  = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

async function main() {
  const PostaV2 = await ethers.getContractFactory("PostaV2");
  const postaV2 = await upgrades.upgradeProxy(POSTA_ADDRESS, PostaV2);
  console.log("Posta upgraded to V2");
}

main();