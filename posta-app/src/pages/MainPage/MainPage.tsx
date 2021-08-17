import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import PostEditor from "../../components/PostEditor/PostEditor";
import PostList from "../../components/PostList";
import { usePostaContext } from "../../contextProviders/PostaContext";
import { useHuman } from "../../contextProviders/HumanProvider";
import { IPostaNFT, PostaService } from "../../posta-lib/services/PostaService";
import HumanNotRegistered from "./components/HumanNotRegistered";

export default function MainPage() {
  const human = useHuman();
  const [posts, setPosts] = useState<IPostaNFT[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const {postaService, contractProvider} = usePostaContext();
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalTokenCount, setTotalTokenCount] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const refreshPosts = async () => {
    setIsLoadingPosts(true);
    if (!postaService) {
      console.warn("Contract provider not set");
      return;
    }
    try {
      const postList = await postaService.getConsecutivePosts(
        totalTokenCount - currentPage * recordsPerPage,
        recordsPerPage
      );
      console.log("postList", postList);
      // If list is not null, set to the state
      if (postList) {
        setCurrentPage(currentPage + 1);
        const newList = posts.concat(postList);
        setPosts(newList);

        // Has more posts if last item is greater than 1
        setHasMorePosts(postList[postList.length -1].tokenId.toNumber() > 1);
      }
    } catch (error) {
      console.error(error.message);
      console.error(error.stack);
    }
    setIsLoadingPosts(false);
  };

  async function onNewPost(author: string, tokenId: BigNumber, value: string) {
    if (!postaService) return;
    const newPost = await postaService.getPosts(
      null,
      [tokenId]
    );
    if (newPost && newPost.length > 0) appendPost(newPost[0]);
  }

  useEffect(() => {
    async function onContractProviderChanged() {
      if (!postaService) return;

      // Update posts count
      const tokenCount = await postaService.getTokenCounter();
      setTotalTokenCount(tokenCount.toNumber());

      // Refresh the latest posts
      await refreshPosts();

      if(!contractProvider) return;
      const contract = await contractProvider.getPostaContractForRead();
      // Subscribe to NewPost evemt
      contract.on("NewPost", onNewPost);

      return () => contract.off("NewPost", onNewPost);
    }

    onContractProviderChanged();
  }, [postaService]);

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
          <PostList
            posts={posts}
            isLoading={isLoadingPosts}
            onNextPage={refreshPosts}
            hasMore={hasMorePosts}
          />
        </Col>
      </Row>
    </Container>
  );
}
