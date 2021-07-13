import {ethers, upgrades} from "hardhat";
const POH_GOVERNOR ="0x71814b57a7Cfb635B91B48F24ED6315937fF1ee3";
async function main() {
  const UBI = await ethers.getContractFactory("DummyUBI");
  const ubiContract = await UBI.deploy();
  console.log("Dummy UBI deployed to:", ubiContract.address);

  const DummyPOH = await ethers.getContractFactory("DummyProofOfHumanity");
  const pohContract = await DummyPOH.deploy(POH_GOVERNOR, ubiContract.address);
  console.log("Dummy POH deployed to:", pohContract.address);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
