import { expect } from "chai";
import * as utils from "./test-utils";
import BN from "bn.js";
import { ethers } from "ethers";

// Contracts revert codes
const POST_TEXT_TOO_LONG = "POST_TEXT_TOO_LONG";
const HUMAN_NOT_REGISTERED = "HUMAN_NOT_REGISTERED";

// Contracts settings
const POH_GOVERNOR = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";
const MAX_CHARS = 140;
const BURN_PCT = 0.5;
const TREASURY_PCT = 0;

const POST_TEST_TEXT = "This is a test post"

// HELPERS
const TO_WEI_BN = new BN(10).pow(new BN(18));

async function initialize() {
  const contracts = await utils.getContracts(POH_GOVERNOR, MAX_CHARS, ethers.utils.parseEther(BURN_PCT.toString()), ethers.utils.parseEther(TREASURY_PCT.toString()));
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

  describe("Posta content creation", async () => {


    /* Test human only access */
    it("Should fail when user not Human tries to publish a Posta", async () => {
      const PREFIX = "VM Exception while processing transaction: ";
      
      // Connect not registered account
      const nonHumanPosta = contracts.posta.connect(actors.NOT_REGISTERED_ADDRESS);

      // Try to publish should revert
      await expect(nonHumanPosta.publishPost(POST_TEST_TEXT)).to.be.revertedWith(HUMAN_NOT_REGISTERED);
    });

    /* Test NFT mint */
    it("Should correctly mint an NFT and update the tokenCounter", async () => {
      expect(await contracts.poh.isRegistered(actors.HUMAN_1.getAddress()), "User is not registered on PoH");
      
      const tokenId = await contracts.posta.publishPost(POST_TEST_TEXT);
      expect(tokenId.value.toString()).eq("0", "NFT was not correctly minted");

      const tokenCounter = await contracts.posta.getTokenCounter();
      expect(tokenCounter.toString()).eq("1", "Invalid token counter value");
    });

    /* Test minted NFT ownership */
    it("Minted NFT should belong to publisher address", async () => {
      const tokenId = await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, contracts.posta);
      const owner = await contracts.posta.ownerOf(tokenId);
      expect(owner).eq(await actors.HUMAN_1.getAddress(), "Invalid token owner");
    });

    it("Should fail when text is longer than MAX_CHARS", async () => {

      // Register humans
      await contracts.poh.register(actors.HUMAN_1.getAddress());
      await contracts.poh.register(actors.HUMAN_2.getAddress());

      // Get contract's max chars
      const maxChars = await contracts.posta.getMaxChars();
      expect(maxChars).gt(0, "Max chars on Posta contract cannot be zero");

      // Generate a string maxChards + 1 length
      const content = "*".repeat(maxChars + 1);
      await expect(contracts.posta.publishPost(content)).to.be.revertedWith(POST_TEXT_TOO_LONG);
    });

  });

});
