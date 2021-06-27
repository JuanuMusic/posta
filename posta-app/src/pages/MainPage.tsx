import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import PostEditor from "../components/PostEditor";
import PostList from "../components/PostList";
import useHuman from "../hooks/useHuman";
import configService from "../services/configService";
import PostaService from "../services/PostaService";

export default function MainPage() {
  const context = useWeb3React<ethers.providers.Web3Provider>();
  const human = useHuman();
  const [posts, setPosts] = useState([] as IPostaNFT[]);

  const refreshLatestPost = async () => {
    try {
      const postList = await PostaService.getLatestPosts(10, configService.getEthersProvider());
      setPosts(postList);
    } catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
  }

  useEffect(() => {
    refreshLatestPost();
  }, []);

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
          <PostList human={human} posts={posts} />
        </Col>
      </Row>
    </Container>
  );
}
