import Container from "react-bootstrap/Container";

import { Card, Col, Row } from "react-bootstrap";
import { Switch, Route } from "react-router-dom";
import PostPage from "./pages/PostPage";

import AppHeader from "./components/AppHeader";
import MainPage from "./pages/MainPage/MainPage";
import SuperHeader from "./components/SuperHeader";
import DummyPOHController from "./dev-tools/DummyPOHController";
import PostaController from "./dev-tools/PostaController";
import { useWeb3React } from "@web3-react/core";
import RecentSupporters from "./components/RecentSupporters/RecentSupporters";
import HumanPage from "./pages/HumanPage";
import SupportersPage from "./pages/SupportersPage";
import ContractSettings from "./components/ContractSettings";

//const drizzle = new Drizzle(drizzleOptions as IDrizzleOptions);

interface IAppProps {}

export default function App(props: IAppProps) {
  const web3Context = useWeb3React();

  return (
    <>
      <Container>
        <Row>
          <Col md={8} lg={9}>
            <Container>
              <Row>
                <Col className="d-flex flex-row-reverse">
                  <SuperHeader />
                </Col>
              </Row>
              <Row>
                <Col>
                  <AppHeader className="mb-4" />
                </Col>
              </Row>
              <Row>
                <Col>
                  <Switch>
                    <Route path="/post/:tokenId/supporters">
                      <SupportersPage />
                    </Route>
                    <Route path="/post/:tokenId">
                      <PostPage />
                    </Route>
                    <Route path="/human/:humanAddress">
                      <HumanPage />
                    </Route>
                    <Route path="/">
                      <MainPage />
                    </Route>
                  </Switch>
                </Col>
              </Row>
            </Container>
          </Col>
          <Col md={4} lg={3}>
            <div className="d-none d-sm-none d-md-block">
              <ContractSettings className="mt-5" />
              <RecentSupporters className="mt-2" />
            </div>
          </Col>
        </Row>

        {/* Control Dummy POH */}
        {/* <Row>
          <Col>
            <DummyPOHController />
          </Col>
        </Row> */}

        {/* Control Posta Contract */}
        {/* <Row>
          <Col>
            <PostaController owner={web3Context.account || ""} />
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
