import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import { withRouter } from "react-router-dom";
import HumanCard from "../components/HumanCard";
import PostList from "../components/PostList";
import ProfilePicture, { AvatarSize } from "../components/ProfilePicture";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { ContractProvider, PohService } from "../posta-lib";
import { POHProfileModel } from "../posta-lib/services/PohAPI";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";

function HumanPage(props: any) {
  const [currentHuman, setCurrentHuman] = useState<POHProfileModel | null>(
    null
  );
  const [humanPosts, setHumanPosts] = useState<IPostaNFT[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const contractProvider = useContractProvider();
  const humanAddress = props.match.params.humanAddress as string;

  /**
   * Load posts by human
   */
  async function loadHumanPosts() {
    if (!contractProvider || !humanAddress) return;
    setIsLoadingPosts(true);
    const posts = await PostaService.getPostsBy(humanAddress, contractProvider);
    setHumanPosts(posts);
    setIsLoadingPosts(false);
  }

  useEffect(() => {
    loadHumanPosts();
  }, [humanAddress, contractProvider]);

  return (
    <Container>
      <Row>
        <Col>
          <HumanCard humanAddress={humanAddress} />
        </Col>
      </Row>
      <Row>
        <Col>
          <PostList
            onNextPage={loadHumanPosts}
            hasMore={false}
            isLoading={isLoadingPosts || !humanPosts}
            posts={humanPosts || []}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default withRouter(HumanPage);
