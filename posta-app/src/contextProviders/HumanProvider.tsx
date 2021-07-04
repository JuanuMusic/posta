import { useWeb3React } from "@web3-react/core";
import { useContext, useEffect } from "react";
import { createContext, useState } from "react";
import { PohAPI, POHProfileModel } from "../posta-lib/services/PohAPI";

const EMPTY_POH_PROFILE = { display_name: "", first_name: "", last_name: "" };

const context = createContext<{ profile: POHProfileModel; isLoading: boolean }>(
  {
    profile: EMPTY_POH_PROFILE,
    isLoading: false,
  }
);
export default function HumanProvider({ children }: { children: any }) {
  const [profile, setProfile] = useState<POHProfileModel>(EMPTY_POH_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const web3Context = useWeb3React();
  const human = { profile, isLoading };

  /**
   * Executes when the web3 context changes
   */
  useEffect(() => {
    if (!web3Context.account) return;
    if (web3Context.error) {
      console.error("Web3 Context error:", web3Context.error.message);
    }

    loadHumanAccount(web3Context.account);
  }, [web3Context]);

  /**
   * Try to load a human account from an address.
   * @param address
   */
  const loadHumanAccount = async (address: string) => {
    setIsLoading(true);
    try {
      // Get the registered profile and log a warning in case not found
      const registeredProfile = await PohAPI.profiles.getByAddress(address);
      // If profile is not registered, warn and set to empty POH profile.
      if (!registeredProfile || !registeredProfile.registered) {
        console.warn(
          "Address",
          address,
          "not registered as human",
          registeredProfile
        );
        setProfile(EMPTY_POH_PROFILE);
      } else {
        setProfile(registeredProfile);
      }
    } catch (err) {
      console.error("Error loading human account", err);
    }
    setIsLoading(false);
  };

  return <context.Provider value={human}>{children}</context.Provider>;
}

HumanProvider.context = context;

export function useHuman() {
  // Get data about the human by calling useContext()
  return useContext(HumanProvider.context);
}
