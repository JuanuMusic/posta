// test/Box.proxy.test.js
// Load dependencies
const { expect } = require('chai');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

// Load compiled artifacts
const Posta = artifacts.require('Posta');
const UBI = artifacts.require("DummyUBI");
const PoH = artifacts.require("DummyProofOfHumanity");

const POH_GOVERNOR = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";

const MAX_CHARACTERS = 140;

// Start test block
contract('Posta (proxy)', function (accounts) {
    let postaContract;
    let poh;
    const HUMAN_1 = accounts[0];
    const HUMAN_2 = accounts[1];
    const HUMAN_3 = accounts[2];
    const NOT_REGISTERED_ADDRESS = accounts[3];

    before(async () => {
        ubi = await UBI.new();
        poh = await PoH.new(POH_GOVERNOR, ubi.address);
        await poh.register(HUMAN_1);
        await poh.register(HUMAN_2);
        await poh.register(HUMAN_3);
    })

    beforeEach(async function () {
        // Deploy a new Box contract for each test
        this.posta = await deployProxy(Posta, [poh.address, ubi.address, MAX_CHARACTERS], { initializer: 'initialize' });
    });

    // Test case
    it('retrieve max chars value previously initialized', async function () {
        // Test if the returned value is the same one
        // Note that we need to use strings to compare the 256 bit integers
        expect((await this.posta.getMaxChars()).toString()).to.equal(MAX_CHARACTERS.toString());
    });
});