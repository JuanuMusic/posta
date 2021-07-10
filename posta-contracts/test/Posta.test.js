const BN = require("bn.js")
const truffleAssert = require('truffle-assertions');

const ProofOfHumanity = artifacts.require("DummyProofOfHumanity");
const Posta = artifacts.require("PostaV2");
const UBI = artifacts.require("DummyUBI");

const POH_GOVERNOR = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";
const POST_TEST_TEXT = "This is a test post"
const MAX_CHARS = 140;

const TO_WEI_BN = new BN(10).pow(new BN(18));
contract("Posta", accounts => {

    let postaContract;
    let poh;
    const HUMAN_1 = accounts[0];
    const HUMAN_2 = accounts[1];
    const HUMAN_3 = accounts[2];
    const NOT_REGISTERED_ADDRESS = accounts[3];

    before(async () => {
        ubi = await UBI.new();
        poh = await ProofOfHumanity.new(POH_GOVERNOR, ubi.address);
        postaContract = await Posta.new();
        await postaContract.initialize(poh.address, ubi.address, MAX_CHARS);
        
        // Half of UBI will be burn 1/2 = 1 * (10**18) / 2 PCT to 18 digits precission;
        const burnPct = new BN(1).mul(TO_WEI_BN).div(new BN(2));
        await postaContract.setBurnPct(burnPct);
        console.log("Burn %:", (await postaContract.getBurnPct()).toString());
        await poh.register(HUMAN_1);
        await poh.register(HUMAN_2);
        await poh.register(HUMAN_3);
    })

    describe("Posta content creation", () => {

        /* Test human only access */
        it("Should fail when user not Human tries to publish a Posta", async () => {
            const PREFIX = "VM Exception while processing transaction: ";

            try {
                await postaContract.publishPost(POST_TEST_TEXT, { from: NOT_REGISTERED_ADDRESS });
            } catch (error) {
                assert(error, "Expected an error but did not get one");
                //assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
            }
        });

        /* Test NFT mint */
        it("Should correctly mint an NFT and update the tokenCounter", async () => {
            assert(await poh.isRegistered(HUMAN_1), "User is not registered on PoH");
            const receipt = await postaContract.publishPost(POST_TEST_TEXT, { from: HUMAN_1 });
            const tokenId = receipt.logs[0].args.tokenId;
            assert(tokenId.eq(new BN(0)), "NFT was not correctly minted");

            const tokenCounter = await postaContract.getTokenCounter()
            assert(tokenCounter.eq(new BN(1)), "Invalid token counter value");
        });

        /* Test minted NFT ownership */
        it("Minted NFT should belong to publisher address", async () => {
            assert(await poh.isRegistered(HUMAN_1), "User is not registered on PoH");
            const receipt = await postaContract.publishPost(POST_TEST_TEXT, { from: HUMAN_1 });
            const tokenId = receipt.logs[0].args.tokenId;
            assert(tokenId.eq(new BN(1)), "NFT was not correctly minted");

            const owner = await postaContract.ownerOf(tokenId);
            assert.equal(owner, HUMAN_1, "Invalid token owner");
        });

    });

    describe("Posta content support", () => {

        it("Should decrease UBI balance on supporter", async () => {

            const initialBalance = await ubi.balanceOf(HUMAN_2);

            const ubiSupport = new BN(1).mul(TO_WEI_BN);

            await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_2 });
            await postaContract.support(1, ubiSupport, { from: HUMAN_2 });

            const newBalance = await ubi.balanceOf(HUMAN_2);
            assert.equal(newBalance.toString(), initialBalance.sub(ubiSupport).toString(), "Invalid new Balance after support given");
        })

        it("Should give support", async () => {

            // Get post state before giving support. 
            const currentPostState = await postaContract.getPost(1);

            // Support to be given to the post
            const suportToGive = new BN(1).mul(TO_WEI_BN);

            // Give support
            await ubi.approve(postaContract.address, suportToGive, { from: HUMAN_2 });
            await postaContract.support(1, suportToGive, { from: HUMAN_2 });

            // Get post state after giving support
            const post = await postaContract.getPost(1);
            assert.equal(new BN(post.supportGiven).toString(), new BN(currentPostState.supportGiven).add(suportToGive).toString(), "Invalid UBI suport value");
            assert.equal(post.supportersCount, 1, "Invalid supporters count")
        });

        it("Should count only 1 supporter even if support is given multiple times by the same human", async () => {

            const totalUbiSupport = new BN(2).mul(TO_WEI_BN);
            const halfUbiSupport = totalUbiSupport.div(new BN(2));
            await ubi.approve(postaContract.address, totalUbiSupport, { from: HUMAN_2 });

            const prevPost = await postaContract.getPost(1);
            const prevSupport = prevPost.supportGiven;
            // Give support twice
            await postaContract.support(1, halfUbiSupport, { from: HUMAN_2 });
            await postaContract.support(1, halfUbiSupport, { from: HUMAN_2 });

            const post = await postaContract.getPost(1);
            assert.equal(post.supportGiven, new BN(prevSupport).add(totalUbiSupport), "Invalid UBI support value");
            assert.equal(post.supportersCount, 1, "Invalid supporters count")
        });

        it("Should count 2 supporters when 2 humans send support", async () => {

            const ubiSupport = new BN(1).mul(TO_WEI_BN);
            const prevPost = await postaContract.getPost(1);
            const prevSupport = prevPost.supportGiven;
            // Give support from both humans
            await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_2 });
            await postaContract.support(1, ubiSupport, { from: HUMAN_2 });

            await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_3 });
            await postaContract.support(1, ubiSupport, { from: HUMAN_3 });

            const post = await postaContract.getPost(1);
            assert.equal(post.supportGiven, new BN(prevSupport).add(ubiSupport.mul(new BN(2))), "Invalid UBI suport value");
            assert.equal(post.supportersCount, 2, "Invalid supporters count");
        });

        it("Should fail UBI balance is not enough", async () => {
            const currentUBIBalance = await ubi.balanceOf(HUMAN_1, { from: HUMAN_1 });
            const ubiSupport = new BN(1).mul(TO_WEI_BN).add(currentUBIBalance);

            try {
                // Give support from both humans
                await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_1 });
                await postaContract.support(1, ubiSupport, { from: HUMAN_1 });

            } catch (error) {
                assert(error, "Expected an error but did not get one");
            }
        })
    });

    describe("UBI Burn", () => {

        it("Should burn the correct percentage of UBI from the total supply on support given", async () => {
            const initialUBISupply = await ubi.totalSupply();
            const ubiSupport = new BN(1).mul(TO_WEI_BN);

            await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_2 });
            await postaContract.support(1, ubiSupport, { from: HUMAN_2 });

            // Amount burn't is a function of the burnPCT property
            const burnPct = await postaContract.getBurnPct();
            const expectedBurnUBI = ubiSupport.div(TO_WEI_BN.div(burnPct));
            const expectedUBISupply = initialUBISupply.sub(expectedBurnUBI);
            const newUbiSupply = await ubi.totalSupply();
            assert.equal(newUbiSupply.toString(), expectedUBISupply.toString(), "Invalid UBI supply after burn");
        });
    });
});