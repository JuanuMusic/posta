import { IContractProvider } from "./ContractProvider";
import { PohAPI, POHProfileModel } from "./PohAPI"

class PohService {
    // Cache profiles
    private _profilesCache: { [key: string]: POHProfileModel } = {};
    private _pohApi: PohAPI;
    private _contractProvider: IContractProvider;


    constructor(api: PohAPI | string, contractProvider: IContractProvider) {
        if(typeof api === "string") {
            this._pohApi = new PohAPI(api);
        } else {
            this._pohApi = api;
        }

        this._contractProvider = contractProvider;
    }


    /**
     * Returns a human profile from the PoH API
     * @param address 
     * @returns 
     */
    async getHuman(address: string) {
        // Resolve in case it's an ens name
        const resolvedAddress = address.toLowerCase().endsWith(".eth") ? await this._contractProvider.ethersProvider.resolveName(address) : address;

        // Cache profile
        if (!this._profilesCache[address]) {
            const human = await this._pohApi.getProfileByAddress(resolvedAddress);
            if (human)
                this._profilesCache[address] = human;
        }

        // Return cached profile
        return this._profilesCache[address];
    }

    async isRegistered(address: string) {
        const poh = await this._contractProvider.getPohContractForRead();
        return await poh.isRegistered(address);
    }


}

export { PohService };