import { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import PostEditor from "../../components/PostEditor/PostEditor";
import PostList from "../../components/PostList";
import { useHuman } from "../../contextProviders/HumanProvider";
import useContractProvider from "../../hooks/useContractProvider";
import { IPostaNFT, PostaService } from "../../posta-lib/services/PostaService";
import HumanNotRegistered from "./components/HumanNotRegistered";

export default function MainPage() {
  console.log("Rendering MainPage")
  const human = useHuman();
  const [posts, setPosts] = useState<IPostaNFT[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const contractProvider = useContractProvider();

  const refreshLatestPosts = async () => {
    setIsLoadingPosts(true);
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
    setIsLoadingPosts(false);
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
    refreshLatestPosts();
  };

  return (
    <Container>
      <Row>
        <Col>
        {(human.profile.registered && !human.isLoading) && (<PostEditor onNewPostSent={onNewPostSent} />)}
        {(!human.profile.registered) && (<HumanNotRegistered isLoading={human.isLoading} />)}
        </Col>
      </Row>
      <Row><Col><hr className="bg-secondary mx-2 my-3" /></Col></Row>
      <Row>
        <Col>
          <PostList posts={posts} isLoading={isLoadingPosts} />
        </Col>
      </Row>
    </Container>
  );
}
