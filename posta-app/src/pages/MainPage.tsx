import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { stringify } from "querystring";
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
    if (!contractProvider) {
      console.warn("Contract provider not set");
      return;
    }
    try {
      // Get the last 10 posts
      const postList = await PostaService.getLatestPosts(10, contractProvider);
      console.log(postList);
      // If list is not null, set to the state
      if (postList) setPosts(postList);
    } catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
  };

  useEffect(() => {
    async function onContractProviderChanged() {
      if (!contractProvider) return;
      
      // Refresh the latest posts
      await refreshLatestPosts();
      
      // Subscribe to NewPost evemt
      (await contractProvider.getPostaContractForRead()).on(
        "NewPost",
        async (author: string, tokenId: number, value: string) => {
          console.log("NewPost received", author, tokenId, value);      
          const log = await PostaService.getPostLogs([tokenId], contractProvider);
          if(log && log.length > 0)
            appendPost(await PostaService.buildPost(log[0], contractProvider));
        }
      );
    }

    onContractProviderChanged();
  }, [contractProvider]);

  const appendPost = (post: IPostaNFT) => {
    setPosts([...posts, post]);
  }

  const onNewPostSent = (stackId: number) => {
    //_pendingTransactionStacks.push(stackId);
    refreshLatestPosts();
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
