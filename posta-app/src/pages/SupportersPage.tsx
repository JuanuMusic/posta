import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link, withRouter } from "react-router-dom";
import HumanCard from "../components/HumanCard";
import PostDisplay from "../components/PostDisplay/PostDisplay";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { PostaService } from "../posta-lib";

function SupportersPage(props: any) {
  const [humanAddresses, setHumanAddresses] = useState<string[] | null>(null);
  const contractProvider = useContractProvider();
  const tokenId = props.match.params.tokenId;

  async function loadSupporters() {
      if(!tokenId || !contractProvider) return;
      const supportLogs = await PostaService.getSupportersOf(BigNumber.from(tokenId), 50, contractProvider);
      supportLogs && setHumanAddresses(supportLogs.map((supportLog: SupportGivenLog) => supportLog.supporter));
  }

  useEffect(() => {
    loadSupporters();
  }, [contractProvider, tokenId]);

  return (
    <Container>
      <Row>
        <Col>
          <PostDisplay postOrId={BigNumber.from(tokenId)} />
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
