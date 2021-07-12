import { IContractProvider } from "./ContractProvider";
import { POHProfileModel } from "./PohAPI";
declare const PohService: {
    /**
     * Returns a human profile from the PoH API
     * @param address
     * @returns
     */
    getHuman(address: string): Promise<POHProfileModel>;
    isRegistered(address: string, contractProvider: IContractProvider): Promise<any>;
};
export { PohService };
