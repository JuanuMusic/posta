import React, { useEffect, useReducer, useState } from "react";
import {
  Web3ReactProvider,
  useWeb3React,
  UnsupportedChainIdError,
} from "@web3-react/core";
import "./App.css";
import Container from "react-bootstrap/Container";
import PostEditor from "./components/PostEditor";
import PostList from "./components/PostList";
import PohAPI from "./DAL/PohAPI";
import DummyPOHController from "./DummyPOHController";
//import { InjectedConnector } from "@web3-react/injected-connector";
import { Web3Provider } from "@ethersproject/providers";
//import useEagerConnect from "./hooks/useEagerConnect";
import useHuman from "./hooks/useHuman";
import { Button, Col, Row } from "react-bootstrap";
import ConnectWalletDialog from "./components/ConnectWalletDialog";
import { convertToObject } from "typescript";
import configService, { IConfiguration } from "./services/configService";
import UBIService from "./services/UBIService";
import { ethers } from "ethers";
import { Switch, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import PostPage from "./pages/PostPage";

//const drizzle = new Drizzle(drizzleOptions as IDrizzleOptions);

interface IAppProps {}

interface IAppState {
  config: IConfiguration | undefined;
}

function appReducer(state: IAppState, action: any) {}

export default function App(props: IAppProps) {
  const [isConnectDialogVisible, setIsConnectDialogVisible] = useState(false);
  const [appState, dispatch] = useReducer<any, IAppState>(
    appReducer,
    {} as IAppState,
    (s: IAppState) => {}
  );

  const human = useHuman();
  const context = useWeb3React<Web3Provider>();

  // CONFIG
  // useEffect(() => {
  //   if(context.chainId && context.library.provider && context.libr)
  //   const config = configService.getConfig();
  //   dispatch({ con });
  // }, []);

  const handleStartAccruing = async () => {
    await UBIService.startAccruing(
      human.address,
      new ethers.providers.Web3Provider(context.library?.provider!)
    );
  };
  return (
    <>
      <ConnectWalletDialog
        show={isConnectDialogVisible}
        onHide={() => setIsConnectDialogVisible(false)}
      />
      <Container className="p-3" style={{ maxWidth: "750px" }}>
        <Row>
          <Col>
            <h1>Posta</h1>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <Button
              className=""
              onClick={() => setIsConnectDialogVisible(true)}
            >
              {context.active
                ? context.account?.substring(0, 4) +
                  "..." +
                  context.account?.substring(context.account.length - 4)
                : "Connect"}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Switch>
              <Route path="/post/:tokenId">
                <PostPage />
              </Route>
              <Route path="/">
                <MainPage />
              </Route>
            </Switch>
          </Col>
        </Row>
        <Row>
          <Col><DummyPOHController human={human} /></Col>
        </Row>
      </Container>
    </>
  );
}
