import { IContractProvider } from "./ContractProvider";
import { PohAPI, POHProfileModel } from "./PohAPI"

// Cache profiles
const _profilesCache: { [key: string]: POHProfileModel } = {};


async function ensureHumanIsCached(address: string) {
    // Cache profile
    if (!_profilesCache[address]) {
        const human = await PohAPI.profiles.getByAddress(address);
        if (human)
            _profilesCache[address] = human;
    }
}

const PohService = {
    /**
     * Returns a human profile from the PoH API
     * @param address 
     * @returns 
     */
    async getHuman(address: string, contractProvider: IContractProvider) {
        // Resolve in case it's an ens name
        const resolvedAddress = address.toLowerCase().endsWith(".eth") ? await contractProvider.ethersProvider.resolveName(address) : address;
        // Cache human
        await ensureHumanIsCached(resolvedAddress);
        return _profilesCache[address];
    },

    async isRegistered(address: string, contractProvider: IContractProvider) {
        const poh = await contractProvider.getPohContractForRead();
        return await poh.isRegistered(address);
    }

}

export { PohService };