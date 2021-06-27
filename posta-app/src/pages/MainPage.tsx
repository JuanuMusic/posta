import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import PostEditor from "../components/PostEditor";
import PostList from "../components/PostList";
import useHuman from "../hooks/useHuman";

export default function MainPage() {
  const context = useWeb3React<ethers.providers.Web3Provider>();
  const human = useHuman();

  const onNewPostSent = (stackId: number) => {
    //_pendingTransactionStacks.push(stackId);
    //this.processPendingTxs();
  };

  return (
    <Container>
      <Row>
        <Col>
          <PostEditor onNewPostSent={onNewPostSent} human={human} />
        </Col>
      </Row>
      <Row>
        <Col>
          <PostList human={human} />
        </Col>
      </Row>
      {/* <Row>
        <Col>
          <Button onClick={handleStartAccruing}>Start Accruing</Button>
        </Col>
      </Row> */}
    </Container>
  );
}
