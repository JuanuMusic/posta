import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { PohAPI, POHProfileModel } from "../posta-lib/services/PohAPI";

/**
 * Not as evil as it sounds.
 * Hook to handle the human based on the currently selected wallet address.
 */
export default function useHumanHook() {
  const [profile, setProfile] = useState<POHProfileModel | null>();
  const [isLoading, setIsLoading] = useState(false);
  const context = useWeb3React()

  // Try to fetch data of the user and if its human, set registered as true.
  const setHumanAccount = async (account: string) => {
    console.log("Loading human...");
    setIsLoading(true);
    try {
      // Get the registered profile and log a warning in case not found
      const registeredProfile = await PohAPI.profiles.getByAddress(account);
      if (!registeredProfile || !registeredProfile.registered) {
        console.warn("Address", account, "not registered as human", registeredProfile);
        return;
      }
      setProfile(registeredProfile);
    } catch (err) {
      console.error("Error loading human account", err);
    }
    setIsLoading(false);
  }

  // useEffect(() => {
  //   window.ethereum.
  // }

  useEffect(() => {
    if (context.error) console.error("Web3 context Error", context.error);
  }, [context.error])

  // Wen account changes, update the human account.
  useEffect(() => {
    console.log("Account changed",context.account);
    if (!context.account) return;
    if ((!isLoading && !profile) ||
      (!isLoading && profile && context.account !== profile.eth_address)) {
      setHumanAccount(context.account);
    }
  }, [context.account])

  const isHuman = !isLoading && !!profile && !!profile.registered;

  return { address: context.account, profile, isLoading, isHuman, error: context.error };
}
