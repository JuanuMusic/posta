import { ethers, upgrades } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { ParamType } from "ethers/lib/utils";

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

    const Posta = await ethers.getContractFactory("Posta");

    // Deploy contracts
    const ubiContract = await UBI.deploy();
    const pohContract = await ProofOfHumanity.deploy(pohGovernor, ubiContract.address);
    // Deploy Posta
    const postaV1Contract = await upgrades.deployProxy(Posta, [pohContract.address, ubiContract.address, maxCharsPosta, burnPct, treasuryPct])
    // Upgrade Posta
    const PostaV0_8 = await ethers.getContractFactory("PostaV0_8");
    const postaV0_8Contract = await upgrades.upgradeProxy(postaV1Contract.address, PostaV0_8)
    return { ubi: ubiContract, poh: pohContract, posta: postaV0_8Contract };


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
export async function createPostFrom(account: Signer, content: string, isReplyOfTokenId: number | null, postaContract: Contract): Promise<void> {
    const humanPosta = postaContract.connect(account);
    const transaction = await humanPosta.publishPost(content, isReplyOfTokenId || "0");
    return transaction;
}


export async function supportPostFrom(account: Signer, postTokenId: string, amount: BigNumber, contracts: IContracts) {
    const human2Ubi = contracts.ubi.connect(account);
    const human2Posta = contracts.posta.connect(account);
    await human2Ubi.approve(contracts.posta.address, amount);
    await human2Posta.support(postTokenId, amount);
}

export async function publishPostOnBehalfOf(funder: Signer, signer: Signer, postText: string, isReplyOfTokenId: string, signature: any, nonce: number, postaContract: Contract) {
    const funderPosta = postaContract.connect(funder);
    const authorAddress = await signer.getAddress();
    return await funderPosta.publishOnBehalfOf(postText, authorAddress, isReplyOfTokenId, nonce, signature);
}

export async function signMessage(types: readonly (string | ParamType)[], data: any[], signer: Signer): Promise<string> {
    
    // 66 byte string, which represents 32 bytes of data
    //let messageHash = ethers.utils.solidityKeccak256(payL);
    let payload = ethers.utils.defaultAbiCoder.encode(types, data);
    let payloadHash = ethers.utils.keccak256(payload);

    // See the note in the Solidity; basically this would save 6 gas and
    // can potentially add security vulnerabilities in the future
    // let payloadHash = ethers.utils.solidityKeccak256([ "bytes32", "string" ], [ someHash, someDescr ]);

    // This adds the message prefix
    let signature = await signer.signMessage(ethers.utils.arrayify(payloadHash));
    return signature;
}
