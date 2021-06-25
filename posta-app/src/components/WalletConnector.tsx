import React from "react";
import { newContextComponents } from "@drizzle/react-components";

interface IWalletConnectorProps {
  walletInstance: any;
}

export default class WalletConnector extends React.Component<
  IWalletConnectorProps,
  any
> {
  constructor(props: any) {
    super(props);
  }


  render() {
      return(<></>);
  }
}
