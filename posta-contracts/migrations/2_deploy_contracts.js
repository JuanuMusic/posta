const Posta = artifacts.require("Posta");
//const DummyProofOfHumanity = artifacts.require("DummyProofOfHumanity");
const DummyUBI = artifacts.require("DummyUBI");


const KOVAN_POH_ADDRESS = "0x73BCCE92806BCe146102C44c4D9c3b9b9D745794";
const KOVAN_UBI_ADDRESS = "0xDdAdE19B13833d1bF52c1fe1352d41A8DD9fE8C9";

module.exports = async function (deployer) {

  let ubiAddress = KOVAN_UBI_ADDRESS;
  let pohAddress = KOVAN_POH_ADDRESS;
  
  const isKovan = deployer.network.includes("kovan");
  if (!isKovan) {
    await deployer.deploy(DummyUBI);
    const governor = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";
    await deployer.deploy(DummyProofOfHumanity, governor, DummyUBI.address);
    ubiAddress = DummyUBI.address;
    pohAddress = DummyProofOfHumanity.address;
  }

  const deploy = await deployer.deploy(Posta, pohAddress, ubiAddress);
  console.log("...COMPLETED MIGRATION", deploy)

}
