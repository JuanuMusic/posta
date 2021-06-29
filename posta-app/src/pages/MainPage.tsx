import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import PostEditor from "../components/PostEditor";
import PostList from "../components/PostList";
import useContractProvider from "../hooks/useContractProvider";
import useHuman from "../hooks/useHuman";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";

export default function MainPage() {
  const context = useWeb3React<ethers.providers.Web3Provider>();
  const human = useHuman();
  const [posts, setPosts] = useState<IPostaNFT[]>([]);
  const contractProvider = useContractProvider();

  const refreshLatestPosts = async () => {
    if(!contractProvider) {
      console.warn("Contract provider not set");
      return;
    }
    try {
      const postList = await PostaService.getLatestPosts(10, contractProvider);
      console.log(postList);
      setPosts(postList);
    } catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
  }

  useEffect(() => {
    refreshLatestPosts();
  }, [contractProvider]);

  const onNewPostSent = (stackId: number) => {
    //_pendingTransactionStacks.push(stackId);
    refreshLatestPosts()
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
