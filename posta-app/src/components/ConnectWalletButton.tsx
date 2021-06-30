import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { Button } from "react-bootstrap";

export default function ConnectWalletButton(props: any) {
  const context = useWeb3React<ethers.providers.Web3Provider>();
  return (
    <div className={props.className}>
      <Button
        onClick={props.onConnectButtonClicked}
      >
        {context.active
          ? context.account?.substring(0, 4) +
            "..." +
            context.account?.substring(context.account.length - 4)
          : "Connect"}
      </Button>
    </div>
  );
}
