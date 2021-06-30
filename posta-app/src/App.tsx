import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import "./App.css";
import Container from "react-bootstrap/Container";

import useHuman from "./hooks/useHuman";
import { Button, Col, Row } from "react-bootstrap";
import ConnectWalletDialog from "./components/ConnectWalletDialog";
import { ethers } from "ethers";
import { Switch, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import PostPage from "./pages/PostPage";
import useContractProvider from "./hooks/useContractProvider";
import DummyPOHController from "./dev-tools/DummyPOHController";
import PostaController from "./dev-tools/PostaController";
import AppHeader from "./components/AppHeader";
import ConnectWalletButton from "./components/ConnectWalletButton";

//const drizzle = new Drizzle(drizzleOptions as IDrizzleOptions);

interface IAppProps {}

export default function App(props: IAppProps) {
  const [isConnectDialogVisible, setIsConnectDialogVisible] = useState(false);

  return (
    <>
      <ConnectWalletDialog
        show={isConnectDialogVisible}
        onHide={() => setIsConnectDialogVisible(false)}
      />
      <Container className="p-3" style={{ maxWidth: "750px" }}>
        <Row>
          <Col>
              <AppHeader />
              <ConnectWalletButton className="text-right mb-2"
                onConnectButtonClicked={() => setIsConnectDialogVisible(true)}
              />
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

        {/* Control Dummy POH */}
        {/* <Row>
          <Col>
            <DummyPOHController human={human} />
          </Col>
        </Row> */}

        {/* Control Posta Contract */}
        {/* <Row>
          <Col>
            <PostaController owner={human.address} />
          </Col>
        </Row> */}

        {/* Start accruing UBI Dummy */}
        {/* <Row>
        <Col>
          <Button onClick={handleStartAccruing}>Start Accruing</Button>
        </Col>
      </Row> */}
      </Container>
    </>
  );
}
