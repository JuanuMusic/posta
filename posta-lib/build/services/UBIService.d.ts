import { IContractProvider } from "./ContractProvider";
declare const UBIService: {
    /**
     * Returns the UBI balance of an account.
     * @param address
     * @param provider
     * @returns
     */
    balanceOf(address: string, contractProvider: IContractProvider): Promise<any>;
    /** Call to Start accruing UBI  */
    startAccruing(address: string, contractProvider: IContractProvider): Promise<any>;
};
export { UBIService };
