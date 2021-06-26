import PohAPI from "../DAL/PohAPI";

// Cache profiles
const _profilesCache: { [key: string]: POHProfileModel } = {};

async function ensureHumanIsCached(address: string) {
    // Cache profile
    if(!_profilesCache[address]) {
        const human = await PohAPI.profiles.getByAddress(address);
        if(human)
            _profilesCache[address] = human;
    }
}

const PohService = {
    /**
     * Returns a human profile from the PoH API
     * @param address 
     * @returns 
     */
    async getHuman(address: string) {
        // Cache human
        await ensureHumanIsCached(address);
        return _profilesCache[address];
    }
}

export default PohService;