import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link, withRouter } from "react-router-dom";
import HumanCard from "../components/HumanCard";
import PostDisplay from "../components/PostDisplay/PostDisplay";
import { usePostaContext } from "../contextProviders/PostaContext";
import { PostaService } from "../posta-lib";

function SupportersPage(props: any) {
  const [humanAddresses, setHumanAddresses] = useState<string[] | null>(null);
  const {postaService} = usePostaContext();
  const tokenId = props.match.params.tokenId;

  async function loadSupporters() {
      if(!tokenId || !postaService) return;
      if(tokenId === "test") return;
      const supportLogs = await postaService.getSupportersOf(BigNumber.from(tokenId), 50);
      supportLogs && setHumanAddresses(supportLogs.map((supportLog: SupportGivenLog) => supportLog.supporter));
  }

  useEffect(() => {
    loadSupporters();
  }, [postaService, tokenId]);

  return (
    <Container>
      <Row>
        <Col>
          <PostDisplay postOrId={tokenId === "test" ? BigNumber.from(1) : BigNumber.from(tokenId)} />
        </Col>
      </Row>
      <Row className="mt-3 mb-0"><Col><h4>Supporters</h4></Col></Row>
      <Row>
        <Col className="d-flex">
          {humanAddresses &&
            humanAddresses.map((address, index) => <Link to={`/human/${address}`} ><HumanCard condensed className="m-1" humanAddress={address} key={index} /></Link>)}
        </Col>
      </Row>
    </Container>
  );
}

export default withRouter(SupportersPage);
