const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const Posta = artifacts.require("Posta");


const KOVAN_POH_ADDRESS = "0x73BCCE92806BCe146102C44c4D9c3b9b9D745794";
const KOVAN_UBI_ADDRESS = "0xDdAdE19B13833d1bF52c1fe1352d41A8DD9fE8C9";
const MAX_CHARS = "140";
module.exports = async function (deployer) {

  let ubiAddress = KOVAN_UBI_ADDRESS;
  let pohAddress = KOVAN_POH_ADDRESS;
  
  // Dummy Deploy for local networks
  const isDevelop = deployer.network.includes("develop");
  console.log("IS DEVELOP?", isDevelop);
  if (isDevelop) {
    const ubi = await deployDummyUBI(deployer);

    const governor = "0x4637c684720EB8321Dc04d03D6d0b9D49ce5287E";
    const poh = await deployDummyPOH(deployer, governor, ubi);

    ubiAddress = ubi;
    pohAddress = poh;
  }
  
  // Deploy Posta with proxy
  const proxyInstance = await deployProxy(Posta, [pohAddress, ubiAddress,MAX_CHARS], { deployer });
  console.log('Deployed Posta at', proxyInstance.address);

  deployer.proxyAddress = proxyInstance.address;
  
}


async function deployDummyUBI(deployer) {
  console.log("Deploying Dummy UBI contract...");
  const DummyUBI = artifacts.require("DummyUBI");
  const dummyUBIContract = await deployer.deploy(DummyUBI);
  return DummyUBI.address;
}

async function deployDummyPOH(deployer, governor, ubiAddress) {
  console.log("Deploying Dummy PoH contract...");
  const DummyProofOfHumanity = artifacts.require("DummyProofOfHumanity");
  await deployer.deploy(DummyProofOfHumanity, governor, ubiAddress);
  return DummyProofOfHumanity.address;
}