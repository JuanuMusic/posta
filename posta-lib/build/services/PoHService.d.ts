import { POHProfileModel } from "./PohAPI";
declare const PohService: {
    /**
     * Returns a human profile from the PoH API
     * @param address
     * @returns
     */
    getHuman(address: string): Promise<POHProfileModel>;
};
export { PohService };
