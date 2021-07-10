const BN = require("bn.js")
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const Posta = artifacts.require("Posta");
const PostaV2 = artifacts.require("PostaV2");


module.exports = async function (deployer) {

  const toWeiBN = new BN(10).pow(new BN(18));

  // Deploy Posta with proxy
  const posta = await Posta.deployed();
  const proxyInstance = await upgradeProxy(posta, PostaV2, { deployer });
  await proxyInstance.setBurnPct(new BN(0.5).mul(toWeiBN));
  console.log('Upgraded proxy', proxyInstance.address);
}