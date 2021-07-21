import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { FaGithub, FaQuestion } from "react-icons/fa";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { PostaService } from "../posta-lib";

export default function SuperHeader(props: any) {
  const [burnPct, setBurnPct] = useState("");
  const contractProvider = useContractProvider();
  useEffect(() => {
    async function refreshBurnPct() {
      if(!contractProvider) return;
      const burnPct = await PostaService.getBurnPct(contractProvider);
      setBurnPct(burnPct.toString());
    }

    refreshBurnPct();
  }, [contractProvider]);
  return (
    <div {...props}>
      <a
        className="p-2"
        href="https://github.com/JuanuMusic/posta/blob/main/README.md"
        target="_blank"
      >
        <FaQuestion size={12} className="text-light" />
      </a>
      <a
        className="p-2"
        href="https://github.com/juanumusic/posta"
        target="_blank"
      >
        <FaGithub size={12} className="text-light" />
      </a>
      <small>| UBI burn factor: {burnPct && ethers.utils.formatEther(burnPct)}</small>
    </div>
  );
}
