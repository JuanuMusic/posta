import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostDisplay from "../components/PostDisplay";
import { useContractProvider } from "../contextProviders/ContractsProvider";
import { IPostaNFT, PostaService } from "../posta-lib/services/PostaService";

export default function PostPage(props: any) {
  const [post, setPost] = useState<IPostaNFT>();
  const { tokenId } = useParams<{ tokenId: string }>();
  const contractProvider = useContractProvider();
  const [isLoading, setIsLoading] = useState(false);

  async function init() {
    if (!contractProvider) return;
    setIsLoading(true);
    
    // Get the post with the specific token id
    const post = await PostaService.getPosts([tokenId], contractProvider);
    if (post && post.length > 0) {
      setPost(post[0]);
    }

    setIsLoading(false);
  }

  // Initialize page when library is available
  useEffect(() => {
    init();
  }, [contractProvider]);

  const handleBurnUBIsClicked = () => console.log("TODO");
  const handleReplyClicked = () => console.log("TODO");

  return (
    <>
      {isLoading
        ? "Loading..."
        : (post && (
            <PostDisplay
              postOrId={post}
              onBurnUBIsClicked={handleBurnUBIsClicked}
              onReplyClicked={handleReplyClicked}
            />
          )) ||
          "Not found"}
    </>
  );
}
