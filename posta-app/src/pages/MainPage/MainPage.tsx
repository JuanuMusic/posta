import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import PostEditor from "../../components/PostEditor/PostEditor";
import PostList from "../../components/PostList";
import { useContractProvider } from "../../contextProviders/ContractsProvider";
import { useHuman } from "../../contextProviders/HumanProvider";
import { IPostaNFT, PostaService } from "../../posta-lib/services/PostaService";
import HumanNotRegistered from "./components/HumanNotRegistered";

export default function MainPage() {
  const human = useHuman();
  const [posts, setPosts] = useState<IPostaNFT[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const contractProvider = useContractProvider();
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTokenCount, setTotalTokenCount] = useState(0);

  const refreshPosts = async () => {
    setIsLoadingPosts(true);
    if (!contractProvider) {
      console.warn("Contract provider not set");
      return;
    }
    try {
      const postList = await PostaService.getConsecutivePosts(totalTokenCount - (currentPage * recordsPerPage), recordsPerPage, contractProvider);
      console.log("postList", postList)
      // If list is not null, set to the state
      if (postList) { setPosts(postList);
        setCurrentPage(currentPage+1);
      }
    } catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
    setIsLoadingPosts(false);
  };

  async function onNewPost(author: string, tokenId: BigNumber, value: string) {
    if (!contractProvider) return;
    const newPost = await PostaService.getPosts(
      null,
      [tokenId],
      contractProvider
    );
    if (newPost && newPost.length > 0) appendPost(newPost[0]);
  }

  useEffect(() => {
    async function onContractProviderChanged() {
      if (!contractProvider) return;

      // Update posts count
      const tokenCount = await PostaService.getTokenCounter(contractProvider);
      setTotalTokenCount(tokenCount.toNumber());

      // Refresh the latest posts
      await refreshPosts();

      const contract = await contractProvider.getPostaContractForRead();
      // Subscribe to NewPost evemt
      contract.on("NewPost", onNewPost);

      return () => contract.off("NewPost", onNewPost);
    }

    onContractProviderChanged();
  }, [contractProvider]);

  const appendPost = (post: IPostaNFT) => {
    const newValue = posts.concat([post]);
    setPosts(newValue);
    console.log("NEW VALUE", newValue);
  };

  const onNewPostSent = (stackId: number) => {
    refreshPosts();
  };

  return (
    <Container>
      <Row>
        <Col>
          {human.profile.registered && !human.isLoading && (
            <PostEditor showHeader={true} onNewPostSent={onNewPostSent} />
          )}
          {!human.profile.registered && (
            <HumanNotRegistered isLoading={human.isLoading} />
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <hr className="bg-secondary mx-2 my-3" />
        </Col>
      </Row>
      <Row>
        <Col>
          <PostList posts={posts} isLoading={isLoadingPosts} onNextPage={refreshPosts} hasMore={(currentPage * recordsPerPage) <= totalTokenCount} />
        </Col>
      </Row>
    </Container>
  );
}
