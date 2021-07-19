import Container from "react-bootstrap/Container";

import { Col, Row } from "react-bootstrap";
import { Switch, Route } from "react-router-dom";
import PostPage from "./pages/PostPage";

import AppHeader from "./components/AppHeader";
import MainPage from "./pages/MainPage/MainPage";
import SuperHeader from "./components/SuperHeader";
import DummyPOHController from "./dev-tools/DummyPOHController";
import PostaController from "./dev-tools/PostaController";
import { useWeb3React } from "@web3-react/core";

//const drizzle = new Drizzle(drizzleOptions as IDrizzleOptions);

interface IAppProps {}

export default function App(props: IAppProps) {

  const web3Context = useWeb3React();

  return (
    <>
      <Container className="p-3" style={{ maxWidth: "750px" }}>
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
