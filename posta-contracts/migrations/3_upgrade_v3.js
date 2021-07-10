const BN = require("bn.js")
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const PostaV2 = artifacts.require("PostaV2");
const PostaV3 = artifacts.require("PostaV3");


module.exports = async function (deployer) {

  const toWeiBN = new BN(10).pow(new BN(18));

  // Deploy Posta with proxy
  const posta = await PostaV2.deployed();
  const proxyInstance = await upgradeProxy(posta, PostaV3, { deployer });
  await proxyInstance.setMeimouVal(new BN(1000000));
  console.log('Upgraded proxy', proxyInstance.address);
  console.log("Meimou Val", (await proxyInstance.getMeimouVal()).toString());
}