import { ethers, upgrades } from "hardhat";

const KOVAN_PROXY_ADDRESS = "0xde4ABEdd6527e4DcBBd50221734Ff5A609bE275C";
const LOCAL_PROXY_ADDRESS = "0x36fE32adFFF88891E56dB48f0B5d61E2bbD1e9fc"


const KOVAN_POSTALIB_ADDRESS = "0xAAeCD4c0045F7c798B2E76820281B2ff7026328b";
async function main() {
  // Deploy Library
  // console.log("Deploying PostaLib...")
  // const PostaLib = await ethers.getContractFactory("PostaLib");
  // const postaLib = await PostaLib.deploy();
  // console.log("Posta Lib Address:", postaLib.address);

  console.log("Upgrading...")
  const PostaV2 = await ethers.getContractFactory("PostaV2", { libraries: { PostaLib: KOVAN_POSTALIB_ADDRESS } });
  await upgrades.upgradeProxy(KOVAN_PROXY_ADDRESS, PostaV2, { unsafeAllowLinkedLibraries: true });
  console.log("Posta upgraded to V2");
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
