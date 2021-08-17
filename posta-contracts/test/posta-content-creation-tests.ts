import { expect } from "chai";
import * as utils from "./test-utils";
import BN from "bn.js";
import { ethers } from "ethers";
import testConstants from "./test-constants";

// Contracts settings
const POH_GOVERNOR = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";
const MAX_CHARS = 140;
const BURN_PCT = 0.5;
const TREASURY_PCT = 0;

const POST_TEST_TEXT = "Hola mundo mundirijillo!"

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

      // Try to publish should revert
      await expect(utils.createPostFrom(actors.NOT_REGISTERED_ADDRESS, POST_TEST_TEXT, null, contracts.posta)).to.be.revertedWith(testConstants.postaConstants.HUMAN_NOT_REGISTERED);
    });

    /* Test NFT mint */
    it("Should correctly mint an NFT and update the tokenCounter", async () => {
      await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, null, contracts.posta)
      const tokenCounter = await contracts.posta.getTokenCounter();
      expect(tokenCounter.toString()).eq("1", "Invalid token counter value");
    });

    /* Test minted NFT ownership */
    it("Minted NFT should belong to publisher address", async () => {
      await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, null, contracts.posta);
      const owner = await contracts.posta.ownerOf("1");
      expect(owner).eq(await actors.HUMAN_1.getAddress(), "Invalid token owner");
    });

    it("Should fail when text is longer than MAX_CHARS", async () => {

      // Register humans
      await contracts.poh.register(actors.HUMAN_1.getAddress());

      // Get contract's max chars
      const maxChars = await contracts.posta.getMaxChars();
      expect(maxChars).gt(0, "Max chars on Posta contract cannot be zero");

      // Generate a string maxChards + 1 length
      const content = "*".repeat(maxChars + 1);
      await expect(utils.createPostFrom(actors.HUMAN_1, content, 0, contracts.posta)).to.be.revertedWith(testConstants.postaConstants.REVERT_POST_TEXT_TOO_LONG);
    });
  });

  describe("Post Replies", async () => {
    it("Should emit log with replied token id when replying", async () => {
      await utils.createPostFrom(actors.HUMAN_1, POST_TEST_TEXT, null, contracts.posta);
      await expect(utils.createPostFrom(actors.HUMAN_2, POST_TEST_TEXT, 1, contracts.posta))
        .to.emit(contracts.posta, "NewPostReply")
        .withArgs("2", "1");
    })
  })

  describe("Posta create on behalf of", async () => {
    it("Should emit log with signer as author when creating funded post", async () => {

      const postData = {
        text: POST_TEST_TEXT,
        nonce: Date.now(),
        isReplyOfTokenId: "0",
        author: await actors.HUMAN_2.getAddress()
      };

      const signedMessage = await utils.signMessage(
        ["address", "uint256", "uint256", "string"],
        [postData.author, postData.isReplyOfTokenId, postData.nonce, postData.text]
        , actors.HUMAN_2);

      await expect(utils.publishPostOnBehalfOf(actors.HUMAN_1, actors.HUMAN_2, postData.text, postData.isReplyOfTokenId, signedMessage, postData.nonce, contracts.posta))
        .to.emit(contracts.posta, "NewPost")
        .withArgs(postData.author, "1", postData.text)
        .to.emit(contracts.posta, "NewPostOnBehalfOf")
        .withArgs("1", await actors.HUMAN_1.getAddress());
    })

    it("Should fail to post on behalf of user when signer is different than author", async () => {

      const postData = {
        text: POST_TEST_TEXT,
        nonce: new Date().getDate(),
        isReplyOfTokenId: "0",
        author: await actors.HUMAN_2.getAddress()
      };

      const signedMessage = await utils.signMessage(
        ["address", "uint256", "uint256", "string"],
        [postData.author, postData.isReplyOfTokenId, postData.nonce, postData.text]
        , actors.HUMAN_1);

      await expect(utils.publishPostOnBehalfOf(actors.HUMAN_1, actors.HUMAN_2, postData.text, postData.isReplyOfTokenId, signedMessage, postData.nonce, contracts.posta))
        .to.be.revertedWith(testConstants.postaConstants.POSTA_INVALID_SIGNATURE);
    });

    it("Should fail to post on behalf of user when signer is not human", async () => {

      const postData = {
        text: POST_TEST_TEXT,
        nonce: new Date().getDate(),
        isReplyOfTokenId: "0",
        author: await actors.NOT_REGISTERED_ADDRESS.getAddress()
      };

      const signedMessage = await utils.signMessage(
        ["address", "uint256", "uint256", "string"],
        [postData.author, postData.isReplyOfTokenId, postData.nonce, postData.text]
        , actors.NOT_REGISTERED_ADDRESS);

      await expect(utils.publishPostOnBehalfOf(actors.HUMAN_1, actors.NOT_REGISTERED_ADDRESS, postData.text, postData.isReplyOfTokenId, signedMessage, postData.nonce, contracts.posta))
        .to.be.revertedWith(testConstants.postaConstants.HUMAN_NOT_REGISTERED);
    });

    it("Should fail to post on behalf of user when post funder is not human", async () => {

      const postData = {
        text: POST_TEST_TEXT,
        nonce: new Date().getDate(),
        isReplyOfTokenId: "0",
        author: await actors.HUMAN_1.getAddress()
      };

      const signedMessage = await utils.signMessage(
        ["address", "uint256", "uint256", "string"],
        [postData.author, postData.isReplyOfTokenId, postData.nonce, postData.text]
        , actors.HUMAN_1);

      await expect(utils.publishPostOnBehalfOf(actors.NOT_REGISTERED_ADDRESS, actors.HUMAN_1, postData.text, postData.isReplyOfTokenId, signedMessage, postData.nonce, contracts.posta))
        .to.be.revertedWith(testConstants.postaConstants.HUMAN_NOT_REGISTERED);
    });

    it("Should fail to post on behalf of user when post funder and signer is the same", async () => {

      const postData = {
        text: POST_TEST_TEXT,
        nonce: new Date().getDate(),
        isReplyOfTokenId: "0",
        author: await actors.HUMAN_1.getAddress()
      };

      const signedMessage = await utils.signMessage(
        ["address", "uint256", "uint256", "string"],
        [postData.author, postData.isReplyOfTokenId, postData.nonce, postData.text]
        , actors.HUMAN_1);

      await expect(utils.publishPostOnBehalfOf(actors.HUMAN_1, actors.HUMAN_1, postData.text, postData.isReplyOfTokenId, signedMessage, postData.nonce, contracts.posta))
        .to.be.revertedWith(testConstants.postaConstants.POSTA_SIGNER_CANNOT_BE_POSTER);
    })
  })

});
