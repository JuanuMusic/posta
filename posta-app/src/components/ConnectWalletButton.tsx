import { useState } from "react";
import { Button } from "react-bootstrap";
import { useHuman } from "../contextProviders/HumanProvider";
import truncateTextMiddle from "../utils/textHelpers";
import ConnectWalletDialog from "./ConnectWalletDialog";

export default function ConnectWalletButton(props: any) {
  const human = useHuman();
  const [isConnectDialogVisible, setIsConnectDialogVisible] = useState(false);


  return (
    <>
      <div className={props.className}>
        <Button variant="warning" onClick={() => setIsConnectDialogVisible(true)}>
          {human && !human.isLoading && human.profile && human.profile.registered
            ? `Connected as ${
                human.profile?.display_name
              } (${truncateTextMiddle(4, human.profile.eth_address || "", 4)})`
            : "Connect as Human"}
        </Button>
      </div>
      <ConnectWalletDialog
        show={isConnectDialogVisible}
        onHide={() => setIsConnectDialogVisible(false)}
      />
    </>
  );
}
