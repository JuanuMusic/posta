const BN = require("bn.js")
const truffleAssert = require('truffle-assertions');

const ProofOfHumanity = artifacts.require("contracts/DummyProofOfHumanity.sol");
const Posta = artifacts.require("contracts/Posta.sol");
const UBI = artifacts.require("contracts/DummyUBI.sol");

const POH_GOVERNOR = "0x2ad91063e489CC4009DF7feE45C25c8BE684Cf6a";
const POSTA_URL = "https://ipfs.io/ipfs/QmPS5L36v6zJvzBYuMjDC8ojpx9JNULRG3Perw66qRb6NT?filename=VID_20210322_212500182.mp4"
contract("Posta", accounts => {

    let postaContract;
    let poh;
    const HUMAN_1 = accounts[0];
    const HUMAN_2 = accounts[1];
    const NOT_REGISTERED_ADDRESS = accounts[3];

    before(async () => {
        ubi = await UBI.new();
        poh = await ProofOfHumanity.new(POH_GOVERNOR, ubi.address);
        postaContract = await Posta.new(poh.address, ubi.address);
        await poh.register(HUMAN_1);
        await poh.register(HUMAN_2);
    })

    describe("Posta content creation", () => {

        /* Test human only access */
        it("Should fail when user not Human tries to publish a Posta", async () => {
            const PREFIX = "VM Exception while processing transaction: ";

            try {
                await postaContract.publishPost(POSTA_URL, { from: NOT_REGISTERED_ADDRESS });
            } catch (error) {
                assert(error, "Expected an error but did not get one");
                //assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
            }
        });

        /* Test NFT mint */
        it("Should correctly mint an NFT and update the tokenCounter", async () => {
            const receipt = await postaContract.publishPost(POSTA_URL, { from: HUMAN_1 });
            const tokenId = receipt.logs[0].args.tokenId;
            assert(tokenId.eq(new BN(0)), "NFT was not correctly minted");

            const tokenCounter = await postaContract.getTokenCounter()
            assert(tokenCounter.eq(new BN(1)), "Invalid token counter value");
        });

        /* Test minted NFT ownership */
        it("Minted NFT should belong to publisher address", async () => {
            const receipt = await postaContract.publishPost(POSTA_URL, { from: HUMAN_1 });
            const tokenId = receipt.logs[0].args.tokenId;
            assert(tokenId.eq(new BN(1)), "NFT was not correctly minted");

            const owner = await postaContract.ownerOf(tokenId);
            assert.equal(owner, HUMAN_1, "Invalid token owner");
        });

    });

    describe("Posta content support", () => {

        it("Should decrease UBI balance on supporter", async () => {
            
            const initialBalance = await ubi.balanceOf(HUMAN_2);
            
            const ubiSupport = new BN(1).mul(new BN(10).pow(new BN(18)));
            
            await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_2 });
            await postaContract.support(1, ubiSupport, { from: HUMAN_2 });
            
            const newBalance = await ubi.balanceOf(HUMAN_2);
            assert.equal(newBalance.toString(), initialBalance.sub(ubiSupport).toString(), "Invalid new Balance after support given");
        })

        it("Should give support", async () => {

            // Get post state before giving support. 
            const currentPostState = await postaContract.getPost(1);

            // Support to be given to the post
            const suportToGive = new BN(1).mul(new BN(10).pow(new BN(18)));
            
            // Give support
            await ubi.approve(postaContract.address, suportToGive, { from: HUMAN_2 });
            await postaContract.support(1, suportToGive, { from: HUMAN_2 });

            // Get post state after giving support
            const post = await postaContract.getPost(1);
            assert.equal(new BN(post.supportGiven).toString(), new BN(currentPostState.supportGiven).add(suportToGive).toString(), "Invalid UBI suport value");
            assert.equal(post.supportersCount, 1, "Invalid supporters count")
        });

        it("Should count only 1 supporter even if support is given multiple times by the same human", async () => {

            const totalUbiSupport = new BN(2).mul(new BN(10).pow(new BN(18)));
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

            const ubiSupport = new BN(1).mul(new BN(10).pow(new BN(18)));
            const prevPost = await postaContract.getPost(1); 
            const prevSupport = prevPost.supportGiven;
            // Give support from both humans
            await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_1 });
            await postaContract.support(1, ubiSupport, { from: HUMAN_1 });

            await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_2 });
            await postaContract.support(1, ubiSupport, { from: HUMAN_2 });

            const post = await postaContract.getPost(1);
            assert.equal(post.supportGiven, new BN(prevSupport).add(ubiSupport.mul(new BN(2))), "Invalid UBI suport value");
            assert.equal(post.supportersCount, 2, "Invalid supporters count");
        });

        it("Should fail UBI balance is not enough", async () => {
            const currentUBIBalance = await ubi.balanceOf(HUMAN_1, { from: HUMAN_1 });
            const ubiSupport = new BN(1).mul(new BN(10).pow(new BN(18))).add(currentUBIBalance);

            try {
                // Give support from both humans
                await ubi.approve(postaContract.address, ubiSupport, { from: HUMAN_1 });
                await postaContract.support(1, ubiSupport, { from: HUMAN_1 });
                
            } catch (error) {
                assert(error, "Expected an error but did not get one");
            }
        })
    });
});