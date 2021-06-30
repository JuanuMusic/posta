import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { injected } from "../connectors";
import { PohAPI, POHProfileModel } from "../posta-lib/services/PohAPI";
import useEagerConnect from "./useEagerConnect";

/**
 * Not as evil as it sounds.
 * Hook to handle the human based on the currently selected wallet address.
 */
export default function useHuman() {
  const [address, setAddress] = useState("");
  const [profile, setProfile] = useState({} as POHProfileModel);
  const [isLoading, setIsLoading] = useState(true);
  const triedEager = useEagerConnect()
  const context = useWeb3React()
  const { active, error, activate, account } = context;
  const handleAccountsChanged = async (accounts: string[]) => {
    const newAccount = accounts[0];
    if (newAccount !== address) {
      setHumanAccount(newAccount);
    }
  }

  const setHumanAccount = async (account: string) => {
    setIsLoading(true);
    const registeredProfile = await PohAPI.profiles.getByAddress(account);
    if (!registeredProfile || !registeredProfile.registered)
      console.warn("Address", account, "not registered as human");

    activate(injected);
    setAddress(account);
    if(registeredProfile)
      setProfile(registeredProfile);
    setIsLoading(false);
  }

  useEffect(() => {
    if (account) setHumanAccount(account);
  }, [account])

  useEffect(() => {
    const ethereum = ((window as any).ethereum as any);
    ethereum && ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );
  }, [((window as any).ethereum as any)]);

  return { address, profile, isLoading };
}
