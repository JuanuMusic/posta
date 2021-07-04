import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import { WalletConnectConnectorArguments } from "@web3-react/walletconnect-connector";
import { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { injected } from "../connectors";
import { Web3Provider } from "@ethersproject/providers";
import { ReactComponent as MetamaskLogo } from "../assets/metamask-fox.svg";

interface IConnectWalletDialogProps {
  show: boolean;
  onHide(): void;
}

enum ConnectorNames {
  Injected = "MetaMask",
  //   Network = "Network",
  //   WalletConnect = "WalletConnect",
  //   WalletLink = "WalletLink",
  //   Ledger = "Ledger",
  //   Trezor = "Trezor",
  //   Lattice = "Lattice",
  //   Frame = "Frame",
  //   Authereum = "Authereum",
  //   Fortmatic = "Fortmatic",
  //   Magic = "Magic",
  //   Portis = "Portis",
  //   Torus = "Torus",
}

const connectorImages: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: MetamaskLogo,
};

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  //   [ConnectorNames.Network]: network,
  //   [ConnectorNames.WalletConnect]: walletconnect,
  //   [ConnectorNames.WalletLink]: walletlink,
  //   [ConnectorNames.Ledger]: ledger,
  //   [ConnectorNames.Trezor]: trezor,
  //   [ConnectorNames.Lattice]: lattice,
  //   [ConnectorNames.Frame]: frame,
  //   [ConnectorNames.Authereum]: authereum,
  //   [ConnectorNames.Fortmatic]: fortmatic,
  //   [ConnectorNames.Magic]: magic,
  //   [ConnectorNames.Portis]: portis,
  //   [ConnectorNames.Torus]: torus,
};

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
    //   } else if (
    //     error instanceof UserRejectedRequestErrorInjected ||
    //     error instanceof UserRejectedRequestErrorWalletConnect ||
    //     error instanceof UserRejectedRequestErrorFrame
    //   ) {
    //     return "Please authorize this website to access your Ethereum account.";
  } else {
    console.error(error);
    return "An unknown error occurred. Check the console for more details.";
  }
}

export default function ConnectWalletDialog(props: IConnectWalletDialogProps) {
  const context = useWeb3React<Web3Provider>();
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = context;
  const [activatingConnector, setActivatingConnector] = useState();

  const handleHide = () => {
    props.onHide && props.onHide();
  };

  useEffect(() => {
    handleHide && handleHide();
  }, [account]);

  return (
    <Modal show={props.show} onHide={handleHide} centered>
      <Modal.Header>
        <Modal.Title>Connect your wallet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          When connecting, make sure to select the address you used to register
          on Proof of Humanity
        </p>
        <div className="w-100 d-flex justify-content-center align-items-center">
          {Object.keys(connectorsByName).map((name: string) => {
            const currentConnector = connectorsByName[name as ConnectorNames];
            const activating = currentConnector === activatingConnector;
            const connected = currentConnector === connector;
            const disabled = !!activatingConnector || connected || !!error;

            return (
              <Button
                style={{
                  borderColor: activating
                    ? "orange"
                    : connected
                    ? "green"
                    : "unset",
                  cursor: disabled ? "unset" : "pointer",
                  position: "relative",
                }}
                disabled={disabled}
                key={name}
                onClick={() => {
                  setActivatingConnector(currentConnector);
                  activate(connectorsByName[name as ConnectorNames]);
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    color: "black",
                  }}
                >
                  {activating && (
                    <Spinner
                      animation="border"
                      role="status"
                      // style={{ height: "25%", marginLeft: "-1rem" }}
                    >
                      <span className="sr-only">Loading...</span>
                    </Spinner>
                  )}
                  {/* {connected && (
                  <span role="img" aria-label="check">
                    ✅
                  </span>
                )} */}
                </div>
                <div>
                    <MetamaskLogo className="wallet-logo" />{" "}
                    {name}
                </div>
              </Button>
            );
          })}
        </div>
        <div className="w-100 text-center my-2">
          <small className="text-muted">
            Other wallets will be added soon...
          </small>
        </div>
      </Modal.Body>
    </Modal>
  );
}
