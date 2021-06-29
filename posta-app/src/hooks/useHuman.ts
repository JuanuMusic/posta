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
    const registeredProfile = await PohAPI.profiles.getByAddress(account);
    if (!registeredProfile || !registeredProfile.registered)
      console.warn("Address", account, "not registered as human");

    activate(injected);
    setAddress(account);
    setProfile(registeredProfile || { registered: true, eth_address: account, status: "REGISTERED", display_name: "Juanu", first_name: "Juanu", last_name: "Haedo", bio: "Just a DEV", profile: "A profile", creation_time: new Date(), photo: "", video: "", registered_time: new Date() });
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
  }, [active]);

  return { address, profile };
}
