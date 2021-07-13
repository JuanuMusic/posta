import { expect, util } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import * as utils from "./test-utils";

// Contracts revert codes
const POST_TEXT_TOO_LONG = "POST_TEXT_TOO_LONG";
const HUMAN_NOT_REGISTERED = "HUMAN_NOT_REGISTERED";

// Contracts settings
const POH_GOVERNOR = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";
const MAX_CHARS = 140;
const DEFAULT_BURN_PCT = 0.5;
const DEFAULT_TREASURY_PCT = 0.01;

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

    describe("Posta content support", async () => {

        it("Should decrease UBI balance on supporter", async () => {
            // Create a post
            const tokenId = await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, contracts.posta);

            // Get initial balance of supporter
            const initialBalance = await contracts.ubi.balanceOf(await actors.HUMAN_2.getAddress());
            // Valu to give
            const ubiSupport = BigNumber.from(1).mul(TO_WEI_BN);

            const human2Posta = contracts.posta.connect(actors.HUMAN_2);
            const human2UBI = contracts.ubi.connect(actors.HUMAN_2);

            await human2UBI.approve(contracts.posta.address, ubiSupport);
            await human2Posta.support(tokenId, ubiSupport);

            const newBalance = await contracts.ubi.balanceOf(await actors.HUMAN_2.getAddress());
            expect(newBalance.toString()).eq(initialBalance.sub(ubiSupport).toString(), "Invalid new Balance after support given");
        })

        it("Should give support", async () => {

            // Create a post
            const tokenId = await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, contracts.posta);

            // Get post state before giving support. 
            const currentPostState = await contracts.posta.getPost(tokenId);
            // Support to be given to the post
            const supportToGive = BigNumber.from(1).mul(TO_WEI_BN);

            // Give support
            await utils.supportPostFrom(actors.HUMAN_2, tokenId, supportToGive, contracts);

            // Get post state after giving support
            const post = await contracts.posta.getPost(tokenId);
            expect(post.supportGiven.toString()).eq(currentPostState.supportGiven.add(supportToGive).toString(), "Invalid UBI support value");
            expect(post.supportersCount.toString()).eq("1", "Invalid supporters count")
        });

        it("Should count only 1 supporter even if support is given multiple times by the same human", async () => {

            // Create a post
            const tokenId = await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, contracts.posta);
            const ubiSupport = BigNumber.from(1).mul(TO_WEI_BN);

            const prevPost = await contracts.posta.getPost(tokenId);
            const prevSupport = prevPost.supportGiven;
            // Give support twice
            await utils.supportPostFrom(actors.HUMAN_2, tokenId, ubiSupport, contracts);
            await utils.supportPostFrom(actors.HUMAN_2, tokenId, ubiSupport, contracts);

            // Get post state and validate that supporters count is 1
            const post = await contracts.posta.getPost(tokenId);
            expect(post.supportersCount.toString()).eq("1", "Invalid supporters count");
        });

        it("Should count 2 supporters when 2 humans send support", async () => {

            // Create a post
            const tokenId = await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, contracts.posta);
            const ubiSupport = BigNumber.from(1).mul(TO_WEI_BN);

            const prevPost = await contracts.posta.getPost(tokenId);
            const prevSupport = prevPost.supportGiven;
            // Give support from both humans
            // Give support twice
            await utils.supportPostFrom(actors.HUMAN_2, tokenId, ubiSupport, contracts);
            await utils.supportPostFrom(actors.HUMAN_3, tokenId, ubiSupport, contracts);

            const post = await contracts.posta.getPost(tokenId);
            expect(post.supportGiven.toString()).eq(prevSupport.add(ubiSupport.mul(2)).toString(), "Invalid UBI suport value");
            expect(post.supportersCount.toString()).eq("2", "Invalid supporters count");
        });

        it("Should fail if UBI balance is not enough", async () => {
            // Create a post
            const tokenId = await utils.createPostFrom(actors.HUMAN_2, POST_TEST_TEXT, contracts.posta);
            // Get current balance
            const currentUBIBalance = await contracts.ubi.balanceOf(await actors.HUMAN_1.getAddress());

            // Support to give = currentBalance + 1
            const ubiSupport = currentUBIBalance.add(1);

            // Give support from both humans
            await expect(utils.supportPostFrom(actors.HUMAN_1, tokenId, ubiSupport, contracts)).to.be.reverted;

        })
    });

    describe("UBI Burn", async () => {


        it("Should burn half of the UBIs when setting 0.5 as burnPCT when support is given", async () => {
            
            const burnPct = ethers.utils.parseEther("0.5");
            await contracts.posta.setBurnPct(burnPct.toString());

            // Create a post
            const tokenId = await utils.createPostFrom(actors.HUMAN_2, POST_TEST_TEXT, contracts.posta);
            // Get the initial total UBI supply.
            const initialUBISupply = await contracts.ubi.totalSupply();
            // Calculate support to give in weiUBI
            const ubiSupport = BigNumber.from(1).mul(TO_WEI_BN);
            // Calculate expected value
            const expected = initialUBISupply.sub(BigNumber.from(ethers.utils.parseEther("0.5")));
            await utils.supportPostFrom(actors.HUMAN_1, tokenId, ubiSupport, contracts);

            // Amount burn't is a function of the burnPCT property
            const newUbiSupply = await contracts.ubi.totalSupply();
            expect(newUbiSupply.toString()).eq(expected.toString(), "Invalid UBI supply after burn");
        });

        it("Should burn a quarter of the UBIs when setting 0.25 as burnPCT when support is given", async () => {
            
            const burnPct = ethers.utils.parseEther("0.25");
            await contracts.posta.setBurnPct(burnPct.toString());

            // Create a post
            const tokenId = await utils.createPostFrom(actors.HUMAN_2, POST_TEST_TEXT, contracts.posta);
            // Get the initial total UBI supply.
            const initialUBISupply = await contracts.ubi.totalSupply();
            // Calculate support to give in weiUBI
            const ubiSupport = BigNumber.from("1").mul(TO_WEI_BN);
            // Calculate expected return value ty
            const expected = initialUBISupply.sub(BigNumber.from(ethers.utils.parseEther("0.25")));
            await utils.supportPostFrom(actors.HUMAN_1, tokenId, ubiSupport, contracts);

            // Amount burn't is a function of the burnPCT property
            const newUbiSupply = await contracts.ubi.totalSupply();
            expect(newUbiSupply.toString()).eq(expected.toString(), "Invalid UBI supply after burn");
        });
    });

});
