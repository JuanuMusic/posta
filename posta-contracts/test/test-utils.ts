import { ethers, upgrades } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";

interface IContracts {
    ubi: Contract, poh: Contract, posta: Contract;
}
/**
 * 
 * @returns Deployed instances of the contracts to use for tests
 */
export async function getContracts(pohGovernor: string, maxCharsPosta: number, burnPct: BigNumber, treasuryPct: BigNumber): Promise<IContracts> {
    // Get contract factories
    const UBI = await ethers.getContractFactory("DummyUBI");
    const ProofOfHumanity = await ethers.getContractFactory("DummyProofOfHumanity");

    const PostaLib = await ethers.getContractFactory("PostaLib");
    const postaLib = await PostaLib.deploy();

    const Posta = await ethers.getContractFactory("Posta", { libraries: { PostaLib: postaLib.address } });

    // Deploy contracts
    const ubiContract = await UBI.deploy();
    const pohContract = await ProofOfHumanity.deploy(pohGovernor, ubiContract.address);
    // Deploy Posta
    const postaV1Contract = await upgrades.deployProxy(Posta, [pohContract.address, ubiContract.address, maxCharsPosta, burnPct, treasuryPct], {unsafeAllowLinkedLibraries: true})
    // Upgrade Posta
    // const postaV2Contract = await upgrades.upgradeProxy(postaV1Contract.address, PostaV2, { unsafeAllowLinkedLibraries: true })
    return { ubi: ubiContract, poh: pohContract, posta: postaV1Contract };


}

/**
 * 
 * @returns Actor accounts that participate on the test process.
 */
export async function getActors() {
    let accounts: Signer[] = await ethers.getSigners();
    const HUMAN_1 = accounts[0];
    const HUMAN_2 = accounts[1];
    const HUMAN_3 = accounts[2];
    const NOT_REGISTERED_ADDRESS = accounts[3];
    return { HUMAN_1, HUMAN_2, HUMAN_3, NOT_REGISTERED_ADDRESS };
}

/**
 * Creates a new post and returns the token ID
 * @param account 
 * @param content 
 * @param postaContract 
 * @returns 
 */
export async function createPostFrom(account: Signer, content: string, postaContract: Contract): Promise<number> {
    const humanPosta = postaContract.connect(account);
    const receipt = await humanPosta.publishPost(content);
    return receipt.value;
}

export async function supportPostFrom(account: Signer, postTokenId: number, amount: BigNumber, contracts: IContracts) {
    const human2Ubi = contracts.ubi.connect(account);
    const human2Posta = contracts.posta.connect(account);
    await human2Ubi.approve(contracts.posta.address, amount);
    await human2Posta.support(postTokenId, amount);
}