import { useState } from "react";
import { Button } from "react-bootstrap";
import { useHuman } from "../contextProviders/HumanProvider";
import ConnectWalletDialog from "./ConnectWalletDialog";

function getAddressForDisplay(address: string) {
  return (
    address.substring(0, 4) + "..." + address.substring(address.length - 4)
  );
}
export default function ConnectWalletButton(props: any) {
  const human = useHuman();
  const [isConnectDialogVisible, setIsConnectDialogVisible] = useState(false);


  return (
    <>
      <div className={props.className}>
        <Button onClick={() => setIsConnectDialogVisible(true)}>
          {human && !human.isLoading && human.profile && human.profile.registered
            ? `Connected as ${
                human.profile?.display_name
              } (${getAddressForDisplay(human.profile.eth_address || "")})`
            : "Connect"}
        </Button>
      </div>
      <ConnectWalletDialog
        show={isConnectDialogVisible}
        onHide={() => setIsConnectDialogVisible(false)}
      />
    </>
  );
}
