import { expect, util } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import * as utils from "./test-utils";

// Contracts revert codes
const POST_TEXT_TOO_LONG = "POST_TEXT_TOO_LONG";
const HUMAN_NOT_REGISTERED = "HUMAN_NOT_REGISTERED";
const BURN_TREASURY_MUST_TOTAL_ONE = "BURN_TREASURY_MUST_TOTAL_ONE";

// Contracts settings
const POH_GOVERNOR = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";
const MAX_CHARS = 140;
const DEFAULT_BURN_PCT = 0.5;
const DEFAULT_TREASURY_PCT = 0;

const POST_TEST_TEXT = "This is a test post"

// HELPERS
const TO_WEI_BN = BigNumber.from(10).pow(18);


async function initialize() {
    const contracts = await utils.getContracts(POH_GOVERNOR, MAX_CHARS, ethers.utils.parseEther(DEFAULT_BURN_PCT.toString()), ethers.utils.parseEther(DEFAULT_TREASURY_PCT.toString()));
    const actors = await utils.getActors();
    await contracts.poh.register(actors.HUMAN_1.getAddress());
    await contracts.poh.register(actors.HUMAN_2.getAddress());
    await contracts.poh.register(actors.HUMAN_3.getAddress());

    return { contracts, actors };
}

describe("Posta", function () {

    let contracts: any, actors: any;

    this.beforeEach(async () => {
        // Get contracts and actors
        const testEnv = await initialize();
        contracts = testEnv.contracts;
        actors = testEnv.actors;
    })

    describe("Posta UBI support distribution", async () => {

        it("Should fail when burn percentage 0.5 + treasury percentage 0.6 > 1*10^18", async () => {
            
            const burnPct = ethers.utils.parseEther("0.5");
            await contracts.posta.setBurnPct(burnPct.toString());

            const treasuryPct = ethers.utils.parseEther("0.6");
            await expect(contracts.posta.setTreasuryPct(treasuryPct.toString())).to.be.revertedWith(BURN_TREASURY_MUST_TOTAL_ONE)
        })

        it("Should fail when burn percentage 0.6 + treasury percentage 0.41 > 1*10^18", async () => {
            
            const burnPct = ethers.utils.parseEther("0.6");
            await contracts.posta.setBurnPct(burnPct.toString());

            const treasuryPct = ethers.utils.parseEther("0.41");
            await expect(contracts.posta.setTreasuryPct(treasuryPct.toString())).to.be.revertedWith(BURN_TREASURY_MUST_TOTAL_ONE)
        })

        it("Should set burn and treasury percentage when burn percentage + treasury percentage <= 1*10^18", async () => {
            
            const burnPct = ethers.utils.parseEther("0.6");
            await contracts.posta.setBurnPct(burnPct.toString());

            const treasuryPct = ethers.utils.parseEther("0.4");
            await contracts.posta.setTreasuryPct(treasuryPct.toString())
        })

        it("Should set burn and treasury percentage when burn percentage + treasury percentage <= 1*10^18", async () => {
            
            const burnPct = ethers.utils.parseEther("0.5");
            await contracts.posta.setBurnPct(burnPct.toString());

            const treasuryPct = ethers.utils.parseEther("0.01");
            await contracts.posta.setTreasuryPct(treasuryPct.toString())
        })
    });

});
